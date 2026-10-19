"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/woocommerce";
import { useStorefront } from "@/components/StorefrontProvider";

export default function CartPage() {
  const { cart, cartError, updateCartItem, removeCartItem } = useStorefront();

  return (
    <main className="page-shell cart-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Your basket</span></div>
      <span className="eyebrow">Ready when you are</span>
      <h1>Your basket<span className="heading-period">.</span></h1>
      {cartError && <p className="inline-error" role="alert">{cartError}</p>}
      {!cart ? <p className="lead">Loading your basket…</p> : cart.items.length === 0 ? (
        <div className="empty-state cart-empty"><h2>Your basket is waiting.</h2><p>Explore the catalogue to find the part that gets you moving again.</p><Link className="button button-dark" href="/shop">Explore parts <span aria-hidden="true">↗</span></Link></div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {cart.items.map((item) => (
              <article className="cart-line" key={item.key}>
                <div className="cart-line-image">{item.images[0] && <Image src={item.images[0].thumbnail || item.images[0].src} width={100} height={96} alt={item.images[0].alt || item.name} />}</div>
                <div className="cart-line-info"><span className="eyebrow">SKU {item.key}</span><h2>{item.name}</h2><strong>{formatPrice(item.prices.price, item.prices.currency_code, item.prices.currency_minor_unit)}</strong></div>
                <label className="quantity-control">Qty
                  <input aria-label={`Quantity for ${item.name}`} type="number" min="1" max="99" value={item.quantity} onChange={(event) => {
                    const value = Number(event.target.value);
                    if (Number.isInteger(value) && value >= 1 && value <= 99) void updateCartItem(item.key, value);
                  }} />
                </label>
                <button className="remove-link" type="button" onClick={() => void removeCartItem(item.key)}>Remove</button>
              </article>
            ))}
            <Link className="text-link" href="/shop">← Keep looking</Link>
          </div>
          <aside className="cart-summary"><span className="eyebrow">Order summary</span><div><span>Items</span><b>{cart.items_count}</b></div><div className="summary-total"><span>Subtotal</span><b>{formatPrice(cart.totals.total_price, cart.totals.currency_code, cart.totals.currency_minor_unit)}</b></div><p>Shipping and any applicable taxes are calculated securely at checkout.</p>{Number(cart.totals.total_price) > 0 ? <Link className="button button-copper" href="/checkout">Continue to checkout <span aria-hidden="true">→</span></Link> : <Link className="button button-copper" href="/request-quote">Request a quote <span aria-hidden="true">→</span></Link>}<Link className="summary-quote" href="/shop">Keep browsing</Link></aside>
        </div>
      )}
    </main>
  );
}
