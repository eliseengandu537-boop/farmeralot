import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/woocommerce";

export const metadata: Metadata = { title: "Shop parts" };

type ShopSearch = { category?: string; search?: string; page?: string };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearch>;
}) {
  const params = await searchParams;
  const parsedPage = Number(params.page ?? "1");
  const currentPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts({
      search: params.search,
      perPage: 24,
      page: currentPage,
    }),
  ]);
  const selectedCategory = categories.find((category) => category.slug === params.category);
  const products = selectedCategory
    ? await getProducts({ category: selectedCategory.id, search: params.search, perPage: 24, page: currentPage })
    : allProducts;

  return (
    <main className="page-shell shop-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Shop parts</span></div>
      <div className="shop-heading">
        <div><span className="eyebrow">The Farmeralot catalogue</span><h1>{selectedCategory?.name ?? "Parts for your machinery"}</h1></div>
        <p>Search by name, part number, or machine. Not sure? <Link href="/request-quote">Ask our parts team.</Link></p>
      </div>
      <form className="shop-search" action="/shop">
        <label className="visually-hidden" htmlFor="shop-search">Search catalogue</label>
        <input id="shop-search" name="search" defaultValue={params.search} placeholder="Try “alternator”, “bearing” or a SKU" />
        {selectedCategory && <input type="hidden" name="category" value={selectedCategory.slug} />}
        <button className="button button-dark" type="submit">Search parts <span aria-hidden="true">→</span></button>
      </form>
      <div className="shop-layout">
        <aside className="category-sidebar">
          <span className="eyebrow">Categories</span>
          <Link className={!selectedCategory ? "active" : ""} href="/shop">All parts <span>{allProducts.length}+</span></Link>
          {categories.map((category) => (
            <Link className={selectedCategory?.id === category.id ? "active" : ""} href={`/shop?category=${category.slug}`} key={category.id}>
              {category.name}<span>{category.count}</span>
            </Link>
          ))}
        </aside>
        <section className="catalogue-results" aria-label="Products">
          <div className="results-toolbar"><span>{products.length} parts shown{params.search ? ` for “${params.search}”` : ""}</span><span>Sorted by popularity</span></div>
          {products.length > 0 ? (
            <>
              <div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}</div>
              {(currentPage > 1 || products.length === 24) && <nav className="pagination" aria-label="Catalogue pages">
                {currentPage > 1 && <Link className="button button-dark" href={`/shop?${new URLSearchParams({ ...(selectedCategory ? { category: selectedCategory.slug } : {}), ...(params.search ? { search: params.search } : {}), page: String(currentPage - 1) })}`}>← Previous</Link>}
                <span>Page {currentPage}</span>
                {products.length === 24 && <Link className="button button-dark" href={`/shop?${new URLSearchParams({ ...(selectedCategory ? { category: selectedCategory.slug } : {}), ...(params.search ? { search: params.search } : {}), page: String(currentPage + 1) })}`}>Next →</Link>}
              </nav>}
            </>
          ) : (
            <div className="empty-state"><span className="eyebrow">No matches yet</span><h2>Let’s track it down.</h2><p>Try a different search or ask us to source the right part for your machine.</p><Link className="button button-dark" href="/request-quote">Request a quote</Link></div>
          )}
        </section>
      </div>
    </main>
  );
}
