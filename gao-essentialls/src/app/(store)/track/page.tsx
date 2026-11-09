import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Package,
  Search,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/db";
import {
  DELIVERY_METHOD_LABELS,
  formatDateTime,
  formatPrice,
  PAYMENT_METHOD_LABELS,
  statusLabel,
} from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

interface TrackPageProps {
  searchParams: Promise<{
    orderNumber?: string;
    email?: string;
  }>;
}

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const { orderNumber, email } = await searchParams;
  const settings = await getSettings();
  const sym = settings.currencySymbol;

  let order = null;
  let searched = false;

  if (orderNumber && email) {
    searched = true;
    order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.trim(),
        email: email.trim().toLowerCase(),
      },
      include: { items: true },
    });
  }

  // Calculate timeline steps
  const steps = [
    { key: "PENDING", label: "Placed" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "SHIPPED", label: "In Transit" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const currentStepIndex = order
    ? order.status === "CANCELLED"
      ? -1
      : steps.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          Parcel Intelligence
        </span>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
          Track Your Order
        </h1>
        <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
          Enter your order reference (e.g. GAO-12345) and the email address used during purchase.
        </p>

        {/* Tracking Search Form */}
        <form method="get" className="mt-8 rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-6 sm:p-7 text-left shadow-xs">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="orderNumber" className="label">
                Order Number
              </label>
              <input
                id="orderNumber"
                name="orderNumber"
                type="text"
                required
                placeholder="e.g. GAO-12345"
                defaultValue={orderNumber || ""}
                className="input uppercase font-mono text-xs"
              />
            </div>
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="e.g. you@example.com"
                defaultValue={email || ""}
                className="input text-xs"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-neutral-950 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Search Order Status</span>
          </button>
        </form>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="mx-auto mt-12 max-w-3xl">
          {!order ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-5 text-xs text-amber-900"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <p className="font-bold uppercase tracking-wider">No Order Found</p>
                <p className="mt-1 text-amber-800 leading-relaxed">
                  We could not locate an order matching &ldquo;<strong>{orderNumber}</strong>&rdquo; and email &ldquo;
                  <strong>{email}</strong>&rdquo;. Please verify your order number and email address.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Status Timeline Card */}
              <div className="rounded-xl border border-neutral-200/80 bg-white p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                      Tracking
                    </span>
                    <h2 className="font-mono text-2xl font-extrabold text-neutral-950">{order.orderNumber}</h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Placed on {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-sm px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        order.status === "CANCELLED"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : order.status === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-neutral-950 text-white"
                      }`}
                    >
                      {statusLabel(order.status)}
                    </span>
                  </div>
                </div>

                {/* Visual Tracker Timeline */}
                {order.status === "CANCELLED" ? (
                  <div className="my-6 rounded-lg bg-red-50 p-4 text-center text-xs text-red-800 font-semibold">
                    This order has been cancelled.
                  </div>
                ) : (
                  <div className="my-10 px-2 sm:px-6">
                    <div className="relative flex justify-between">
                      {/* Timeline track background */}
                      <div className="absolute top-4 left-6 right-6 -z-0 h-0.5 bg-neutral-200" />
                      {/* Timeline track progress */}
                      <div
                        className="absolute top-4 left-6 -z-0 h-0.5 bg-neutral-950 transition-all duration-500"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, (currentStepIndex / (steps.length - 1)) * 90)
                          )}%`,
                        }}
                      />

                      {steps.map((s, idx) => {
                        const isDone = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return (
                          <div key={s.key} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-all ${
                                isDone
                                  ? "bg-neutral-950 text-white"
                                  : "border border-neutral-300 bg-white text-neutral-400"
                              } ${isCurrent ? "ring-4 ring-neutral-950/20" : ""}`}
                            >
                              {isDone ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : idx + 1}
                            </div>
                            <span
                              className={`mt-2 text-[11px] uppercase tracking-wider font-semibold ${
                                isCurrent ? "text-neutral-950 font-bold" : "text-neutral-400"
                              }`}
                            >
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Details Breakdown */}
                <div className="grid gap-6 sm:grid-cols-2 pt-6 border-t border-neutral-200 text-xs">
                  <div>
                    <p className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">
                      Fulfillment Address
                    </p>
                    {order.deliveryMethod === "DELIVERY" ? (
                      <p className="mt-1 font-medium text-neutral-900">
                        {order.address}, {order.city} {order.postalCode}
                      </p>
                    ) : (
                      <p className="mt-1 font-medium text-neutral-900">
                        Store Collection: {settings.address}
                      </p>
                    )}
                    <p className="text-neutral-500 mt-1">Recipient: {order.customerName} ({order.phone})</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">
                      Payment Summary
                    </p>
                    <p className="mt-1 font-medium text-neutral-900">
                      {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                    </p>
                    <p className="text-neutral-500 mt-1">
                      Status: <span className="font-semibold text-neutral-950">{order.paymentStatus}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Items in order */}
              <div className="rounded-xl border border-neutral-200/80 bg-white overflow-hidden">
                <div className="border-b border-neutral-200 bg-neutral-50/70 px-6 py-3.5">
                  <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-950">
                    Ordered Items
                  </h3>
                </div>
                <div className="divide-y divide-neutral-200/80">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 sm:px-6">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100 border border-neutral-200">
                        <Image
                          src={item.image || "/images/placeholder.svg"}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 text-xs">
                        <p className="font-semibold text-neutral-950">{item.name}</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Qty: {item.quantity}{" "}
                          {item.size || item.color
                            ? `· ${[item.size, item.color].filter(Boolean).join(", ")}`
                            : ""}
                        </p>
                      </div>
                      <span className="font-heading text-xs font-bold text-neutral-950">
                        {formatPrice(item.price * item.quantity, sym)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-neutral-200 bg-neutral-50/50 p-4 sm:px-6 text-xs flex justify-between font-bold">
                  <span className="uppercase tracking-wider text-neutral-500">Total Amount</span>
                  <span className="font-heading text-neutral-950 text-base">{formatPrice(order.total, sym)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
