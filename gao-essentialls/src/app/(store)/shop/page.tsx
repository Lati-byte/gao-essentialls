import Link from "next/link";
import { ProductGrid } from "@/components/store/product-card";
import { getActiveCategories, searchProducts } from "@/lib/catalog";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    min?: string;
    max?: string;
    inStock?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [categories, { products, total, page, pages }] = await Promise.all([
    getActiveCategories(),
    searchProducts(params),
  ]);

  const activeCategory = categories.find((c) => c.slug === params.category);

  // Helper to build query URL
  function buildUrl(changes: Record<string, string | undefined>) {
    const updated = { ...params, ...changes };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(updated)) {
      if (v !== undefined && v !== "" && v !== null) {
        sp.set(k, v);
      }
    }
    return `/shop?${sp.toString()}`;
  }

  const hasActiveFilters = Boolean(
    params.category || params.q || params.min || params.max || params.inStock
  );

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4 text-xs font-medium text-neutral-400">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-neutral-950 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-neutral-300">/</li>
          <li className={activeCategory ? "hover:text-neutral-950" : "text-neutral-950 font-semibold"}>
            <Link href="/shop">Shop</Link>
          </li>
          {activeCategory && (
            <>
              <li aria-hidden="true" className="text-neutral-300">/</li>
              <li className="text-neutral-950 font-semibold">{activeCategory.name}</li>
            </>
          )}
        </ol>
      </nav>

      {/* Page Title & Sort Toolbar */}
      <div className="mb-8 flex flex-col gap-4 border-b border-neutral-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            {params.q ? "Search Index" : activeCategory ? "Curated Department" : "Catalogue Index"}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
            {params.q
              ? `Results for "${params.q}"`
              : activeCategory
              ? activeCategory.name
              : "All Products"}
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Showing {products.length > 0 ? (page - 1) * 12 + 1 : 0}–{Math.min(page * 12, total)} of {total} products
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <form method="get" className="flex items-center gap-2">
            {params.q && <input type="hidden" name="q" value={params.q} />}
            {params.category && <input type="hidden" name="category" value={params.category} />}
            {params.min && <input type="hidden" name="min" value={params.min} />}
            {params.max && <input type="hidden" name="max" value={params.max} />}
            {params.inStock && <input type="hidden" name="inStock" value={params.inStock} />}

            <label htmlFor="sort-select" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 whitespace-nowrap">
              <ArrowUpDown className="h-3.5 w-3.5" aria-hidden /> Sort:
            </label>
            <select
              id="sort-select"
              name="sort"
              defaultValue={params.sort || ""}
              className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 focus:border-neutral-950 focus:outline-none"
            >
              <option value="">Featured</option>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Product Name</option>
            </select>
            <button
              type="submit"
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:border-neutral-950 hover:bg-neutral-50"
            >
              Apply
            </button>
          </form>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Active Filters:
          </span>
          {params.q && (
            <Link
              href={buildUrl({ q: undefined, page: "1" })}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-800 hover:bg-neutral-200"
            >
              <span>Query: &ldquo;{params.q}&rdquo;</span>
              <X className="h-3 w-3" aria-hidden />
            </Link>
          )}
          {activeCategory && (
            <Link
              href={buildUrl({ category: undefined, page: "1" })}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-800 hover:bg-neutral-200"
            >
              <span>Category: {activeCategory.name}</span>
              <X className="h-3 w-3" aria-hidden />
            </Link>
          )}
          {params.inStock && (
            <Link
              href={buildUrl({ inStock: undefined, page: "1" })}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-800 hover:bg-neutral-200"
            >
              <span>In Stock Only</span>
              <X className="h-3 w-3" aria-hidden />
            </Link>
          )}
          {(params.min || params.max) && (
            <Link
              href={buildUrl({ min: undefined, max: undefined, page: "1" })}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-800 hover:bg-neutral-200"
            >
              <span>Price: {params.min ? `R${params.min}` : "R0"} - {params.max ? `R${params.max}` : "Any"}</span>
              <X className="h-3 w-3" aria-hidden />
            </Link>
          )}
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-950 underline ml-2"
          >
            Clear All
          </Link>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters Sidebar */}
        <aside aria-label="Filters" className="space-y-6">
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-5">
            <h2 className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-neutral-950">
              <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-600" aria-hidden />
              Departments
            </h2>

            <ul className="mt-3.5 space-y-1 text-xs font-medium">
              <li>
                <Link
                  href={buildUrl({ category: undefined, page: "1" })}
                  className={`block rounded-md px-3 py-2 transition-colors ${
                    !params.category
                      ? "bg-neutral-950 font-bold text-white shadow-xs"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                  }`}
                >
                  All Categories
                </Link>
              </li>
              {categories.map((c) => {
                const isSelected = params.category === c.slug;
                return (
                  <li key={c.id}>
                    <Link
                      href={buildUrl({ category: c.slug, page: "1" })}
                      className={`flex items-center justify-between rounded-md px-3 py-2 transition-colors ${
                        isSelected
                          ? "bg-neutral-950 font-bold text-white shadow-xs"
                          : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className={`text-[11px] ${isSelected ? "text-neutral-300" : "text-neutral-400"}`}>
                        {c._count.products}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* In-Stock Filter */}
            <div className="mt-6 border-t border-neutral-200 pt-5">
              <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-950">
                Availability
              </h2>
              <div className="mt-3">
                <Link
                  href={buildUrl({
                    inStock: params.inStock === "1" ? undefined : "1",
                    page: "1",
                  })}
                  className={`flex items-center gap-2.5 text-xs ${
                    params.inStock === "1" ? "font-bold text-neutral-950" : "text-neutral-600 hover:text-neutral-950"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={params.inStock === "1"}
                    readOnly
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
                  />
                  <span>In Stock Only</span>
                </Link>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mt-6 border-t border-neutral-200 pt-5">
              <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-950">
                Price Range
              </h2>
              <form method="get" className="mt-3 space-y-2.5">
                {params.q && <input type="hidden" name="q" value={params.q} />}
                {params.category && <input type="hidden" name="category" value={params.category} />}
                {params.sort && <input type="hidden" name="sort" value={params.sort} />}
                {params.inStock && <input type="hidden" name="inStock" value={params.inStock} />}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="min"
                    placeholder="Min"
                    defaultValue={params.min || ""}
                    className="h-9 w-full rounded-md border border-neutral-300 bg-white px-2.5 text-xs text-neutral-900 focus:border-neutral-950 focus:outline-none"
                  />
                  <span className="text-neutral-400">-</span>
                  <input
                    type="number"
                    name="max"
                    placeholder="Max"
                    defaultValue={params.max || ""}
                    className="h-9 w-full rounded-md border border-neutral-300 bg-white px-2.5 text-xs text-neutral-900 focus:border-neutral-950 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-neutral-950 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
                >
                  Filter Price
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-12 text-center">
              <p className="font-heading text-base font-bold text-neutral-950">No products found</p>
              <p className="mt-2 max-w-sm text-xs text-neutral-500 leading-relaxed">
                We couldn&apos;t find matching items with the current filters. Try loosening your criteria or resetting filters.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex rounded-md bg-neutral-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
              >
                Reset All Filters
              </Link>
            </div>
          ) : (
            <>
              <ProductGrid products={products} />

              {/* Minimal Pagination */}
              {pages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-1.5">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ page: String(page - 1) })}
                      className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:border-neutral-950 hover:bg-neutral-50"
                    >
                      Prev
                    </Link>
                  )}
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === page;
                    return (
                      <Link
                        key={p}
                        href={buildUrl({ page: String(p) })}
                        className={`grid h-8 w-8 place-items-center rounded-md text-xs font-bold transition-colors ${
                          isCurrent
                            ? "bg-neutral-950 text-white"
                            : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                  {page < pages && (
                    <Link
                      href={buildUrl({ page: String(page + 1) })}
                      className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:border-neutral-950 hover:bg-neutral-50"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
