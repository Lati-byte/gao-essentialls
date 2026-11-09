"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z.string().optional(),
  description: z.string().default(""),
  categoryId: z.string().min(1, "Please select a category"),
  price: z.coerce.number().min(0, "Price must be positive"),
  salePrice: z.coerce
    .number()
    .optional()
    .nullable()
    .transform((val) => (val && val > 0 ? val : null)),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().default(""),
  images: z.string().default("[]"),
  sizes: z.string().default("[]"),
  colors: z.string().default("[]"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type ProductFormResult = { error?: string; success?: boolean; id?: string };

export async function saveProduct(
  prevState: ProductFormResult | undefined,
  formData: FormData
): Promise<ProductFormResult> {
  await requireAdmin();

  const idRaw = formData.get("id");
  const id = idRaw ? String(idRaw).trim() || undefined : undefined;

  const rawData = {
    id,
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    categoryId: String(formData.get("categoryId") || "").trim(),
    price: formData.get("price"),
    salePrice: formData.get("salePrice") || null,
    stock: formData.get("stock") || 0,
    sku: String(formData.get("sku") || "").trim(),
    images: String(formData.get("images") || "[]"),
    sizes: String(formData.get("sizes") || "[]"),
    colors: String(formData.get("colors") || "[]"),
    isFeatured: formData.get("isFeatured") === "true" || formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on",
  };

  const parsed = productSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input data." };
  }

  const data = parsed.data;
  const baseSlug = data.slug ? slugify(data.slug) : slugify(data.name);

  let createdId: string | null = null;
  try {
    let finalSlug = baseSlug;
    // Ensure slug uniqueness
    const existingSlug = await prisma.product.findFirst({
      where: {
        slug: finalSlug,
        id: id ? { not: id } : undefined,
      },
    });

    if (existingSlug) {
      finalSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    if (id) {
      await prisma.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: finalSlug,
          description: data.description,
          categoryId: data.categoryId,
          price: data.price,
          salePrice: data.salePrice,
          stock: data.stock,
          sku: data.sku,
          images: data.images,
          sizes: data.sizes,
          colors: data.colors,
          isFeatured: data.isFeatured,
          isActive: data.isActive,
        },
      });
    } else {
      const created = await prisma.product.create({
        data: {
          name: data.name,
          slug: finalSlug,
          description: data.description,
          categoryId: data.categoryId,
          price: data.price,
          salePrice: data.salePrice,
          stock: data.stock,
          sku: data.sku || `GAO-${Math.floor(1000 + Math.random() * 9000)}`,
          images: data.images,
          sizes: data.sizes,
          colors: data.colors,
          isFeatured: data.isFeatured,
          isActive: data.isActive,
        },
      });
      createdId = created.id;
    }

    revalidatePath("/products");
    if (!createdId && id) {
      revalidatePath(`/products/${id}`);
    }
  } catch (error) {
    console.error("Save product error:", error);
    return { error: "Failed to save product in database." };
  }

  if (createdId) {
    redirect(`/products/${createdId}?saved=true`);
  }

  return { success: true, id };
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return { success: false, error: "Cannot delete product (it may be linked to previous orders)." };
  }
}

export async function quickUpdateStock(
  id: string,
  stock: number
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.product.update({
      where: { id },
      data: { stock: Math.max(0, stock) },
    });
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update stock" };
  }
}

export async function toggleProductActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.product.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle status" };
  }
}
