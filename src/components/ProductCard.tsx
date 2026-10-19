"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatPrice, type StoreProduct } from "@/lib/woocommerce";
import { useStorefront } from "@/components/StorefrontProvider";
import { IS_PREVIEW } from "@/lib/store-config";

export function ProductCard({
  product,
  priority = false,
}: {
  product: StoreProduct;
  priority?: boolean;
}) {
  const { addToCart } = useStorefront();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const image = product.images[0];
  const hasPrice = Number(product.prices.price) > 0;
  const price = formatPrice(
    product.prices.price,
    product.prices.currency_code,
    product.prices.currency_minor_unit,
  );

  async function add() {
    setAdding(true);
    setError("");
    try {
      await addToCart(product.id);
      setAdded(true);
    } catch {
      setError("Could not add this item. Please retry.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="product-card">
      <Link className="product-image" href={`/product/${product.slug}`}>
        {image ? <Image src={image.src} alt={image.alt || product.name} fill sizes="(max-width: 700px) 50vw, (max-width: 1000px) 33vw, 25vw" loading={priority ? "eager" : "lazy"} /> : <span className="image-placeholder">Farmeralot parts</span>}
        <span className="product-image-label">{IS_PREVIEW ? "Quote required" : hasPrice ? product.is_in_stock ? "Ready to ship" : "Check availability" : "Quote required"}</span>
      </Link>
      <div className="product-card-content">
        <div className="product-meta"><span>{product.sku || "Genuine fit"}</span><span className="stock-dot" /></div>
        <Link className="product-name" href={`/product/${product.slug}`}>{product.name}</Link>
        <div className="product-card-bottom">
          <strong>{price}</strong>
          {hasPrice || IS_PREVIEW ? (
            <button className="icon-button" type="button" onClick={add} disabled={adding || (!IS_PREVIEW && !product.is_in_stock)} aria-label={`Add ${product.name} to basket`}>
              {adding ? "…" : added ? "✓" : "+"}
            </button>
          ) : (
            <Link className="icon-button quote-icon" href={`/request-quote?product=${encodeURIComponent(product.name)}&sku=${encodeURIComponent(product.sku)}`} aria-label={`Request a quote for ${product.name}`}>Q</Link>
          )}
        </div>
        {error && <p className="inline-error" role="status">{error}</p>}
        {added && !error && <p className="basket-added" role="status">Added. <Link href="/cart">View basket →</Link></p>}
      </div>
    </article>
  );
}
