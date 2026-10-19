import Link from "next/link";

const questions = [
  ["How do I find the right part?", "Search by part number, product name, or browse by category. If you are unsure, send us your machine make and model through the quote request."],
  ["Can I request a quote instead of checking out?", "Yes. Use the quote request page and include the product or part number you need. Our team will help confirm availability and pricing."],
  ["Do you deliver to farms outside major towns?", "Farmeralot supports deliveries to remote areas. Delivery options and costs are confirmed during checkout."],
  ["Which payment methods are available?", "Online payment is handled securely through the PayFast gateway when it is enabled on the Farmeralot WooCommerce store."],
];

export default function FAQPage() {
  return (
    <main className="page-shell faq-page"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Help</span></div><span className="eyebrow">Quick answers</span><h1>Good to <em>know.</em></h1><div className="faq-list">{questions.map(([question, answer], index) => <details key={question}><summary><span>{String(index + 1).padStart(2, "0")}</span>{question}<b>+</b></summary><p>{answer}</p></details>)}</div><div className="faq-contact"><p>Still need a hand?</p><Link className="text-link" href="/request-quote">Talk to our parts team <span aria-hidden="true">↗</span></Link></div></main>
  );
}
