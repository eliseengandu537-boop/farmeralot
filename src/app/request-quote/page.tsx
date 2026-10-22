import Link from "next/link";
import { QuoteForm } from "@/components/QuoteForm";
import { WhatsAppLink } from "@/components/WhatsAppLink";

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; sku?: string; basket?: string }>;
}) {
  const query = await searchParams;
  const details = [query.product, query.sku ? `SKU: ${query.sku}` : ""].filter(Boolean).join(" · ");

  return (
    <main className="page-shell quote-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Request a quote</span></div>
      <div className="quote-page-grid">
        <div className="quote-intro"><span className="eyebrow">Get the right part, first time</span><h1>Let’s find your<br /><em>fit.</em></h1><p>Tell our parts team what you’re working with. A machine model, part number, or clear photo is a great place to start.</p><div className="quote-whatsapp"><WhatsAppLink message={details ? `Hi Farmeralot, please help me with this product: ${details}` : undefined} /><p>Tap to open WhatsApp. Send us the part name or a photo. You can also use the email form.</p></div><div className="quote-points"><span>01 <b>Share the details</b></span><span>02 <b>We check the fit</b></span><span>03 <b>Get a tailored quote</b></span></div></div>
        <QuoteForm details={details} includeBasket={query.basket === "1"} />
      </div>
    </main>
  );
}
