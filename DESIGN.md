---
version: alpha
name: SmartLab
description: A calm, precise dark design system for an intelligent IoT laboratory monitoring product.
colors:
  primary: "#0A0A0A"
  background: "#0A0A0A"
  surface-primary: "#111111"
  surface-secondary: "#171717"
  surface-elevated: "#1D1D1D"
  text-primary: "#F5F5F5"
  text-secondary: "#A1A1A1"
  text-muted: "#8A8A8A"
  text-faint: "#6F6F6F"
  border-default: "rgba(255, 255, 255, 0.10)"
  border-subtle: "rgba(255, 255, 255, 0.06)"
  accent: "#FF6308"
  accent-hover: "#FF7528"
  accent-soft: "rgba(255, 99, 8, 0.10)"
  accent-border: "rgba(255, 99, 8, 0.26)"
  success: "#6EE7B7"
  warning: "#FDE68A"
typography:
  display:
    fontFamily: Geist
    fontSize: 3.25rem
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.055em"
  heading-xl:
    fontFamily: Geist
    fontSize: 3.125rem
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.045em"
  heading-lg:
    fontFamily: Geist
    fontSize: 2.625rem
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.04em"
  heading-md:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body-lg:
    fontFamily: Geist
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.8667
    letterSpacing: "0em"
  body-md:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.7143
    letterSpacing: "0em"
  body-sm:
    fontFamily: Geist
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: Geist
    fontSize: 0.625rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.16em"
  mono:
    fontFamily: Geist Mono
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  small: 8px
  control: 10px
  medium: 10px
  card: 14px
  panel: 18px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  xxl: 64px
  section: 112px
components:
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
    rounded: "{rounded.control}"
    height: 48px
    padding: 24px
  button-accent-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.background}"
    rounded: "{rounded.control}"
    height: 48px
    padding: 24px
  button-neutral:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.control}"
    height: 48px
    padding: 24px
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    height: 44px
    padding: 20px
  button-ghost:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.control}"
    height: 36px
    padding: 14px
  panel-primary:
    backgroundColor: "{colors.surface-primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.panel}"
    padding: 24px
  panel-secondary:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    padding: 24px
  panel-elevated:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    padding: 24px
  status-success:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: 8px
  status-warning:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
    padding: 8px
  signal-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
    rounded: "{rounded.full}"
    size: 8px
  metadata:
    backgroundColor: "{colors.surface-primary}"
    textColor: "{colors.text-faint}"
    rounded: "{rounded.small}"
    padding: 8px
  separator-default:
    backgroundColor: "{colors.border-default}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.small}"
    height: 1px
  separator-subtle:
    backgroundColor: "{colors.border-subtle}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.small}"
    height: 1px
  attention-rule:
    backgroundColor: "{colors.accent-border}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.small}"
    height: 1px
---

# Overview

SmartLab is an intelligent IoT laboratory monitoring product. Its interface is technical, calm, precise, operational, premium, and restrained. The product should communicate laboratory state clearly without looking like a generic admin template, a school-project explainer, or a decorative AI concept.

This document is the primary visual source of truth for SmartLab. Older X.AI-derived rules no longer apply. The system inherits visual discipline—not brand identity—from the supplied Dibrez specification and remains original to SmartLab.

## Colors

- **Background (#0A0A0A):** The universal application and landing canvas.
- **Primary surface (#111111):** Main contained regions.
- **Secondary surface (#171717):** Nested or supporting regions.
- **Elevated surface (#1D1D1D):** Elements that genuinely sit above another surface.
- **Primary text (#F5F5F5):** Headlines, values, and high-emphasis copy.
- **Secondary text (#A1A1A1):** Body copy and supporting descriptions.
- **Muted text (#8A8A8A):** Metadata and secondary labels.
- **Faint text (#6F6F6F):** Low-priority timestamps and supporting technical notation.
- **Borders:** Use the supplied 10% and 6% white borders to structure depth.
- **Accent (#FF6308):** Primary CTA, active state, anomaly signal, or technical emphasis only.
- **Success (#6EE7B7) and warning (#FDE68A):** Semantic state only.

Do not introduce additional brand colors unless necessary to communicate a distinct semantic state. Do not use gradients, glow effects, glassmorphism, or neon treatments.

## Typography

Geist is the primary typeface for headings, body copy, labels, navigation, and controls. Geist Mono is limited to technical identifiers, time, code-like content, and numeric sensor readings where monospaced alignment is useful.

Headings use weight 400, tight negative tracking, disciplined line-height, and scale for character. Do not substitute heavy bold weight for hierarchy. Normal user-facing sentences use sentence case; uppercase tracked typography is reserved for sparing eyebrow and technical labels.

## Layout

Use a 4px spacing rhythm with 4, 8, 16, 24, 32, 48, and 64px as primary intervals. Major desktop sections may use 112px where purposeful. Whitespace must support hierarchy, not merely extend a page.

Public landing pages use a focused header, a two-column desktop hero, an integrated product visualization, understated credits, and a minimal footer. Operational screens prioritize first-view state recognition and compact information hierarchy.

Responsive checkpoints are 390px, 640px, 1024px, and 1280px+. Mobile composition must be intentionally stacked rather than proportionally compressed.

## Elevation & Depth

Depth comes from the surface progression `#0A0A0A → #111111 → #171717 → #1D1D1D` and subtle borders. Shadows are limited to objects that genuinely float over the interface. No ornamental shadows, blur-backed glass effects, giant radial gradients, or decorative light blooms.

## Shapes

- Controls: 10px.
- Small elements: 8px.
- Cards: 14px.
- Panels: 18px.
- Full radius: reserved only for compact semantic status badges and circular signal dots.

Primary buttons, secondary buttons, navigation controls, inputs, and ordinary interactive elements are rectangular. They must never use a capsule radius.

## Components

- Accent buttons use orange with black text, 48px height, 24px horizontal padding, and 10px radius.
- Neutral buttons use primary text color as their background and black text.
- Secondary buttons are transparent with primary text, a subtle border, 44px height, and 10px radius.
- Ghost buttons use secondary text, 36px height, and 10px radius.
- All buttons provide hover, active, disabled, and focus-visible states without exaggerated motion.
- Cards use 14px radius; larger structural panels use 18px.
- Status pills are permitted only when the pill shape communicates compact semantic state.

## Do's and Don'ts

Do:

- Make SmartLab feel like a real, intelligent laboratory product.
- Use surface tones and borders to create restrained depth.
- Make the orange accent meaningful and sparse.
- Keep product introduction on `/` and operation on `/dashboard`.
- Keep visual telemetry integrated into the landing composition.
- Make simulated/prototype state explicit where data is shown.

Don't:

- Copy Dibrez styling as a brand or reuse Dibrez product conventions.
- Continue the previous X.AI-derived visual rules.
- Use gradients, glow effects, glassmorphism, or ornamental shadows.
- Use pill-shaped controls by default.
- Make the homepage a full dashboard or implementation document.
- Create a generic SaaS, AI, Bootstrap, or admin-template aesthetic.
- Present prototype data as live ESP32 telemetry.
