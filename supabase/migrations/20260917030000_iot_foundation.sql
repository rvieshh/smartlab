-- SmartLab IoT data foundation
-- Non-destructive: creates only SmartLab monitoring entities and policies.

create extension if not exists pgcrypto;

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  device_identifier text not null unique check (device_identifier ~ '^[a-zA-Z0-9][a-zA-Z0-9_-]{2,63}$'),
  name text not null check (char_length(name) between 1 and 100),
  device_type text not null check (char_length(device_type) between 1 and 50),
  status text not null default 'offline' check (status in ('online', 'offline', 'warning')),
  connection_type text not null default 'wifi' check (connection_type in ('wifi', 'i2c', 'gpio', 'analog')),
  firmware_version text,
  ip_address inet,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Device credentials are isolated from dashboard-readable device metadata.
create table if not exists public.device_credentials (
  device_id uuid primary key references public.devices(id) on delete cascade,
  api_key_hash text not null check (api_key_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);

create table if not exists public.sensor_readings (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  temperature double precision check (temperature is null or temperature between -50 and 100),
  humidity double precision check (humidity is null or humidity between 0 and 100),
  occupancy boolean,
  light boolean,
  ac boolean,
  power double precision check (power is null or power between 0 and 100000),
  created_at timestamptz not null default now()
);

create table if not exists public.monitoring_events (
  id uuid primary key default gen_random_uuid(),
  device_id uuid references public.devices(id) on delete set null,
  event_type text not null check (event_type in (
    'device_online', 'device_offline', 'occupancy_changed',
    'power_threshold', 'system_event'
  )),
  recorded_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists sensor_readings_device_recorded_idx
  on public.sensor_readings (device_id, recorded_at desc);
create index if not exists sensor_readings_recorded_idx
  on public.sensor_readings (recorded_at desc);
create index if not exists monitoring_events_device_recorded_idx
  on public.monitoring_events (device_id, recorded_at desc);
create index if not exists monitoring_events_recorded_idx
  on public.monitoring_events (recorded_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists devices_set_updated_at on public.devices;
create trigger devices_set_updated_at
before update on public.devices
for each row execute function public.set_updated_at();

alter table public.devices enable row level security;
alter table public.device_credentials enable row level security;
alter table public.sensor_readings enable row level security;
alter table public.monitoring_events enable row level security;

-- Authenticated dashboard users can read monitoring data. No browser writes.
drop policy if exists "authenticated_read_devices" on public.devices;
create policy "authenticated_read_devices" on public.devices
  for select to authenticated using (true);
drop policy if exists "authenticated_read_sensor_readings" on public.sensor_readings;
create policy "authenticated_read_sensor_readings" on public.sensor_readings
  for select to authenticated using (true);
drop policy if exists "authenticated_read_monitoring_events" on public.monitoring_events;
create policy "authenticated_read_monitoring_events" on public.monitoring_events
  for select to authenticated using (true);

-- Credential table intentionally has no authenticated/anon policy.
revoke all on public.device_credentials from anon, authenticated;

-- Transactional telemetry write and meaningful event creation.
create or replace function public.ingest_device_telemetry(
  p_device_id uuid,
  p_recorded_at timestamptz,
  p_temperature double precision,
  p_humidity double precision,
  p_occupancy boolean,
  p_light boolean,
  p_ac boolean,
  p_power double precision,
  p_ip_address inet,
  p_offline_after_seconds integer,
  p_min_interval_seconds integer,
  p_power_event_delta double precision default 250
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device public.devices%rowtype;
  v_previous public.sensor_readings%rowtype;
  v_reading_id uuid;
  v_was_offline boolean;
begin
  select * into v_device from public.devices where id = p_device_id for update;
  if not found then raise exception 'unknown_device'; end if;

  if v_device.last_seen_at is not null
     and v_device.last_seen_at > now() - make_interval(secs => p_min_interval_seconds) then
    raise exception 'telemetry_rate_limited';
  end if;

  select * into v_previous
  from public.sensor_readings
  where device_id = p_device_id
  order by recorded_at desc
  limit 1;

  v_was_offline := v_device.status <> 'online'
    or v_device.last_seen_at is null
    or v_device.last_seen_at < now() - make_interval(secs => p_offline_after_seconds);

  update public.devices
  set status = 'online', last_seen_at = now(), ip_address = coalesce(p_ip_address, ip_address)
  where id = p_device_id;

  insert into public.sensor_readings (
    device_id, recorded_at, temperature, humidity, occupancy, light, ac, power
  ) values (
    p_device_id, p_recorded_at, p_temperature, p_humidity, p_occupancy, p_light, p_ac, p_power
  ) returning id into v_reading_id;

  if v_was_offline then
    insert into public.monitoring_events (device_id, event_type, metadata)
    values (p_device_id, 'device_online', jsonb_build_object('device_name', v_device.name));
  end if;

  if v_previous.id is not null and v_previous.occupancy is distinct from p_occupancy then
    insert into public.monitoring_events (device_id, event_type, metadata)
    values (p_device_id, 'occupancy_changed', jsonb_build_object('device_name', v_device.name, 'from', v_previous.occupancy, 'to', p_occupancy));
  end if;

  if v_previous.id is not null and v_previous.power is not null
     and abs(v_previous.power - p_power) >= p_power_event_delta then
    insert into public.monitoring_events (device_id, event_type, metadata)
    values (p_device_id, 'power_threshold', jsonb_build_object('device_name', v_device.name, 'previous', v_previous.power, 'current', p_power));
  end if;

  return v_reading_id;
end;
$$;

-- Lazy status evaluation avoids a background worker in the prototype.
create or replace function public.refresh_stale_devices(p_offline_after_seconds integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
  v_device record;
begin
  for v_device in
    select id, name from public.devices
    where status <> 'offline'
      and (last_seen_at is null or last_seen_at < now() - make_interval(secs => p_offline_after_seconds))
    for update
  loop
    update public.devices set status = 'offline' where id = v_device.id;
    insert into public.monitoring_events (device_id, event_type, metadata)
    values (v_device.id, 'device_offline', jsonb_build_object('device_name', v_device.name));
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

revoke all on function public.ingest_device_telemetry(uuid,timestamptz,double precision,double precision,boolean,boolean,boolean,double precision,inet,integer,integer,double precision) from public, anon, authenticated;
revoke all on function public.refresh_stale_devices(integer) from public, anon, authenticated;
grant execute on function public.ingest_device_telemetry(uuid,timestamptz,double precision,double precision,boolean,boolean,boolean,double precision,inet,integer,integer,double precision) to service_role;
grant execute on function public.refresh_stale_devices(integer) to service_role;

create or replace function public.get_sensor_history(
  p_range_hours integer,
  p_bucket_seconds integer
) returns table (
  id uuid,
  recorded_at timestamptz,
  temperature double precision,
  humidity double precision,
  occupancy boolean,
  light boolean,
  ac boolean,
  power double precision
)
language sql
security definer
set search_path = public
as $$
  select distinct on (date_bin(make_interval(secs => greatest(p_bucket_seconds, 1)), recorded_at, timestamptz '1970-01-01'))
    id, recorded_at, temperature, humidity, occupancy, light, ac, power
  from public.sensor_readings
  where recorded_at >= now() - make_interval(hours => greatest(p_range_hours, 1))
  order by date_bin(make_interval(secs => greatest(p_bucket_seconds, 1)), recorded_at, timestamptz '1970-01-01'), recorded_at desc
  limit 2000;
$$;

revoke all on function public.get_sensor_history(integer, integer) from public, anon, authenticated;
grant execute on function public.get_sensor_history(integer, integer) to service_role;

-- Realtime publication, idempotent for existing projects.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'devices') then
    alter publication supabase_realtime add table public.devices;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'sensor_readings') then
    alter publication supabase_realtime add table public.sensor_readings;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'monitoring_events') then
    alter publication supabase_realtime add table public.monitoring_events;
  end if;
end $$;
