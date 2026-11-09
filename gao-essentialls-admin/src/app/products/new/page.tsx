import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ProductForm } from "@/components/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const [categories, settings] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getSettings(),
  ]);

  return (
    <div className="max-w-5xl mx-auto">
      <ProductForm categories={categories} currencySymbol={settings.currencySymbol} />
    </div>
  );
}
