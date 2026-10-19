"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/woocommerce";
import { useStorefront } from "@/components/StorefrontProvider";

type Address = {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
};

const emptyAddress: Address = {
  first_name: "",
  last_name: "",
  address_1: "",
  city: "",
  state: "",
  postcode: "",
  country: "ZA",
  email: "",
  phone: "",
};

export default function CheckoutPage() {
  const { cart, cartError, submitCheckout } = useStorefront();
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const payfastMethods = cart?.payment_methods.filter((method) =>
    method.toLowerCase().includes("payfast"),
  ) ?? [];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await submitCheckout(address, paymentMethod);
      if (typeof result === "object" && result !== null && "payment_result" in result) {
        const payment = result.payment_result;
        if (typeof payment === "object" && payment !== null && "redirect_url" in payment && typeof payment.redirect_url === "string") {
          window.location.assign(payment.redirect_url);
          return;
        }
      }
      throw new Error("WooCommerce did not return a PayFast payment link.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Payment could not be started.");
    } finally {
      setBusy(false);
    }
  }

  function update(field: keyof Address, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="page-shell checkout-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/cart">Basket</Link><span>/</span><span>Checkout</span></div>
      <span className="eyebrow">Secure checkout · ZAR</span>
      <h1>Let’s get it <em>to you.</em></h1>
      {cartError && <p className="inline-error" role="alert">{cartError}</p>}
      {!cart || cart.items.length === 0 ? (
        <div className="empty-state"><h2>Your basket is empty.</h2><Link className="button button-dark" href="/shop">Browse parts</Link></div>
      ) : Number(cart.totals.total_price) <= 0 ? (
        <div className="empty-state"><h2>These parts need a quote.</h2><p>The live catalogue does not include checkout prices for the items in your basket. Request a quote and the Farmeralot team can confirm pricing and availability.</p><Link className="button button-dark" href="/request-quote">Request a quote <span aria-hidden="true">↗</span></Link></div>
      ) : (
        <form className="checkout-layout" onSubmit={submit}>
          <div className="checkout-fields">
            <section className="checkout-card"><span className="eyebrow">01 / Contact and delivery</span><div className="form-grid">
              <label>First name<input required autoComplete="given-name" value={address.first_name} onChange={(event) => update("first_name", event.target.value)} /></label>
              <label>Last name<input required autoComplete="family-name" value={address.last_name} onChange={(event) => update("last_name", event.target.value)} /></label>
              <label className="field-full">Email address<input required type="email" autoComplete="email" value={address.email} onChange={(event) => update("email", event.target.value)} /></label>
              <label>Phone number<input required type="tel" autoComplete="tel" value={address.phone} onChange={(event) => update("phone", event.target.value)} /></label>
              <label className="field-full">Farm / delivery address<input required autoComplete="street-address" value={address.address_1} onChange={(event) => update("address_1", event.target.value)} /></label>
              <label>Town / city<input required autoComplete="address-level2" value={address.city} onChange={(event) => update("city", event.target.value)} /></label>
              <label>Province<input required autoComplete="address-level1" value={address.state} onChange={(event) => update("state", event.target.value)} /></label>
              <label>Postal code<input required autoComplete="postal-code" value={address.postcode} onChange={(event) => update("postcode", event.target.value)} /></label>
            </div></section>
            <section className="checkout-card"><span className="eyebrow">02 / Payment</span>
              {payfastMethods.length > 0 ? payfastMethods.map((method) => (
                <label className="payment-option" key={method}>
                  <input type="radio" required name="payment_method" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                  <span><b>PayFast</b><small>Secure online payment</small></span><span className="payment-lock">SECURE</span>
                </label>
              )) : <p className="payment-warning">PayFast is not currently available from the WooCommerce store. Enable the PayFast gateway in WooCommerce to accept online payments here. You can still <Link href="/request-quote">request a quote</Link>.</p>}
            </section>
          </div>
          <aside className="cart-summary checkout-summary"><span className="eyebrow">Your order</span>
            {cart.items.map((item) => <div className="checkout-item" key={item.key}><span>{item.name} × {item.quantity}</span><b>{formatPrice(item.prices.price, item.prices.currency_code, item.prices.currency_minor_unit)}</b></div>)}
            <div className="summary-total"><span>Subtotal</span><b>{formatPrice(cart.totals.total_price, cart.totals.currency_code, cart.totals.currency_minor_unit)}</b></div>
            <p>Final delivery and tax amounts are confirmed by WooCommerce before payment.</p>
            {error && <p className="inline-error" role="alert">{error}</p>}
            <button className="button button-copper" type="submit" disabled={busy || payfastMethods.length === 0}>{busy ? "Connecting securely…" : "Continue to PayFast"} <span aria-hidden="true">↗</span></button>
            <Link className="summary-quote" href="/request-quote">Prefer a quote instead?</Link>
          </aside>
        </form>
      )}
    </main>
  );
}
