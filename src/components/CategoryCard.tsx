import Image from "next/image";
import Link from "next/link";
import artwork from "@/data/category-artwork.json";
import type { StoreCategory } from "@/lib/woocommerce";

export function CategoryCard({ category, index }: { category: StoreCategory; index: number }) {
  const photo = artwork[category.slug as keyof typeof artwork];
  const source = photo ?? category.image?.src;

  return (
    <Link className={`category-tile${photo ? " category-photo-tile" : ""}`} href={`/shop?category=${category.slug}`}>
      {source && <Image src={source} width={photo ? 640 : 180} height={photo ? 640 : 140} sizes="(max-width: 700px) 42vw, (max-width: 1000px) 28vw, 21vw" alt="" loading="lazy" />}
      <span className="category-number">{String(index + 1).padStart(2, "0")}</span>
      <span className="category-name">{category.name}</span>
      <span className="category-arrow" aria-hidden="true">↗</span>
    </Link>
  );
}
