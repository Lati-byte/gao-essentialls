"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/store/cart-context";

export default function CartPage() {
  const { items, count, subtotal, updateQuantity, removeItem, clear, settings } = useCart();
  const sym = settings.currencySymbol;

  const qualifiesForFreeDelivery =
    settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold;
  const remainingForFree = Math.max(0, settings.freeDeliveryThreshold - subtotal);
  const deliveryEstimate = qualifiesForFreeDelivery ? 0 : settings.deliveryFee;
  const total = subtotal + (items.length > 0 ? deliveryEstimate : 0);

  if (items.length === 0) {
    return (
      <div className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-md rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-neutral-100 text-neutral-400">
            <ShoppingBag className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-heading text-xl font-bold text-neutral-950">Your bag is empty</h1>
          <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
            Discover our curated essentials across appliances, blankets, apparel, cookware, and footwear.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-neutral-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <span>Start Shopping</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

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
          <li className="text-neutral-950 font-semibold">Shopping Bag</li>
        </ol>
      </nav>

      {/* Page Title & Clear Bag Trigger */}
      <div className="flex items-end justify-between border-b border-neutral-200/80 pb-5 mb-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Review</p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
            Shopping Bag{" "}
            <span className="text-sm font-normal text-neutral-400">
              ({count} {count === 1 ? "item" : "items"})
            </span>
          </h1>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Line Items List */}
        <div className="space-y-4">
          <div className="divide-y divide-neutral-200/80 rounded-xl border border-neutral-200/80 bg-white overflow-hidden">
            {items.map((item) => (
              <div key={item.key} className="flex flex-col sm:flex-row gap-5 p-5">
                {/* Image */}
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200/60">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-heading text-sm font-semibold text-neutral-950 hover:text-neutral-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                      {(item.size || item.color) && (
                        <p className="mt-1 text-xs text-neutral-500">
                          {[
                            item.size && `Size: ${item.size}`,
                            item.color && `Colour: ${item.color}`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                      <p className="mt-1.5 text-xs text-neutral-500 font-medium">
                        Unit price: {formatPrice(item.price, sym)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                      title="Remove item"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Quantity Stepper and Line Total */}
                  <div className="mt-4 flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-md border border-neutral-300 bg-white">
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center text-neutral-600 hover:text-neutral-950 disabled:opacity-30"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center text-neutral-600 hover:text-neutral-950 disabled:opacity-30"
                        disabled={item.quantity >= item.stock}
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    <span className="font-heading text-sm font-bold text-neutral-950">
                      {formatPrice(item.price * item.quantity, sym)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-neutral-950 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside aria-label="Order summary">
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-6 space-y-5">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-950">
              Order Summary
            </h2>

            {/* Free Shipping Qualification Meter */}
            {settings.freeDeliveryThreshold > 0 && (
              <div className="rounded-lg border border-neutral-200 bg-white p-3.5 text-xs">
                {qualifiesForFreeDelivery ? (
                  <p className="font-semibold text-emerald-700">
                    ✓ You qualify for Free Nationwide Delivery!
                  </p>
                ) : (
                  <div>
                    <p className="text-neutral-700">
                      Add <strong className="text-neutral-950">{formatPrice(remainingForFree, sym)}</strong> more to unlock <span className="font-semibold text-emerald-700">Free Delivery</span>.
                    </p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                      <div
                        className="h-full bg-neutral-950 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (subtotal / settings.freeDeliveryThreshold) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-3 text-xs border-b border-neutral-200 pb-4">
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase tracking-wider">Subtotal</span>
                <span className="font-semibold text-neutral-950">{formatPrice(subtotal, sym)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase tracking-wider">Estimated Delivery</span>
                <span className="font-semibold text-neutral-950">
                  {qualifiesForFreeDelivery ? (
                    <span className="text-emerald-700 font-bold uppercase tracking-wider">Free</span>
                  ) : (
                    formatPrice(deliveryEstimate, sym)
                  )}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between text-sm font-bold text-neutral-950">
              <span className="uppercase tracking-wider">Total</span>
              <span className="font-heading text-xl">{formatPrice(total, sym)}</span>
            </div>

            {/* Checkout Action Button */}
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-950 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            {/* Trust Points */}
            <div className="space-y-2 pt-2 text-[11px] text-neutral-500">
              <p className="flex items-center gap-2">
                ✓ Cash on delivery, Instant EFT & Pay on collection
              </p>
              <p className="flex items-center gap-2">
                ✓ 7-day peace of mind returns guarantee
              </p>
              <p className="flex items-center gap-2">
                ✓ Discreet packaging and verified courier dispatch
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
