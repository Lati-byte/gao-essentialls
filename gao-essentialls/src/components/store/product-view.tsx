"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Check,
  ChevronDown,
  CreditCard,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { effectivePrice, formatPrice, LOW_STOCK_THRESHOLD } from "@/lib/format";
import { useCart } from "./cart-context";

interface ProductViewProps {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    salePrice: number | null;
    stock: number;
    sku: string;
    images: string[];
    sizes: string[];
    colors: string[];
    category: {
      name: string;
      slug: string;
    };
  };
}

export function ProductView({ product }: ProductViewProps) {
  const { addItem, settings } = useCart();
  const sym = settings.currencySymbol;
  const price = effectivePrice(product);
  const onSale = price < product.price;
  const discount = onSale ? Math.round((1 - price / product.price) * 100) : 0;
  const isOutOfStock = product.stock <= 0;

  const [activeImage, setActiveImage] = useState(
    product.images[0] || "/images/placeholder.svg"
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.length > 0 ? product.sizes[0] : ""
  );
  const [selectedColor, setSelectedColor] = useState(
    product.colors.length > 0 ? product.colors[0] : ""
  );
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  function handleAddToCart() {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: activeImage,
      price,
      stock: product.stock,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  }

  function toggleAccordion(key: string) {
    setOpenAccordion((prev) => (prev === key ? null : key));
  }

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      {/* Product Image Gallery (7 Cols Desktop) */}
      <div className="space-y-4 lg:col-span-7">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-200/80">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover transition-all duration-300"
          />

          {/* Minimalist Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
            {onSale && (
              <span className="inline-flex items-center rounded-sm bg-neutral-950 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs">
                Save {discount}%
              </span>
            )}
            {isOutOfStock ? (
              <span className="inline-flex items-center rounded-sm bg-neutral-800 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-neutral-300">
                Sold Out
              </span>
            ) : null}
          </div>
        </div>

        {/* Thumbnail Selector */}
        {product.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  activeImage === img
                    ? "border-neutral-950 ring-1 ring-neutral-950"
                    : "border-neutral-200 opacity-70 hover:opacity-100 hover:border-neutral-400"
                }`}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Purchase & Information Details (5 Cols Desktop) */}
      <div className="flex flex-col lg:col-span-5">
        {/* Category & Title */}
        <Link
          href={`/category/${product.category.slug}`}
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-950 transition-colors"
        >
          {product.category.name}
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl lg:text-4xl">
          {product.name}
        </h1>

        {product.sku && (
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            SKU: {product.sku}
          </p>
        )}

        {/* Price Display */}
        <div className="mt-5 flex items-baseline gap-3 border-b border-neutral-200/80 pb-5">
          <span className="font-heading text-3xl font-extrabold text-neutral-950 sm:text-4xl">
            {formatPrice(price, sym)}
          </span>
          {onSale && (
            <span className="text-base text-neutral-400 line-through">
              {formatPrice(product.price, sym)}
            </span>
          )}
          {onSale && (
            <span className="ml-auto inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-900 border border-amber-200">
              Save {formatPrice(product.price - price, sym)}
            </span>
          )}
        </div>

        {/* Stock Status Indicator */}
        <div className="mt-4 flex items-center gap-2 text-xs">
          {isOutOfStock ? (
            <>
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="font-medium text-neutral-600">Currently out of stock</span>
            </>
          ) : product.stock <= LOW_STOCK_THRESHOLD ? (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-semibold text-amber-900">
                Low Stock — Only {product.stock} units left
              </span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-neutral-700">In Stock and ready for dispatch</span>
            </>
          )}
        </div>

        {/* Variant Selectors */}
        <div className="mt-6 space-y-6">
          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  Select Size
                </label>
                <span className="text-xs text-neutral-500 font-medium">{selectedSize}</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`min-h-10 min-w-11 rounded-md px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                      selectedSize === s
                        ? "bg-neutral-950 text-white shadow-xs"
                        : "border border-neutral-300 bg-white text-neutral-800 hover:border-neutral-950"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  Select Colour
                </label>
                <span className="text-xs text-neutral-500 font-medium">{selectedColor}</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`min-h-10 rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                      selectedColor === c
                        ? "bg-neutral-950 text-white shadow-xs"
                        : "border border-neutral-300 bg-white text-neutral-800 hover:border-neutral-950"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Primary Action */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              {/* Stepper */}
              <div className="flex items-center rounded-md border border-neutral-300 bg-white">
                <button
                  type="button"
                  className="grid h-12 w-11 place-items-center text-neutral-600 hover:text-neutral-950 disabled:opacity-30 transition-colors"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </button>
                <span className="w-10 text-center text-xs font-bold" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="grid h-12 w-11 place-items-center text-neutral-600 hover:text-neutral-950 disabled:opacity-30 transition-colors"
                  disabled={quantity >= product.stock || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 rounded-md py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isOutOfStock
                    ? "cursor-not-allowed bg-neutral-200 text-neutral-400"
                    : "bg-neutral-950 text-white hover:bg-neutral-800 active:scale-[0.99]"
                }`}
              >
                <ShoppingBag className="h-4 w-4" aria-hidden />
                {isOutOfStock ? "Sold Out" : "Add to Bag"}
              </button>
            </div>

            {/* Added Toast Pill */}
            {addedNotice && (
              <div className="flex items-center justify-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 py-2.5 text-xs font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-1 duration-200">
                <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                <span>Successfully added to your shopping bag.</span>
              </div>
            )}
          </div>
        </div>

        {/* Editorial Accordion Details */}
        <div className="mt-10 divide-y divide-neutral-200 border-t border-b border-neutral-200">
          {/* Description */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleAccordion("description")}
              className="flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-950"
            >
              <span>Product Description & Features</span>
              <ChevronDown
                className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${
                  openAccordion === "description" ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>
            {openAccordion === "description" && (
              <div className="mt-3 text-xs leading-relaxed text-neutral-600 space-y-2">
                <p>{product.description}</p>
              </div>
            )}
          </div>

          {/* Shipping & Delivery */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleAccordion("shipping")}
              className="flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-950"
            >
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-neutral-500" aria-hidden />
                <span>Shipping & Delivery Options</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${
                  openAccordion === "shipping" ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>
            {openAccordion === "shipping" && (
              <div className="mt-3 text-xs leading-relaxed text-neutral-600 space-y-2">
                <p>
                  • <strong>Free Nationwide Delivery</strong> on orders over{" "}
                  {formatPrice(settings.freeDeliveryThreshold, sym)}.
                </p>
                <p>
                  • Standard courier delivery fee: R{settings.deliveryFee} for orders below threshold.
                </p>
                <p>• Estimated delivery time: 2–4 business days with end-to-end parcel tracking.</p>
                <p>• In-store collection available at our warehouse location free of charge.</p>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleAccordion("payment")}
              className="flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-950"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-neutral-500" aria-hidden />
                <span>Payment Methods</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${
                  openAccordion === "payment" ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>
            {openAccordion === "payment" && (
              <div className="mt-3 text-xs leading-relaxed text-neutral-600 space-y-2">
                <p>• <strong>Cash on Delivery (COD)</strong>: Pay in cash directly to courier upon arrival.</p>
                <p>• <strong>Instant EFT</strong>: Direct bank transfer to our verified business account.</p>
                <p>• <strong>Pay on Collection</strong>: Settle via card or cash when picking up your order.</p>
              </div>
            )}
          </div>

          {/* 7-Day Guarantee */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleAccordion("returns")}
              className="flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-950"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-neutral-500" aria-hidden />
                <span>7-Day Return Guarantee</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${
                  openAccordion === "returns" ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>
            {openAccordion === "returns" && (
              <div className="mt-3 text-xs leading-relaxed text-neutral-600 space-y-2">
                <p>
                  We stand by the quality of our products. If you are not satisfied, return unused items in their original packaging within 7 days for an exchange or refund.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
