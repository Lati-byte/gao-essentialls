import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseList } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { ProductForm } from "@/components/product-form";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
  await requireAdmin();
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);

  if (!id) {
    notFound();
  }

  const [product, categories, settings] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId,
    price: product.price,
    salePrice: product.salePrice,
    stock: product.stock,
    sku: product.sku,
    images: parseList(product.images),
    sizes: parseList(product.sizes),
    colors: parseList(product.colors),
    isFeatured: product.isFeatured,
    isActive: product.isActive,
  };

  return (
    <div className="max-w-5xl mx-auto">
      <ProductForm
        initialData={initialData}
        categories={categories}
        currencySymbol={settings.currencySymbol}
        justSaved={saved === "true"}
        storeUrl={process.env.NEXT_PUBLIC_STORE_URL || "https://gaoessentialls.co.za"}
      />
    </div>
  );
}
