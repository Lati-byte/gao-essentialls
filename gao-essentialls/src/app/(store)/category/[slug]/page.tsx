import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/store/product-card";
import { prisma } from "@/lib/db";
import { searchProducts } from "@/lib/catalog";
import { ArrowUpDown, Check } from "lucide-react";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    min?: string;
    max?: string;
    inStock?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const qParams = await searchParams;

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category || !category.isActive) {
    notFound();
  }

  const { products, total, page, pages } = await searchProducts({
    ...qParams,
    category: slug,
  });

  function buildUrl(changes: Record<string, string | undefined>) {
    const updated = { ...qParams, ...changes };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(updated)) {
      if (v !== undefined && v !== "" && v !== null) {
        sp.set(k, v);
      }
    }
    return `/category/${slug}?${sp.toString()}`;
  }

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 text-xs font-medium text-neutral-400">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-neutral-950 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-neutral-300">/</li>
          <li>
            <Link href="/shop" className="hover:text-neutral-950 transition-colors">
              Shop
            </Link>
          </li>
          <li aria-hidden="true" className="text-neutral-300">/</li>
          <li className="text-neutral-950 font-semibold">{category.name}</li>
        </ol>
      </nav>

      {/* Editorial Category Header */}
      <div className="relative mb-10 overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-900 text-white">
        <div className="grid items-center gap-6 p-6 sm:p-10 md:grid-cols-[1fr_260px]">
          <div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Department
            </span>
            <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
              {category.name}
            </h1>
            <p className="mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-neutral-300">
              {category.description || `Discover our wide range of ${category.name.toLowerCase()} curated for everyday durability, style, and comfort.`}
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <span>{total} {total === 1 ? "Product" : "Products"} Available</span>
            </div>
          </div>

          {category.image && (
            <div className="relative aspect-square w-full max-w-[240px] overflow-hidden rounded-xl bg-neutral-800 shadow-md mx-auto md:mx-0">
              <Image
                src={category.image}
                alt={category.name}
                fill
                priority
                sizes="240px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="mb-8 flex flex-col gap-4 border-b border-neutral-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={buildUrl({
              inStock: qParams.inStock === "1" ? undefined : "1",
              page: "1",
            })}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              qParams.inStock === "1"
                ? "bg-neutral-950 text-white shadow-xs"
                : "border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-950"
            }`}
          >
            {qParams.inStock === "1" && <Check className="h-3 w-3" aria-hidden />}
            <span>In Stock Only</span>
          </Link>

          {(qParams.min || qParams.max || qParams.inStock || qParams.sort) && (
            <Link
              href={`/category/${slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-950 underline ml-2"
            >
              Reset Filters
            </Link>
          )}
        </div>

        {/* Sort select */}
        <form method="get" className="flex items-center gap-2">
          {qParams.min && <input type="hidden" name="min" value={qParams.min} />}
          {qParams.max && <input type="hidden" name="max" value={qParams.max} />}
          {qParams.inStock && <input type="hidden" name="inStock" value={qParams.inStock} />}

          <label htmlFor="cat-sort" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-500 whitespace-nowrap">
            <ArrowUpDown className="h-3.5 w-3.5" aria-hidden /> Sort:
          </label>
          <select
            id="cat-sort"
            name="sort"
            defaultValue={qParams.sort || ""}
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
            Sort
          </button>
        </form>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-12 text-center">
          <p className="font-heading text-base font-bold text-neutral-950">No products found in this category</p>
          <p className="mt-2 max-w-sm text-xs text-neutral-500">
            Check back soon or explore our other curated collections.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-md bg-neutral-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
          >
            View All Products
          </Link>
        </div>
      ) : (
        <>
          <ProductGrid products={products} />

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
    </div>
  );
}
