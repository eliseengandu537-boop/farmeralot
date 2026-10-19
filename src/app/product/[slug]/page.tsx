import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/ProductDetails";
import { formatPrice, getProduct, htmlToText } from "@/lib/woocommerce";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.name ?? "Part" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const image = product.images[0];
  const hasPrice = Number(product.prices.price) > 0;
  const price = formatPrice(
    product.prices.price,
    product.prices.currency_code,
    product.prices.currency_minor_unit,
  );

  return (
    <main className="page-shell product-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/shop">Shop</Link><span>/</span><span>{product.name}</span></div>
      <div className="product-detail">
        <div className="product-detail-image">
          {image ? <Image src={image.src} width={700} height={600} priority alt={image.alt || product.name} /> : <span className="image-placeholder">Farmeralot parts</span>}
          <span className="image-stamp">PARTS<br />THAT WORK</span>
        </div>
        <div className="product-detail-copy">
          <span className="eyebrow">{product.categories[0]?.name ?? "Machinery part"} · {product.sku || "Farm-ready"}</span>
          <h1>{product.name}</h1>
          <p className="product-detail-description">{htmlToText(product.short_description || product.description)}</p>
          <p className="detail-price">{price}</p>
          <p className={`availability ${product.is_in_stock ? "available" : "unavailable"}`}>
            <span />{hasPrice && product.is_in_stock ? "In stock · ready to order" : "Confirm price and availability"}
          </p>
          <AddToCartButton productId={product.id} productName={product.name} sku={product.sku} hasPrice={hasPrice} disabled={!product.is_in_stock} />
          <Link className="text-link quote-detail-link" href={`/request-quote?product=${encodeURIComponent(product.name)}&sku=${encodeURIComponent(product.sku)}`}>
            Request a quote for this part <span aria-hidden="true">↗</span>
          </Link>
          <div className="detail-perks"><div><b>Farm-tested fit</b><span>Part numbers you can trust</span></div><div><b>Need a second opinion?</b><span>Talk to a real parts specialist</span></div></div>
        </div>
      </div>
      <section className="product-description"><span className="eyebrow">Product details</span><div className="description-copy">{htmlToText(product.description || product.short_description).split(/\n+/).filter(Boolean).map((line, index) => <p key={`${product.id}-${index}`}>{line}</p>)}</div></section>
    </main>
  );
}
