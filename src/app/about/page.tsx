import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero page-shell"><div><span className="eyebrow">Fast parts for farmlands</span><h1>What your farm needs,<br /><em>within reach.</em></h1><p>Farmalot is a farm-delivery and logistics company helping farms and machinery operators find, order, and receive the products they need. From machinery parts to everyday farm essentials, we connect orders with delivery to destinations around South Africa.</p><Link className="button button-copper" href="/shop">Explore the catalogue <span aria-hidden="true">↗</span></Link></div><div className="about-visual"><span>FROM ORDER<br />TO FARM</span><i>01</i></div></section>
      <section className="about-values"><div><span className="eyebrow">Company overview &amp; what we offer</span><h2>Find it.<br />Order it.<br />Get it to your farm.</h2></div><div className="value-list"><article><span>01</span><div><h3>Products for farm life</h3><p>Browse machinery parts in our catalogue, or contact us about other products and essentials your farm needs.</p></div></article><article><span>02</span><div><h3>Practical product guidance</h3><p>A dedicated team brings agricultural and parts knowledge to help you choose what is right for the work.</p></div></article><article><span>03</span><div><h3>Logistics beyond the main road</h3><p>Our delivery network is designed to get essential orders to isolated farms and destinations around the country.</p></div></article><article><span>04</span><div><h3>A simpler way to order</h3><p>Search and order online, or ask our team for help finding an item and arranging a quote.</p></div></article></div></section>
      <section className="about-cta"><span className="eyebrow eyebrow-light">Keep your operation moving</span><h2>Tell us what your<br />farm needs.</h2><Link className="button button-outline-light" href="/shop">Explore the catalogue <span aria-hidden="true">↗</span></Link></section>
    </main>
  );
}
