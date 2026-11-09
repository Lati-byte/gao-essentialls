"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { effectivePrice, formatPrice, LOW_STOCK_THRESHOLD } from "@/lib/format";
import { useCart } from "./cart-context";

export type CardProduct = {
  id: number;
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

export function ProductCard({
  product,
  priority = false,
}: {
  product: CardProduct;
  priority?: boolean;
}) {
  const { addItem, settings } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const sym = settings.currencySymbol;
  const price = effectivePrice(product);
  const onSale = price < product.price;
  const discount = onSale ? Math.round((1 - price / product.price) * 100) : 0;
  const outOfStock = product.stock <= 0;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price,
      stock: product.stock,
      size: "",
      color: "",
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white transition-all duration-300 hover:border-neutral-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      {/* Product Image Stage */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-neutral-100/80"
        tabIndex={-1}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
        />

        {/* Minimal Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {onSale && (
            <span className="inline-flex items-center rounded-sm bg-neutral-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              Save {discount}%
            </span>
          )}
          {outOfStock ? (
            <span className="inline-flex items-center rounded-sm bg-neutral-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-300">
              Sold Out
            </span>
          ) : product.stock <= LOW_STOCK_THRESHOLD ? (
            <span className="inline-flex items-center rounded-sm border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
              {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Quick Add Desktop Floating Action Bar */}
        {!outOfStock && (
          <div className="absolute inset-x-3 bottom-3 hidden translate-y-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 sm:block z-10">
            {product.hasOptions ? (
              <span className="flex w-full items-center justify-center rounded-md bg-white/95 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-900 shadow-md backdrop-blur-xs transition-colors hover:bg-neutral-950 hover:text-white">
                Select Options
              </span>
            ) : (
              <button
                type="button"
                onClick={handleQuickAdd}
                className={`flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-xs transition-all ${
                  justAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-white/95 text-neutral-950 hover:bg-neutral-950 hover:text-white"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden /> Added
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5" aria-hidden /> Quick Add
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </Link>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category Eyebrow */}
        <Link
          href={`/category/${product.categorySlug}`}
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400 hover:text-neutral-950 transition-colors"
        >
          {product.categoryName}
        </Link>

        {/* Product Title */}
        <h3 className="mt-1.5 line-clamp-2 text-sm font-medium text-neutral-900 transition-colors group-hover:text-neutral-600">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Price Row */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-sm font-bold text-neutral-950 sm:text-base">
            {formatPrice(price, sym)}
          </span>
          {onSale && (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(product.price, sym)}
            </span>
          )}
        </div>

        {/* Mobile-only Action Bar */}
        <div className="mt-4 pt-3 border-t border-neutral-100 sm:hidden">
          {outOfStock ? (
            <button
              type="button"
              disabled
              className="w-full rounded-md border border-neutral-200 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-400"
            >
              Sold Out
            </button>
          ) : product.hasOptions ? (
            <Link
              href={`/product/${product.slug}`}
              className="block w-full rounded-md border border-neutral-300 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-900 hover:bg-neutral-50"
            >
              Select Options
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`w-full rounded-md py-2 text-center text-[11px] font-bold uppercase tracking-wider transition-colors ${
                justAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-950 text-white hover:bg-neutral-800"
              }`}
            >
              {justAdded ? "Added to Bag" : "Add to Bag"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: CardProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
