import Link from "next/link";
import { htmlToText, STORE_URL } from "@/lib/woocommerce";
import { IS_PREVIEW } from "@/lib/store-config";

const policyDetails: Record<string, { title: string; intro: string; source: string }> = {
  "warranty-policy": {
    title: "Warranty policy",
    intro: "We want you to have confidence in every part you order. For the latest warranty terms and claim process, please review the current policy maintained by Farmeralot.",
    source: "warranty-policy",
  },
  "refund_policy": {
    title: "Refund policy",
    intro: "For return eligibility, refunds, and exchanges, please refer to Farmeralot’s current refund policy.",
    source: "refund_policy",
  },
  "terms-of-service": {
    title: "Terms of service",
    intro: "These terms explain the conditions for using the Farmeralot store. View the latest full terms before placing an order.",
    source: "terms-of-service",
  },
};

type PolicyResponse = {
  content?: { rendered?: string };
};

export async function PolicyPage({ slug }: { slug: string }) {
  const policy = policyDetails[slug];
  if (!policy) return null;

  let policyText = "";
  if (!IS_PREVIEW) try {
    const response = await fetch(
      `${STORE_URL}/wp-json/wp/v2/pages?slug=${policy.source}&_fields=content`,
      { next: { revalidate: 1800 }, signal: AbortSignal.timeout(12_000) },
    );
    if (!response.ok) {
      throw new Error(`Policy request failed (${response.status}).`);
    }
    const pages: PolicyResponse[] = await response.json();
    const rendered = Array.isArray(pages) ? pages[0]?.content?.rendered : undefined;
    if (typeof rendered === "string") policyText = htmlToText(rendered);
  } catch {
    // Keep the existing link to the official policy when WordPress is unavailable.
    console.warn(`Live ${policy.title.toLowerCase()} unavailable; linking to the official policy.`);
  }

  return (
    <main className="policy-page page-shell">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>{policy.title}</span></div>
      <span className="eyebrow">Customer information</span>
      <h1>{policy.title}</h1>
      <p className="lead">{policy.intro}</p>
      {policyText ? (
        <div className="policy-copy">
          {policyText.split(/\n+/).filter(Boolean).map((paragraph, index) => <p key={`${slug}-${index}`}>{paragraph}</p>)}
        </div>
      ) : (
        <a className="button button-dark" href={`${STORE_URL}/${policy.source}/`} target="_blank" rel="noreferrer">
          Read the current full policy <span aria-hidden="true">↗</span>
        </a>
      )}
    </main>
  );
}
