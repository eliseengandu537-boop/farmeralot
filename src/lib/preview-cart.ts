import products from "@/data/preview-basket-products.json";
import type { CartData } from "@/lib/cart";

const STORAGE_KEY = "farmeralot-presentation-basket-v1";
type Selection = { id: number; quantity: number };

export function previewCartRequest(path: string, body?: Record<string, unknown>): CartData {
  let selections: Selection[] = [];
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (Array.isArray(saved)) selections = saved.filter((item) => item && Number.isInteger(item.id) && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99 && products.some((product) => product.id === item.id));
  } catch { /* A corrupt or restricted browser store starts with an empty presentation basket. */ }

  if (path === "cart/add-item") {
    const id = Number(body?.id);
    const quantity = Number(body?.quantity ?? 1);
    if (!products.some((product) => product.id === id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Please choose a valid product and quantity.");
    const existing = selections.find((item) => item.id === id);
    if (existing) existing.quantity = Math.min(99, existing.quantity + quantity);
    else selections.push({ id, quantity });
  } else if (path === "cart/update-item") {
    const quantity = Number(body?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Choose a quantity between 1 and 99.");
    const item = selections.find((item) => String(item.id) === body?.key);
    if (item) item.quantity = quantity;
  } else if (path === "cart/remove-item") {
    selections = selections.filter((item) => String(item.id) !== body?.key);
  } else if (path !== "cart") {
    throw new Error("Payments and orders are disabled in this presentation. Request a quote instead.");
  }

  if (body) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selections)); }
    catch { throw new Error("Your browser couldn’t save the basket. Allow storage for this site and try again."); }
  }
  const items = selections.flatMap((selection) => {
    const product = products.find((product) => product.id === selection.id);
    return product ? [{ ...product, key: String(product.id), quantity: selection.quantity }] : [];
  });
  return {
    items,
    items_count: items.reduce((total, item) => total + item.quantity, 0),
    totals: { total_price: String(items.reduce((total, item) => total + Number(item.prices.price) * item.quantity, 0)), currency_code: "ZAR", currency_minor_unit: 2, currency_symbol: "R" },
    payment_methods: [],
  };
}
