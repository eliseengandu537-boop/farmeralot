import { IS_PREVIEW } from "@/lib/store-config";
import { readStoreJson, requestStore, StoreRequestError } from "@/lib/store-request";
export { STORE_URL } from "@/lib/store-config";

export type StoreImage = {
  id: number;
  src: string;
  thumbnail: string;
  alt: string;
};

export type StoreCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
  image?: StoreImage | null;
};

export type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  permalink: string;
  short_description: string;
  description: string;
  prices: {
    price: string;
    regular_price: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
  images: StoreImage[];
  categories: Pick<StoreCategory, "id" | "name" | "slug">[];
  is_in_stock: boolean;
  add_to_cart: {
    text: string;
    description: string;
  };
};

async function storeFetch<T>(path: string): Promise<T> {
  const response = await requestStore(`wc/store/v1/${path}`, { cache: "no-store" });
  if (!response.ok) throw new StoreRequestError("unavailable", response.status);
  const data = await readStoreJson<T>(response);
  if (!Array.isArray(data)) throw new StoreRequestError("invalid_response");
  return data;
}

export async function getCategories(): Promise<StoreCategory[]> {
  if (IS_PREVIEW) return (await import("@/data/catalogue-preview.json")).categories;
  return storeFetch<StoreCategory[]>("products/categories?per_page=100");
}

type ProductFilters = {
  category?: number;
  search?: string;
};

async function getPreviewProducts(options: ProductFilters): Promise<StoreProduct[]> {
  const { products } = await import("@/data/catalogue-preview.json");
  const words = options.search?.toLowerCase().trim().split(/\s+/).filter(Boolean) ?? [];
  return products.filter((product) =>
    (!options.category || product.categories.some((category) => category.id === options.category)) &&
    words.every((word) => `${product.name} ${product.sku} ${htmlToText(product.description)}`.toLowerCase().includes(word)),
  );
}

export async function getPreviewProductCount(options: ProductFilters = {}): Promise<number> {
  return (await getPreviewProducts(options)).length;
}

export async function getProducts(options: ProductFilters & {
  perPage?: number;
  page?: number;
} = {}): Promise<StoreProduct[]> {
  if (IS_PREVIEW) {
    const filtered = await getPreviewProducts(options);
    const start = ((options.page ?? 1) - 1) * (options.perPage ?? 12);
    return filtered.slice(start, start + (options.perPage ?? 12));
  }
  const query = new URLSearchParams({
    per_page: String(options.perPage ?? 12),
    page: String(options.page ?? 1),
    orderby: "popularity",
  });

  if (options.category) query.set("category", String(options.category));
  if (options.search) query.set("search", options.search);

  return storeFetch<StoreProduct[]>(`products?${query.toString()}`);
}

export async function getProduct(slug: string): Promise<StoreProduct | null> {
  if (IS_PREVIEW) {
    const { products } = await import("@/data/catalogue-preview.json");
    return products.find((product) => product.slug === slug) ?? null;
  }
  const products = await storeFetch<StoreProduct[]>(
    `products?slug=${encodeURIComponent(slug)}&per_page=1`,
  );
  return products[0] ?? null;
}

export async function searchProductsLive(
  search: string,
): Promise<StoreProduct[]> {
  if (IS_PREVIEW) return getProducts({ search, perPage: 5 });
  const stopWords = new Set([
    "about", "and", "for", "from", "have", "help", "how", "need",
    "looking", "find", "part", "parts", "please", "the", "this", "what",
    "with", "you",
  ]);
  const keywords = (search.toLowerCase().match(/[a-z0-9*-]{3,}/g) ?? [])
    .filter((word) => !stopWords.has(word));
  const queries = [...new Set([search.trim(), ...keywords.slice(0, 2)])].filter(Boolean);

  const results = await Promise.all(
    queries.map(async (term) => {
      const query = new URLSearchParams({
        search: term,
        per_page: "5",
      });
      return storeFetch<StoreProduct[]>(`products?${query.toString()}`);
    }),
  );

  return [...new Map(results.flat().map((product) => [product.id, product])).values()]
    .slice(0, 5);
}

export function formatPrice(
  minorPrice: string,
  currencyCode = "ZAR",
  minorUnit = 2,
): string {
  const amount = Number(minorPrice) / 10 ** minorUnit;

  if (!Number.isFinite(amount) || amount <= 0) return "Price on request";

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: minorUnit,
  }).format(amount);
}

export function htmlToText(html: string): string {
  return html
    .replace(/\{loadmoduleid\s+\d+\}/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<\/(p|h[1-6]|li|tr|div|section)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, value: string) => {
      const codePoint = Number(value);
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : "";
    })
    .replace(/&#x([\da-f]+);/gi, (_, value: string) => {
      const codePoint = Number.parseInt(value, 16);
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : "";
    })
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
