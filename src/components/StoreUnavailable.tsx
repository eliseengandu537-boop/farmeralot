"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function StoreUnavailable({ title = "Let’s reconnect to the catalogue." }: { title?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="catalogue-unavailable" role="status">
      <h2>{title}</h2>
      <p>We can’t reach the store right now. Please try again, or send your part details to our team for a quote.</p>
      <div className="recovery-actions">
        <button className="button button-dark" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? "Connecting…" : "Try again"}</button>
        <Link className="button button-copper" href="/request-quote">Request a quote ↗</Link>
      </div>
    </div>
  );
}
