import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getCategories } from "@/lib/woocommerce";
import { loadCatalogue } from "@/lib/store-request";
import { StoreUnavailable } from "@/components/StoreUnavailable";

export default async function LegacyCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadCatalogue(getCategories);
  if (!result.data) return <main className="page-shell"><StoreUnavailable /></main>;
  const categories = result.data;
  if (!categories.some((category) => category.slug === slug)) notFound();
  redirect(`/shop?category=${encodeURIComponent(slug)}`);
}
