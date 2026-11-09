import "server-only";
import type { Category, Prisma, Product } from "@prisma/client";
import { prisma } from "./db";
import { parseList } from "./format";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  image: string;
  stock: number;
  categoryName: string;
  categorySlug: string;
  hasOptions: boolean;
};

export function toCardData(p: Product & { category: Category }): ProductCardData {
  const images = parseList(p.images);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    salePrice: p.salePrice,
    image: images[0] ?? "/images/placeholder.svg",
    stock: p.stock,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
    hasOptions: parseList(p.sizes).length > 0 || parseList(p.colors).length > 0,
  };
}

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
}

export type ShopQuery = {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  inStock?: string;
  sort?: string;
  page?: string;
};

export const PAGE_SIZE = 12;

export async function searchProducts(query: ShopQuery) {
  const where: Prisma.ProductWhereInput = { isActive: true, category: { isActive: true } };
  const and: Prisma.ProductWhereInput[] = [];

  const q = query.q?.trim();
  if (q) and.push({ OR: [{ name: { contains: q } }, { description: { contains: q } }, { category: { name: { contains: q } } }] });
  if (query.category) and.push({ category: { slug: query.category } });

  const min = Number(query.min);
  const max = Number(query.max);
  if (query.min && !Number.isNaN(min)) and.push({ price: { gte: min } });
  if (query.max && !Number.isNaN(max)) and.push({ price: { lte: max } });
  if (query.inStock === "1") and.push({ stock: { gt: 0 } });
  if (and.length) where.AND = and;

  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ isFeatured: "desc" }, { createdAt: "desc" }];
  if (query.sort === "price-asc") orderBy = [{ price: "asc" }];
  if (query.sort === "price-desc") orderBy = [{ price: "desc" }];
  if (query.sort === "newest") orderBy = [{ createdAt: "desc" }];
  if (query.sort === "name") orderBy = [{ name: "asc" }];

  const page = Math.max(1, Number(query.page) || 1);
  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      include: { category: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return { total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), products: rows.map(toCardData) };
}
