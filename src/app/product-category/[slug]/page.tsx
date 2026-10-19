import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getCategories } from "@/lib/woocommerce";

export default async function LegacyCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategories();
  if (!categories.some((category) => category.slug === slug)) notFound();
  redirect(`/shop?category=${encodeURIComponent(slug)}`);
}
