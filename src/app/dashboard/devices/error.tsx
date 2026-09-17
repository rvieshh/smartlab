"use client";

import { ErrorState } from "@/components/data-state/page-state";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="page-main"><ErrorState reset={reset} /></main>;
}
