import Link from "next/link";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { ScrollText } from "@/components/ScrollText";
import { Hero } from "@/components/Hero";
import { ServiceStory } from "@/components/ServiceStory";
import { getCategories, getProducts } from "@/lib/woocommerce";

export default async function HomePage() {
  const [categoryResult, productResult] = await Promise.allSettled([
    getCategories(),
    getProducts({ perPage: 8 }),
  ]);
  const categories = categoryResult.status === "fulfilled" ? categoryResult.value : [];
  const products = productResult.status === "fulfilled" ? productResult.value : [];

  // The storefront introduction remains available during upstream outages.
  if (categoryResult.status === "rejected" || productResult.status === "rejected") {
    console.warn("Homepage catalogue temporarily unavailable; showing the enquiry fallback.");
  }

  return (
    <main className="home-page" id="main-content">
      <Hero />

      <section className="trust-strip" aria-label="The Farmalot service">
        <div><span className="trust-number">01</span><span>Hard-to-find parts<br /><b>made easier</b></span></div>
        <div><span className="trust-number">02</span><span>Parts and everyday<br /><b>farm essentials</b></span></div>
        <div><span className="trust-number">03</span><span>Nationwide delivery<br /><b>to rural farms</b></span></div>
        <div><span className="trust-number">04</span><span>Practical help from<br /><b>a dedicated team</b></span></div>
      </section>

      <ServiceStory />

      <section id="categories" className="section category-section">
        <Reveal className="section-heading">
          <div><span className="eyebrow">Explore the catalogue</span><ScrollText lines={["Find what", "your farm needs."]} highlightWord="farm" /></div>
          <Link className="text-link" href="/shop">Browse all products <span aria-hidden="true">↗</span></Link>
        </Reveal>
        {categories.length > 0 ? <div className="category-grid">
          {categories.slice(0, 12).map((category, index) => (
            <Reveal key={category.id} delay={(index % 4) * 65}>
              <CategoryCard category={category} index={index} />
            </Reveal>
          ))}
        </div> : <div className="catalogue-unavailable"><p>We couldn’t load the categories right now. Our team can still help you find what you need.</p><Link className="text-link" href="/request-quote">Ask about a part <span aria-hidden="true">↗</span></Link></div>}
      </section>

      <section className="section featured-section">
        <Reveal className="section-heading">
          <div><span className="eyebrow">Straight from the catalogue</span><ScrollText lines={["Parts for the", "everyday."]} highlightWord="everyday." /></div>
          <Link className="text-link" href="/shop">See the full catalogue <span aria-hidden="true">↗</span></Link>
        </Reveal>
        {products.length > 0 ? <div className="product-grid">
          {products.slice(0, 8).map((product, index) => (
            <Reveal key={product.id} delay={(index % 4) * 65}>
              <ProductCard product={product} priority={index === 0} />
            </Reveal>
          ))}
        </div> : <div className="catalogue-unavailable"><h3>Let’s find it together.</h3><p>The live catalogue is temporarily unavailable. Send us your machine model or part number and we’ll help with your enquiry.</p><Link className="button button-dark" href="/request-quote">Request a quote <span aria-hidden="true">↗</span></Link></div>}
      </section>

      <section className="quote-band">
        <div><span className="eyebrow eyebrow-light">Not sure which one?</span><ScrollText className="quote-band-title" lines={["Tell us what you’re", "working with."]} highlightWord="working" /></div>
        <p>Share your machine model, part number, or a photo. Our parts team will help you find a match.</p>
        <Link className="button button-outline-light" href="/request-quote">Email our parts team <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
