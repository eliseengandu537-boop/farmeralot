import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { ScrollText } from "@/components/ScrollText";
import { getCategories, getProducts } from "@/lib/woocommerce";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ perPage: 8 }),
  ]);

  return (
    <main>
      <section className="hero">
        <video className="hero-video-backdrop" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1}>
          <source src="/farmeralot-background.mp4" type="video/mp4" />
        </video>
        <video className="hero-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1}>
          <source src="/farmeralot-background.mp4" type="video/mp4" />
        </video>
        <div className="hero-copy">
          <span className="eyebrow eyebrow-light">Fast parts for farmlands</span>
          <ScrollText as="h1" className="hero-title" lines={["Keep Your", "World Turning"]} highlightWord="World" />
          <p>Farmalot is a nationwide farm-delivery and logistics company, connecting farms with machinery parts and the everyday essentials they need, delivered beyond the main road.</p>
          <div className="hero-actions">
            <Link className="button button-copper" href="/shop">Explore the catalogue <span aria-hidden="true">↗</span></Link>
            <Link className="button button-ghost" href="/about">What we offer</Link>
          </div>
          <div className="hero-proof">Helping farms get what they need, wherever the work takes them.</div>
        </div>
      </section>

      <section className="trust-strip" aria-label="The Farmalot service">
        <div><span className="trust-number">01</span><span>Hard-to-find parts<br /><b>made easier</b></span></div>
        <div><span className="trust-number">02</span><span>Parts and everyday<br /><b>farm essentials</b></span></div>
        <div><span className="trust-number">03</span><span>Nationwide delivery<br /><b>to rural farms</b></span></div>
        <div><span className="trust-number">04</span><span>Practical help from<br /><b>a dedicated team</b></span></div>
      </section>

      <section className="section offer-section" aria-labelledby="offer-heading">
        <Reveal className="offer-intro">
          <div>
            <span className="eyebrow">Company overview &amp; what we offer</span>
            <h2 id="offer-heading">More than parts.<br /><em>Made for farms.</em></h2>
          </div>
          <p>Farmalot helps farmers and machinery operators find, order, and receive the products they need. From machinery parts to other farm essentials, our team makes sourcing easier and coordinates delivery to farms around South Africa.</p>
        </Reveal>
        <div className="offer-grid">
          <Reveal delay={0}><article className="offer-card"><span>01</span><h3>Parts &amp; farm essentials</h3><p>Shop the parts catalogue or ask our team about other items your farm needs.</p></article></Reveal>
          <Reveal delay={65}><article className="offer-card"><span>02</span><h3>Knowledgeable support</h3><p>A dedicated team offers practical guidance to help you find the right product for the job.</p></article></Reveal>
          <Reveal delay={130}><article className="offer-card"><span>03</span><h3>Delivery to rural farms</h3><p>Our logistics network helps get essential orders to farms and destinations around the country.</p></article></Reveal>
        </div>
        <Link className="text-link offer-link" href="/about">Company overview &amp; what we offer <span aria-hidden="true">↗</span></Link>
      </section>

      <section className="section category-section">
        <Reveal className="section-heading">
          <div><span className="eyebrow">Explore the catalogue</span><ScrollText lines={["Find what", "your farm needs."]} highlightWord="farm" /></div>
          <Link className="text-link" href="/shop">Browse all products <span aria-hidden="true">↗</span></Link>
        </Reveal>
        <div className="category-grid">
          {categories.slice(0, 12).map((category, index) => (
            <Reveal key={category.id} delay={(index % 4) * 65}>
              <Link className="category-tile" href={`/shop?category=${category.slug}`}>
                {category.image?.src && <Image src={category.image.src} width={180} height={140} sizes="(max-width: 700px) 45vw, 25vw" alt="" loading="lazy" />}
                <span className="category-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="category-name">{category.name}</span>
                <span className="category-arrow" aria-hidden="true">↗</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section featured-section">
        <Reveal className="section-heading">
          <div><span className="eyebrow">Straight from the catalogue</span><ScrollText lines={["Parts for the", "everyday."]} highlightWord="everyday." /></div>
          <Link className="text-link" href="/shop">See the full catalogue <span aria-hidden="true">↗</span></Link>
        </Reveal>
        <div className="product-grid">
          {products.slice(0, 8).map((product, index) => (
            <Reveal key={product.id} delay={(index % 4) * 65}>
              <ProductCard product={product} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="quote-band">
        <div><span className="eyebrow eyebrow-light">Not sure which one?</span><ScrollText className="quote-band-title" lines={["Tell us what you’re", "working with."]} highlightWord="working" /></div>
        <p>Share your machine model, part number, or a photo. Our parts team will help you find a match.</p>
        <Link className="button button-outline-light" href="/request-quote">Email our parts team <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
