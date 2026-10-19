import Link from "next/link";

export default function NotFound() {
  return <main className="page-shell"><span className="eyebrow">Let’s find your way</span><h1>We couldn’t find that page.</h1><p>The part may have moved or may not be in this catalogue. Our team can help you track it down.</p><div className="recovery-actions"><Link className="button button-dark" href="/shop">Browse the catalogue</Link><Link className="button button-copper" href="/request-quote">Ask about a part ↗</Link></div></main>;
}
