"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCart } from "./cart-context";

export function CartDrawer() {
  const { items, count, subtotal, drawerOpen, setDrawerOpen, updateQuantity, removeItem, settings } = useCart();
  const sym = settings.currencySymbol;

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, setDrawerOpen]);

  if (!drawerOpen) return null;

  const remaining = settings.freeDeliveryThreshold - subtotal;
  const progress =
    settings.freeDeliveryThreshold > 0
      ? Math.min(100, (subtotal / settings.freeDeliveryThreshold) * 100)
      : 100;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Slide-out Panel */}
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 id="cart-drawer-title" className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-950">
              Shopping Bag
            </h2>
            <span className="text-xs text-neutral-400">({count})</span>
          </div>
          <button
            type="button"
            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
            aria-label="Close cart"
            onClick={() => setDrawerOpen(false)}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-neutral-100 text-neutral-400">
              <ShoppingBag className="h-7 w-7" aria-hidden />
            </div>
            <p className="font-heading text-sm font-bold text-neutral-950">Your bag is empty</p>
            <p className="max-w-xs text-xs text-neutral-500 leading-relaxed">
              Discover our curated essentials across appliances, blankets, apparel, and cookware.
            </p>
            <Link
              href="/shop"
              className="mt-2 inline-flex rounded-md bg-neutral-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
              onClick={() => setDrawerOpen(false)}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Free Shipping Meter */}
            {settings.freeDeliveryThreshold > 0 && (
              <div className="border-b border-neutral-200 bg-neutral-50/70 px-6 py-3.5 text-xs">
                {remaining > 0 ? (
                  <p className="text-neutral-700">
                    Add <strong className="text-neutral-950">{formatPrice(remaining, sym)}</strong> more to qualify for <span className="font-semibold text-emerald-700">Free Delivery</span>.
                  </p>
                ) : (
                  <p className="font-semibold text-emerald-700">You qualify for Free Nationwide Delivery!</p>
                )}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200" aria-hidden>
                  <div
                    className="h-full rounded-full bg-neutral-950 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Line Items List */}
            <ul className="flex-1 divide-y divide-neutral-200/80 overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200/60">
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setDrawerOpen(false)}
                        className="line-clamp-2 text-xs font-semibold text-neutral-900 hover:text-neutral-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.key)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>

                    {(item.size || item.color) && (
                      <p className="mt-1 text-[11px] text-neutral-500">
                        {[item.size && `Size: ${item.size}`, item.color && `Colour: ${item.color}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-2">
                      {/* Stepper */}
                      <div className="flex items-center rounded-md border border-neutral-300 bg-white">
                        <button
                          type="button"
                          className="grid h-7 w-7 place-items-center text-neutral-600 hover:text-neutral-950 disabled:opacity-30"
                          aria-label={`Decrease quantity of ${item.name}`}
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" aria-hidden />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="grid h-7 w-7 place-items-center text-neutral-600 hover:text-neutral-950 disabled:opacity-30"
                          aria-label={`Increase quantity of ${item.name}`}
                          disabled={item.quantity >= item.stock}
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" aria-hidden />
                        </button>
                      </div>

                      <span className="font-heading text-xs font-bold text-neutral-950">
                        {formatPrice(item.price * item.quantity, sym)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Drawer Footer Checkout Summary */}
            <div className="space-y-3 border-t border-neutral-200 bg-neutral-50/50 p-6">
              <div className="flex justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-neutral-500">Subtotal</span>
                <span className="font-heading text-base font-bold text-neutral-950">
                  {formatPrice(subtotal, sym)}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Nationwide delivery & payment options calculated at checkout.
              </p>
              <div className="pt-2 space-y-2">
                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-950 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors shadow-xs"
                  onClick={() => setDrawerOpen(false)}
                >
                  <span>Checkout</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link
                  href="/cart"
                  className="flex w-full items-center justify-center rounded-md border border-neutral-300 bg-white py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:border-neutral-950 hover:bg-neutral-50 transition-colors"
                  onClick={() => setDrawerOpen(false)}
                >
                  View Full Bag
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
