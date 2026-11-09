"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  Building,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Loader2,
  Lock,
  Truck,
} from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/store/cart-context";
import { placeOrder } from "@/actions/checkout";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear, settings } = useCart();
  const sym = settings.currencySymbol;

  const [deliveryMethod, setDeliveryMethod] = useState<"DELIVERY" | "COLLECTION">("DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "EFT" | "PAY_ON_COLLECTION">("COD");

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delivery fee calculation
  const qualifiesForFree =
    deliveryMethod === "COLLECTION" ||
    (settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold);
  const deliveryFee = qualifiesForFree ? 0 : settings.deliveryFee;
  const total = subtotal + deliveryFee;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      setError("Your shopping bag is empty. Please add items before checking out.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await placeOrder({
      customerName: formData.customerName,
      email: formData.email,
      phone: formData.phone,
      deliveryMethod,
      address: deliveryMethod === "DELIVERY" ? formData.address : undefined,
      city: deliveryMethod === "DELIVERY" ? formData.city : undefined,
      postalCode: deliveryMethod === "DELIVERY" ? formData.postalCode : undefined,
      paymentMethod:
        deliveryMethod === "COLLECTION" && paymentMethod === "COD"
          ? "PAY_ON_COLLECTION"
          : paymentMethod,
      notes: formData.notes,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        size: i.size || "",
        color: i.color || "",
      })),
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    clear();
    router.push(`/order/${result.orderNumber}`);
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16 sm:py-24 text-center">
        <h1 className="font-heading text-2xl font-bold text-neutral-950">Your shopping bag is empty</h1>
        <p className="mt-2 text-xs text-neutral-500">
          You cannot proceed to checkout without any items in your bag.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-md bg-neutral-950 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Checkout Header */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-5">
        <div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-950 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to Bag
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl">
            Checkout
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <Lock className="h-4 w-4" aria-hidden="true" />
          <span>Encrypted 256-Bit Checkout</span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/70 p-4 text-xs text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold uppercase tracking-wider">Cannot complete order</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Form Column */}
        <div className="space-y-8">
          {/* 1. Contact Information */}
          <section className="rounded-xl border border-neutral-200/80 bg-white p-6 sm:p-7">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-950 mb-5 flex items-center gap-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-950 text-[11px] font-bold text-white">
                1
              </span>
              Contact Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="customerName" className="label">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  required
                  placeholder="e.g. Sipho Dlamini"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="email" className="label">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                />
                <p className="mt-1 text-[11px] text-neutral-400">Order receipts & updates will be sent here</p>
              </div>

              <div>
                <label htmlFor="phone" className="label">
                  Phone Number (WhatsApp) <span className="text-red-600">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="e.g. 071 234 5678"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                />
                <p className="mt-1 text-[11px] text-neutral-400">Used for delivery courier dispatch and notifications</p>
              </div>
            </div>
          </section>

          {/* 2. Fulfillment Method */}
          <section className="rounded-xl border border-neutral-200/80 bg-white p-6 sm:p-7">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-950 mb-5 flex items-center gap-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-950 text-[11px] font-bold text-white">
                2
              </span>
              Fulfillment Method
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                  deliveryMethod === "DELIVERY"
                    ? "border-neutral-950 bg-neutral-50/80 ring-1 ring-neutral-950"
                    : "border-neutral-200 hover:border-neutral-400 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="DELIVERY"
                  checked={deliveryMethod === "DELIVERY"}
                  onChange={() => {
                    setDeliveryMethod("DELIVERY");
                    if (paymentMethod === "PAY_ON_COLLECTION") setPaymentMethod("COD");
                  }}
                  className="mt-1 h-4 w-4 text-neutral-950"
                />
                <div>
                  <p className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-neutral-950">
                    <Truck className="h-4 w-4 text-neutral-700" aria-hidden="true" /> Doorstep Delivery
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Dispatched nationwide via tracked courier (
                    {qualifiesForFree ? (
                      <span className="font-semibold text-emerald-700">FREE</span>
                    ) : (
                      formatPrice(settings.deliveryFee, sym)
                    )}
                    )
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                  deliveryMethod === "COLLECTION"
                    ? "border-neutral-950 bg-neutral-50/80 ring-1 ring-neutral-950"
                    : "border-neutral-200 hover:border-neutral-400 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="COLLECTION"
                  checked={deliveryMethod === "COLLECTION"}
                  onChange={() => {
                    setDeliveryMethod("COLLECTION");
                    if (paymentMethod === "COD") setPaymentMethod("PAY_ON_COLLECTION");
                  }}
                  className="mt-1 h-4 w-4 text-neutral-950"
                />
                <div>
                  <p className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-neutral-950">
                    <Building className="h-4 w-4 text-neutral-700" aria-hidden="true" /> Store Collection
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">Pick up from our warehouse in Johannesburg (FREE)</p>
                </div>
              </label>
            </div>

            {deliveryMethod === "DELIVERY" ? (
              <div className="mt-6 space-y-4 border-t border-neutral-200/80 pt-5">
                <div>
                  <label htmlFor="address" className="label">
                    Street Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    placeholder="e.g. 14 Long Street, Apt 3B"
                    value={formData.address}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="city" className="label">
                      City / Town <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      placeholder="e.g. Johannesburg"
                      value={formData.city}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="label">
                      Postal Code
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      placeholder="e.g. 2001"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-600">
                <p className="font-bold uppercase tracking-wider text-neutral-950">Collection Location:</p>
                <p className="mt-1">{settings.address || "123 Main Road, Johannesburg, 2001"}</p>
                <p className="mt-2 text-neutral-500">
                  You will receive an SMS and WhatsApp message as soon as your items have been packaged and prepared for collection.
                </p>
              </div>
            )}
          </section>

          {/* 3. Payment Method */}
          <section className="rounded-xl border border-neutral-200/80 bg-white p-6 sm:p-7">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-950 mb-5 flex items-center gap-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-950 text-[11px] font-bold text-white">
                3
              </span>
              Payment Option
            </h2>

            <div className="space-y-3">
              {deliveryMethod === "DELIVERY" && (
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                    paymentMethod === "COD"
                      ? "border-neutral-950 bg-neutral-50/80 ring-1 ring-neutral-950"
                      : "border-neutral-200 hover:border-neutral-400 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-1 h-4 w-4 text-neutral-950"
                  />
                  <div>
                    <p className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-950">
                      Cash on Delivery (COD)
                    </p>
                    <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                      Settle in cash directly with the courier driver upon physical handover of your package.
                    </p>
                  </div>
                </label>
              )}

              {deliveryMethod === "COLLECTION" && (
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                    paymentMethod === "PAY_ON_COLLECTION"
                      ? "border-neutral-950 bg-neutral-50/80 ring-1 ring-neutral-950"
                      : "border-neutral-200 hover:border-neutral-400 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAY_ON_COLLECTION"
                    checked={paymentMethod === "PAY_ON_COLLECTION"}
                    onChange={() => setPaymentMethod("PAY_ON_COLLECTION")}
                    className="mt-1 h-4 w-4 text-neutral-950"
                  />
                  <div>
                    <p className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-950">
                      Pay on Collection
                    </p>
                    <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                      Pay via cash or card speedpoint when collecting in store.
                    </p>
                  </div>
                </label>
              )}

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                  paymentMethod === "EFT"
                    ? "border-neutral-950 bg-neutral-50/80 ring-1 ring-neutral-950"
                    : "border-neutral-200 hover:border-neutral-400 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="EFT"
                  checked={paymentMethod === "EFT"}
                  onChange={() => setPaymentMethod("EFT")}
                  className="mt-1 h-4 w-4 text-neutral-950"
                />
                <div>
                  <p className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-neutral-950">
                    <CreditCard className="h-4 w-4 text-neutral-700" aria-hidden="true" />
                    Direct EFT / Bank Transfer
                  </p>
                  <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                    Transfer directly into our business bank account. Banking details and reference will be displayed immediately after submission.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* 4. Order Notes */}
          <section className="rounded-xl border border-neutral-200/80 bg-white p-6 sm:p-7">
            <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-950 mb-2">
              Order Notes / Delivery Instructions (Optional)
            </h2>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="e.g. Please leave package at front desk or call upon arrival..."
              value={formData.notes}
              onChange={handleChange}
              className="input min-h-20 resize-none text-xs"
            />
          </section>
        </div>

        {/* Order Summary Column */}
        <aside aria-label="Order summary sidebar" className="space-y-6">
          <div className="sticky top-24 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-6 space-y-5">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-950">
              Your Order
            </h2>

            {/* Line items preview */}
            <div className="max-h-64 divide-y divide-neutral-200 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.key} className="flex gap-3 py-3 first:pt-0">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100 border border-neutral-200">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-neutral-900 line-clamp-1">{item.name}</p>
                    <p className="text-neutral-500 text-[11px]">
                      Qty: {item.quantity}{" "}
                      {item.size || item.color
                        ? `· ${[item.size, item.color].filter(Boolean).join(", ")}`
                        : ""}
                    </p>
                    <p className="font-heading font-bold text-neutral-950 mt-1">
                      {formatPrice(item.price * item.quantity, sym)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 border-t border-neutral-200 pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase tracking-wider">Subtotal</span>
                <span className="font-semibold text-neutral-950">{formatPrice(subtotal, sym)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase tracking-wider">Delivery</span>
                <span className="font-semibold text-neutral-950">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase tracking-wider">Free</span>
                  ) : (
                    formatPrice(deliveryFee, sym)
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-3 text-sm font-bold text-neutral-950">
                <span className="uppercase tracking-wider">Total Due</span>
                <span className="font-heading text-xl">{formatPrice(total, sym)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>Confirm & Place Order</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-neutral-400">
              By confirming, you agree to Gao Essentialls purchasing and return policies.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
