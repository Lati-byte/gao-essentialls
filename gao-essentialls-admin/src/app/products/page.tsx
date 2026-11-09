import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, parseList } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { ProductRowActions } from "@/components/product-row-actions";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    stock?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const settings = await getSettings();
  const sym = settings.currencySymbol;

  // Build filter query
  const where: Prisma.ProductWhereInput = {};
  const and: Prisma.ProductWhereInput[] = [];

  const q = params.q?.trim();
  if (q) {
    and.push({
      OR: [
        { name: { contains: q } },
        { sku: { contains: q } },
        { description: { contains: q } },
      ],
    });
  }

  if (params.category) {
    and.push({ category: { slug: params.category } });
  }

  if (params.stock === "low") {
    and.push({ stock: { lte: 5, gt: 0 } });
  } else if (params.stock === "out") {
    and.push({ stock: { equals: 0 } });
  }

  if (and.length) where.AND = and;

  const pageSize = 20;
  const page = Math.max(1, parseInt(params.page || "1") || 1);

  const [categories, total, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function buildUrl(changes: Record<string, string | undefined>) {
    const updated = { ...params, ...changes };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(updated)) {
      if (v !== undefined && v !== "" && v !== null) {
        sp.set(k, v);
      }
    }
    return `/products?${sp.toString()}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage your store catalogue, inventory levels, and prices ({total} total products).
          </p>
        </div>

        <Link
          href="/products/new"
          className="btn-primary flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add New Product
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4">
        <form method="get" className="flex flex-wrap items-center gap-3">
          {/* Search text */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Search by name, SKU or description..."
              className="input pl-9 min-h-9 text-xs"
            />
          </div>

          {/* Category filter */}
          <div className="min-w-[150px]">
            <select
              name="category"
              defaultValue={params.category || ""}
              className="input min-h-9 py-1 text-xs"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock filter */}
          <div className="min-w-[130px]">
            <select
              name="stock"
              defaultValue={params.stock || ""}
              className="input min-h-9 py-1 text-xs"
            >
              <option value="">All Stock</option>
              <option value="low">Low Stock (≤ 5)</option>
              <option value="out">Out of Stock (0)</option>
            </select>
          </div>

          <button type="submit" className="btn-primary min-h-9 px-4 text-xs">
            Filter
          </button>

          {(params.q || params.category || params.stock) && (
            <Link
              href="/products"
              className="text-xs font-semibold text-danger hover:underline"
            >
              Reset
            </Link>
          )}
        </form>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-surface text-muted uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock Level</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const imgs = parseList(p.images);
                  const thumb = imgs[0] || "/images/placeholder.svg";

                  return (
                    <tr key={p.id} className="hover:bg-surface/50">
                      {/* Product image & name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface border border-line">
                            <Image
                              src={thumb}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/products/${p.id}`}
                              className="font-bold text-ink hover:text-primary transition-colors text-sm line-clamp-1"
                            >
                              {p.name}
                            </Link>
                            <span className="text-[10px] text-muted">SKU: {p.sku || "N/A"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="badge bg-surface text-ink border border-line">
                          {p.category.name}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-bold text-ink">
                          {formatPrice(p.salePrice ?? p.price, sym)}
                        </span>
                        {p.salePrice && (
                          <span className="block text-[10px] text-muted line-through">
                            {formatPrice(p.price, sym)}
                          </span>
                        )}
                      </td>

                      {/* Stock with quick edit */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            p.stock === 0
                              ? "text-danger"
                              : p.stock <= 5
                              ? "text-amber-600"
                              : "text-ink"
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.isFeatured ? (
                          <span className="badge bg-amber-100 text-amber-800 border border-amber-300">
                            ★ Featured
                          </span>
                        ) : (
                          <span className="text-muted text-[10px]">—</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <ProductRowActions
                          productId={p.id}
                          slug={p.slug}
                          stock={p.stock}
                          isActive={p.isActive}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-xs">
            <span className="text-muted">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="btn-outline min-h-0 px-2.5 py-1 text-xs"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="btn-outline min-h-0 px-2.5 py-1 text-xs"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
