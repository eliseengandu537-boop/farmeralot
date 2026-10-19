"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="page-shell"><span className="eyebrow">We’re still here to help</span><h1>This page couldn’t load.</h1><p>Please try again or send your enquiry directly to our parts team.</p><div className="recovery-actions"><button className="button button-dark" onClick={reset}>Try again</button><Link className="button button-copper" href="/request-quote">Contact the team ↗</Link><Link className="text-link" href="/">Back to home</Link></div></main>;
}
