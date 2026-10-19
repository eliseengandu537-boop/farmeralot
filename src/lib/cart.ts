export type CartItem = {
  key: string;
  id: number;
  name: string;
  sku?: string;
  quantity: number;
  prices: { price: string; currency_code: string; currency_minor_unit: number };
  images: { src: string; thumbnail: string; alt: string }[];
};

export type CartData = {
  items: CartItem[];
  items_count: number;
  totals: { total_price: string; currency_code: string; currency_minor_unit: number; currency_symbol: string };
  payment_methods: string[];
};

export function isCartData(value: unknown): value is CartData {
  if (!value || typeof value !== "object") return false;
  const cart = value as Partial<CartData>;
  return Array.isArray(cart.items) && cart.items.every((item) => item && typeof item.key === "string" && typeof item.name === "string" && Number.isInteger(item.quantity) && item.quantity > 0 && item.prices && typeof item.prices.price === "string" && Array.isArray(item.images)) &&
    typeof cart.items_count === "number" && !!cart.totals && typeof cart.totals.total_price === "string" && Array.isArray(cart.payment_methods);
}
