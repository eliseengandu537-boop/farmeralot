"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/woocommerce";
import { useStorefront } from "@/components/StorefrontProvider";
import { useState } from "react";
import { IS_PREVIEW } from "@/lib/store-config";

export default function CartPage() {
  const { cart, cartError, cartLoading, refreshCart, updateCartItem, removeCartItem } = useStorefront();
  const [pending, setPending] = useState(false);
  async function change(operation: () => Promise<void>) {
    setPending(true);
    try { await operation(); } catch { /* The provider displays the error and retains the current basket. */ }
    finally { setPending(false); }
  }

  return (
    <main className="page-shell cart-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Your basket</span></div>
      <span className="eyebrow">Ready when you are</span>
      <h1>Your basket<span className="heading-period">.</span></h1>
      {cartError && <p className="inline-error" role="alert">{cartError}</p>}
      {!cart ? cartLoading ? <p className="lead" role="status">Loading your basket…</p> : <div className="empty-state"><h2>We couldn’t load your basket.</h2><p>Please reconnect before continuing.</p><div className="recovery-actions"><button className="button button-dark" onClick={() => void refreshCart()}>Try again</button><Link className="text-link" href="/request-quote">Contact our team</Link></div></div> : cart.items.length === 0 ? (
        <div className="empty-state cart-empty"><h2>Your basket is waiting.</h2><p>Explore the catalogue to find the part that gets you moving again.</p><Link className="button button-dark" href="/shop">Explore parts <span aria-hidden="true">↗</span></Link></div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {cart.items.map((item) => (
              <article className="cart-line" key={item.key}>
                <div className="cart-line-image">{item.images[0] && <Image src={item.images[0].thumbnail || item.images[0].src} width={100} height={96} alt={item.images[0].alt || item.name} />}</div>
                <div className="cart-line-info"><span className="eyebrow">{item.sku || "Selected part"}</span><h2>{item.name}</h2><strong>{formatPrice(item.prices.price, item.prices.currency_code, item.prices.currency_minor_unit)}</strong></div>
                <label className="quantity-control">Qty
                  <input aria-label={`Quantity for ${item.name}`} type="number" min="1" max="99" value={item.quantity} disabled={pending} onChange={(event) => {
                    const value = Number(event.target.value);
                    if (Number.isInteger(value) && value >= 1 && value <= 99) void change(() => updateCartItem(item.key, value));
                  }} />
                </label>
                <button className="remove-link" type="button" disabled={pending} onClick={() => void change(() => removeCartItem(item.key))}>Remove</button>
              </article>
            ))}
            <Link className="text-link" href="/shop">← Keep looking</Link>
          </div>
          <aside className="cart-summary"><span className="eyebrow">{IS_PREVIEW ? "Quote basket" : "Order summary"}</span><div><span>Items</span><b>{cart.items_count}</b></div><div className="summary-total"><span>{IS_PREVIEW ? "Pricing" : "Basket total"}</span><b>{formatPrice(cart.totals.total_price, cart.totals.currency_code, cart.totals.currency_minor_unit)}</b></div><p>{IS_PREVIEW ? "Review your selected parts and prepare an enquiry. Prices, stock and delivery are confirmed by the team. No order is placed in this preview." : "Shipping and applicable taxes are confirmed at checkout."}</p><Link className="button button-copper" href={IS_PREVIEW || Number(cart.totals.total_price) > 0 ? "/checkout" : "/request-quote?basket=1"}>{IS_PREVIEW ? "Continue to enquiry" : Number(cart.totals.total_price) > 0 ? "Continue to checkout" : "Request a quote"} <span aria-hidden="true">→</span></Link><Link className="summary-quote" href="/shop">Keep browsing</Link></aside>
        </div>
      )}
    </main>
  );
}
