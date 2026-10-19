import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getProducts, getPreviewProductCount } from "@/lib/woocommerce";
import { loadCatalogue } from "@/lib/store-request";
import { IS_PREVIEW } from "@/lib/store-config";
import { StoreUnavailable } from "@/components/StoreUnavailable";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Shop parts" };

type ShopSearch = { category?: string; search?: string; page?: string };
const PAGE_SIZE = 24;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearch>;
}) {
  const params = await searchParams;
  const parsedPage = Number(params.page ?? "1");
  const currentPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const categoryResult = await loadCatalogue(getCategories);
  if (!categoryResult.data) return <main className="page-shell shop-page"><h1>Parts for your machinery</h1><StoreUnavailable /></main>;
  const categories = categoryResult.data;
  const selectedCategory = categories.find((category) => category.slug === params.category);
  if (params.category && !selectedCategory) notFound();
  const filters = { category: selectedCategory?.id, search: params.search };
  const productResult = await loadCatalogue(() => getProducts({ ...filters, perPage: PAGE_SIZE, page: currentPage }));
  const products = productResult.data ?? [];
  const hasNextPage = IS_PREVIEW
    ? currentPage * PAGE_SIZE < await getPreviewProductCount(filters)
    : products.length === PAGE_SIZE;
  const categoryNotSaved = IS_PREVIEW && selectedCategory?.count === 0 && !params.search;
  const quoteHref = selectedCategory
    ? `/request-quote?product=${encodeURIComponent(`Category: ${selectedCategory.name}`)}`
    : "/request-quote";
  function pageHref(page: number) {
    return `/shop?${new URLSearchParams({ ...(selectedCategory ? { category: selectedCategory.slug } : {}), ...(params.search ? { search: params.search } : {}), page: String(page) })}`;
  }

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
          <Link className={!selectedCategory ? "active" : ""} href="/shop">All parts</Link>
          {categories.map((category) => (
            <Link className={selectedCategory?.id === category.id ? "active" : ""} href={`/shop?category=${category.slug}`} key={category.id}>
              {category.name}<span>{category.count}</span>
            </Link>
          ))}
        </aside>
        <section className="catalogue-results" aria-label="Products">
          <div className="results-toolbar"><span>{productResult.error ? "Catalogue unavailable" : `${products.length} parts shown`}{params.search ? ` for “${params.search}”` : ""}</span><span>{IS_PREVIEW ? "Saved catalogue · presentation" : "Sorted by popularity"}</span></div>
          {productResult.error ? <StoreUnavailable /> : products.length > 0 ? (
            <div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}</div>
          ) : (
            <div className="empty-state"><span className="eyebrow">{categoryNotSaved ? "No saved products in this category" : "No matches yet"}</span><h2>Let’s track it down.</h2><p>{categoryNotSaved ? "The saved catalogue for this presentation has no products in this category yet. Our team can confirm current availability and help source your part." : "Try a different search or ask us to source the right part for your machine."}</p><Link className="button button-dark" href={quoteHref}>Request a quote</Link></div>
          )}
          {!productResult.error && (currentPage > 1 || hasNextPage) && <nav className="pagination" aria-label="Catalogue pages">
            {currentPage > 1 && <Link className="button button-dark" href={pageHref(currentPage - 1)}>← Previous</Link>}
            <span>Page {currentPage}</span>
            {hasNextPage && <Link className="button button-dark" href={pageHref(currentPage + 1)}>Next →</Link>}
          </nav>}
        </section>
      </div>
    </main>
  );
}
