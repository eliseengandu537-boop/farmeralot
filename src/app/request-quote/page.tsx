import Link from "next/link";

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; sku?: string }>;
}) {
  const query = await searchParams;
  const details = [query.product, query.sku ? `SKU: ${query.sku}` : ""].filter(Boolean).join(" · ");
  const subject = details ? `Part enquiry: ${details}` : "Farmeralot parts enquiry";
  const body = details
    ? `Hello Farmeralot,\n\nI would like a quote for ${details}.\n\nMy name:\nMy phone number:\nDelivery location:\n`
    : "Hello Farmeralot,\n\nI would like help finding a machinery part.\n\nMachine make and model:\nPart number or description:\nMy name:\nMy phone number:\nDelivery location:\n";
  const emailLink = `mailto:eliseenweb@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <main className="page-shell quote-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Request a quote</span></div>
      <div className="quote-page-grid">
        <div className="quote-intro"><span className="eyebrow">Get the right part, first time</span><h1>Let’s find your<br /><em>fit.</em></h1><p>Tell our parts team what you’re working with. A machine model, part number, or clear photo is a great place to start.</p><div className="quote-points"><span>01 <b>Share the details</b></span><span>02 <b>We check the fit</b></span><span>03 <b>Get a tailored quote</b></span></div></div>
        <div className="quote-form-card"><span className="eyebrow">A real person is ready to help</span><h2>Request a quote</h2>
          <p>{details ? `We’ll help you with: ${details}` : "Give us a few details and continue to the Farmeralot quote form."}</p>
          <a className="button button-copper quote-submit" href={emailLink}>
            Email eliseenweb@gmail.com <span aria-hidden="true">↗</span>
          </a>
          <p className="form-privacy">Opens your email app with your part details ready to send to our team.</p>
          <a className="quote-online-link" href={`https://farmeralot.co.za/request-quote/${details ? `?part=${encodeURIComponent(details)}` : ""}`} target="_blank" rel="noreferrer">
            Prefer the online quote form? Continue on Farmeralot ↗
          </a>
          <div className="quote-help"><span className="quote-help-icon">?</span><span><b>Not sure what the part is called?</b><br />Send the machine make, model, and year to help us identify it.</span></div>
        </div>
      </div>
    </main>
  );
}
