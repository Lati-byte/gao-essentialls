import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseList } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { ProductForm } from "@/components/product-form";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireAdmin();
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    notFound();
  }

  const [product, categories, settings] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
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
      />
    </div>
  );
}
