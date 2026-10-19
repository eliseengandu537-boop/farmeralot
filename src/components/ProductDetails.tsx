"use client";

import { useState } from "react";
import { useStorefront } from "@/components/StorefrontProvider";
import Link from "next/link";
import { IS_PREVIEW } from "@/lib/store-config";

export function AddToCartButton({
  productId,
  productName,
  sku,
  hasPrice,
  disabled,
}: {
  productId: number;
  productName: string;
  sku: string;
  hasPrice: boolean;
  disabled: boolean;
}) {
  const { addToCart } = useStorefront();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  async function add() {
    setBusy(true);
    setError("");
    try {
      await addToCart(productId);
      setAdded(true);
    } catch {
      setError("The basket could not be updated. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  if (!IS_PREVIEW && (!hasPrice || disabled)) {
    return (
      <Link
        className="button button-copper product-add-button"
        href={`/request-quote?product=${encodeURIComponent(productName)}&sku=${encodeURIComponent(sku)}`}
      >
        Request a quote <span aria-hidden="true">↗</span>
      </Link>
    );
  }

  return (
    <>
      <button className="button button-copper product-add-button" type="button" disabled={(!IS_PREVIEW && disabled) || busy} onClick={add}>
        {busy ? "Adding…" : IS_PREVIEW ? "Add to quote basket" : "Add to basket"} <span aria-hidden="true">↗</span>
      </button>
      {error && <p className="inline-error" role="status">{error}</p>}
      {added && <p className="basket-added" role="status">Added to your basket. <Link href="/cart">View basket →</Link></p>}
    </>
  );
}
