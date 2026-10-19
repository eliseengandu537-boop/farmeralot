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
        <video className="hero-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1}>
          <source src="/farmeralot-background.mp4" type="video/mp4" />
        </video>
        <div className="hero-copy">
          <span className="eyebrow eyebrow-light">Parts for the work that matters</span>
          <ScrollText as="h1" className="hero-title" lines={["Keep Your", "World Turning"]} highlightWord="World" />
          <p>Dependable machinery parts, expert help, and delivery that reaches beyond the main road.</p>
          <div className="hero-actions">
            <Link className="button button-copper" href="/shop">Explore the parts <span aria-hidden="true">↗</span></Link>
            <Link className="button button-ghost" href="/request-quote">Need a hand finding it?</Link>
          </div>
          <div className="hero-proof">Trusted by farms across Southern Africa</div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Why Farmeralot">
        <div><span className="trust-number">01</span><span>Hard-to-find parts<br /><b>made easier</b></span></div>
        <div><span className="trust-number">02</span><span>Support from people<br /><b>who understand the job</b></span></div>
        <div><span className="trust-number">03</span><span>Delivery to your<br /><b>farm gate</b></span></div>
        <div><span className="trust-number">04</span><span>Order or request a<br /><b>tailored quote</b></span></div>
      </section>

      <section className="section category-section">
        <Reveal className="section-heading">
          <div><span className="eyebrow">Find your way</span><ScrollText lines={["Shop by", "category."]} highlightWord="category." /></div>
          <Link className="text-link" href="/shop">Browse all parts <span aria-hidden="true">↗</span></Link>
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
