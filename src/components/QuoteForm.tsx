"use client";

import { useState, type FormEvent } from "react";
import { useStorefront } from "@/components/StorefrontProvider";
import { SALES_EMAIL } from "@/lib/store-config";

export function QuoteForm({ details = "", includeBasket = false }: { details?: string; includeBasket?: boolean }) {
  const { cart } = useStorefront();
  const [prepared, setPrepared] = useState<{ text: string; href: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const items = includeBasket ? cart?.items ?? [] : [];

  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const text = [
      "Hello Farmeralot,", "", "Please help me with this enquiry:", String(fields.get("request") ?? ""),
      ...(items.length ? ["", "Selected parts:", ...items.map((item) => `${item.quantity} × ${item.name}${item.sku ? ` (SKU: ${item.sku})` : ""}`)] : []),
      "", `Name: ${fields.get("name")}`, `Email: ${fields.get("email")}`,
      `Phone: ${fields.get("phone")}`, `Delivery area: ${fields.get("location")}`,
    ].join("\n");
    setPrepared({ text, href: `mailto:${SALES_EMAIL}?subject=${encodeURIComponent("Farmeralot parts enquiry")}&body=${encodeURIComponent(text)}` });
    setCopied(false);
    setCopyError(false);
  }

  return <div className="quote-form-card">
    <span className="eyebrow">A real person is ready to help</span><h2>Request a quote</h2>
    <p>Tell us what you need. Prepare an email, then review and send it from your email app.</p>
    {items.length > 0 && <ul className="quote-selected-items">{items.map((item) => <li key={item.key}>{item.quantity} × {item.name}</li>)}</ul>}
    <form onSubmit={prepare} onChange={() => setPrepared(null)}>
      <div className="form-grid">
        <label className="field-full">Your name<input name="name" autoComplete="name" maxLength={120} required /></label>
        <label className="field-full">Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
        <label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40} required /></label>
        <label>Delivery area<input name="location" autoComplete="address-level2" maxLength={120} required /></label>
        <label className="field-full">Part details or message<textarea name="request" rows={4} maxLength={1500} defaultValue={details} placeholder={items.length ? "Any machine details or delivery requirements?" : "Machine model, part number, or what your farm needs"} required={!items.length} /></label>
      </div>
      <button className="button button-copper quote-submit" type="submit">Prepare enquiry email <span aria-hidden="true">↗</span></button>
    </form>
    {prepared && <div className="prepared-enquiry" role="status">
      <h3>Your email is ready.</h3><p>It has not been sent yet. Open your email app to review and send it to <strong>{SALES_EMAIL}</strong>.</p>
      <a className="button button-dark" href={prepared.href}>Open email app ↗</a>
      <button className="text-link copy-enquiry" type="button" onClick={async () => { try { await navigator.clipboard.writeText(prepared.text); setCopied(true); setCopyError(false); } catch { setCopyError(true); } }}>{copied ? "Enquiry copied" : "Copy enquiry"}</button>
      <details open={copyError}><summary>View enquiry text</summary><pre>{prepared.text}</pre></details>
    </div>}
    <p className="form-privacy">You can also email <a href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL}</a> directly. Attach photos in your email app if needed.</p>
  </div>;
}
