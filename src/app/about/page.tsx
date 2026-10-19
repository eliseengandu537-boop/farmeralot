import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero page-shell"><div><span className="eyebrow">Made for the people who keep things moving</span><h1>When the work<br />can’t <em>wait.</em></h1><p>Farmeralot connects farmers and workshops with dependable machinery parts, practical support, and delivery that reaches beyond the main road.</p><Link className="button button-copper" href="/shop">Find your part <span aria-hidden="true">↗</span></Link></div><div className="about-visual"><span>FIELD<br />NOTES</span><i>01</i></div></section>
      <section className="about-values"><div><span className="eyebrow">Our promise</span><h2>Parts are only<br />part of the job.</h2></div><div className="value-list"><article><span>01</span><div><h3>Keep things practical</h3><p>Easy ways to search by product, category, or part number help you spend less time looking and more time working.</p></div></article><article><span>02</span><div><h3>Bring the right expertise</h3><p>Our team understands the importance of finding a reliable fit for your machinery and application.</p></div></article><article><span>03</span><div><h3>Get it where it needs to go</h3><p>We work to get essential machinery parts out to farms and workshops across South Africa.</p></div></article></div></section>
      <section className="about-cta"><span className="eyebrow eyebrow-light">Keep your operation moving</span><h2>Start with the part<br />you need.</h2><Link className="button button-outline-light" href="/shop">Explore the catalogue <span aria-hidden="true">↗</span></Link></section>
    </main>
  );
}
