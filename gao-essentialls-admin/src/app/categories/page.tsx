import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CategoryManager } from "@/components/category-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return <CategoryManager categories={categories} />;
}
