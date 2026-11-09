"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";

const categorySchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z.string().optional(),
  description: z.string().default(""),
  image: z.string().default(""),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function saveCategory(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const idRaw = formData.get("id");
  const id = idRaw ? Number(idRaw) : undefined;

  const raw = {
    id,
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    image: String(formData.get("image") || "").trim(),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on",
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid category data" };
  }

  const data = parsed.data;
  const baseSlug = data.slug ? slugify(data.slug) : slugify(data.name);

  try {
    let finalSlug = baseSlug;
    const existing = await prisma.category.findFirst({
      where: {
        slug: finalSlug,
        id: id ? { not: id } : undefined,
      },
    });

    if (existing) {
      finalSlug = `${baseSlug}-${Math.floor(10 + Math.random() * 90)}`;
    }

    if (id) {
      await prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          slug: finalSlug,
          description: data.description,
          image: data.image,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
        },
      });
    } else {
      await prisma.category.create({
        data: {
          name: data.name,
          slug: finalSlug,
          description: data.description,
          image: data.image,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
        },
      });
    }

    revalidatePath("/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Save category error:", error);
    return { success: false, error: "Failed to save category." };
  }
}

export async function deleteCategory(id: number): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    const productsCount = await prisma.product.count({ where: { categoryId: id } });
    if (productsCount > 0) {
      return {
        success: false,
        error: `Cannot delete category: it currently contains ${productsCount} products. Please reassign or delete the products first.`,
      };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, error: "Database error deleting category." };
  }
}
