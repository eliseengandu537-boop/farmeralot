import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

// Export only previously retrieved public product/category records, never carts or credentials.
const require = createRequire(import.meta.url);
const { ImageOptimizerCache } = require("next/dist/server/image-optimizer");
const cache = path.resolve(".next/cache/fetch-cache");
const imageCache = path.resolve(".next/cache/images");
const products = new Map();
let categories = [];
let popularity = [];
for (const name of fs.readdirSync(cache)) {
  try {
    const record = JSON.parse(fs.readFileSync(path.join(cache, name), "utf8")).data;
    if (!record || record.status !== 200) continue;
    const url = new URL(record.url);
    if (url.hostname !== "farmeralot.co.za") continue;
    if (!["/wp-json/wc/store/v1/products", "/wp-json/wc/store/v1/products/categories"].includes(url.pathname)) continue;
    const data = JSON.parse(Buffer.from(record.body, "base64").toString("utf8"));
    if (!Array.isArray(data)) continue;
    if (url.pathname.endsWith("categories")) categories = data;
    else {
      for (const product of data) if (product.id && product.slug && product.prices) products.set(product.id, product);
      if (url.searchParams.get("per_page") === "24" && !url.searchParams.has("category")) popularity = data.map((product) => product.id);
    }
  } catch { /* Ignore non-catalogue or incomplete cache entries. */ }
}
if (!products.size || !categories.length) throw new Error("No successful public catalogue cache is available.");
fs.mkdirSync("src/data", { recursive: true });
fs.mkdirSync("public/catalogue", { recursive: true });
let copied = 0;
function localImage(src, label) {
  for (const width of [1920, 1200, 1080, 828, 750, 640, 384, 256, 180, 128, 96]) {
    for (const mimeType of ["image/webp", "image/avif", ""]) {
      const key = ImageOptimizerCache.getCacheKey({ href: src, width, quality: 75, mimeType });
      const folder = path.join(imageCache, key);
      if (!fs.existsSync(folder)) continue;
      const file = fs.readdirSync(folder).find((name) => /\.(webp|avif|png|jpg|jpeg)$/.test(name));
      if (!file) continue;
      const destination = `${label}${path.extname(file)}`;
      fs.copyFileSync(path.join(folder, file), path.join("public/catalogue", destination));
      copied++;
      return `/catalogue/${destination}`;
    }
  }
  return undefined;
}
function text(value = "") {
  return value.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
const previewProducts = [...products.values()].sort((a, b) => {
  const ai = popularity.indexOf(a.id), bi = popularity.indexOf(b.id);
  return (ai < 0 ? 1000 : ai) - (bi < 0 ? 1000 : bi) || a.name.localeCompare(b.name);
}).map((product) => ({
  id: product.id, name: text(product.name), slug: product.slug, sku: product.sku,
  permalink: product.permalink, short_description: product.short_description,
  description: product.description, prices: product.prices,
  categories: product.categories.map((category) => ({ ...category, name: text(category.name) })),
  is_in_stock: product.is_in_stock, add_to_cart: product.add_to_cart,
  images: product.images.slice(0, 1).flatMap((image) => {
    const src = localImage(image.src, `product-${product.id}`);
    return src ? [{ id: image.id, src, thumbnail: src, alt: text(image.alt || product.name) }] : [];
  }),
}));
const previewCategories = categories.map((category) => {
  const src = category.image?.src && localImage(category.image.src, `category-${category.id}`);
  return {
    id: category.id, name: text(category.name), slug: category.slug,
    count: previewProducts.filter((product) => product.categories.some((item) => item.id === category.id)).length,
    image: src ? { id: category.image.id, src, thumbnail: src, alt: category.name } : null,
  };
});
const logo = localImage("https://farmeralot.co.za/wp-content/uploads/2024/11/Farmeralot-Logos_FARMALOT_-FC-_-LOGO-ON-BLACK-06-2-1-e1731861053463.png", "farmeralot-logo");
fs.writeFileSync("src/data/catalogue-preview.json", JSON.stringify({
  source: "Previously successful public Farmeralot Store API responses from the local Next.js cache",
  exportedAt: new Date().toISOString(), logo, categories: previewCategories, products: previewProducts,
}, null, 2));
fs.writeFileSync("src/data/preview-basket-products.json", JSON.stringify(previewProducts.map(({ id, name, sku, prices, images }) => ({ id, name, sku, prices, images }))));
console.log(`Prepared ${previewProducts.length} real cached products, ${previewCategories.length} categories, and ${copied} local images. No live requests made.`);
