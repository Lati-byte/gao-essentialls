import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Building,
  CheckCircle2,
  Clock,
  CreditCard,
  Package,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/db";
import {
  DELIVERY_METHOD_LABELS,
  formatDate,
  formatPrice,
  PAYMENT_METHOD_LABELS,
  statusLabel,
} from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderNumber } = await params;

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    }),
    getSettings(),
  ]);

  if (!order) {
    notFound();
  }

  const sym = settings.currencySymbol;

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Success Header Confirmation Card */}
        <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-8 sm:p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-neutral-950 text-white shadow-xs">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" aria-hidden="true" />
          </div>
          <span className="mt-5 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Order Confirmed
          </span>
          <h1 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl">
            Thank you, {order.customerName}.
          </h1>
          <p className="mt-2 text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            We have received your order and our fulfillment team is preparing your package. A confirmation has been logged under your details.
          </p>

          <div className="mt-6 inline-flex flex-col items-center justify-center rounded-xl bg-white px-8 py-4 border border-neutral-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Order Reference
            </span>
            <span className="mt-1 font-mono text-xl font-bold tracking-wider text-neutral-950">
              {order.orderNumber}
            </span>
            <span className="mt-1 text-[11px] text-neutral-400">Placed on {formatDate(order.createdAt)}</span>
          </div>
        </div>

        {/* EFT Bank Details Card (If applicable) */}
        {order.paymentMethod === "EFT" && settings.bankName && (
          <div className="rounded-xl border border-neutral-300 bg-neutral-50/80 p-6 sm:p-7">
            <div className="flex items-center gap-2 text-neutral-950 font-bold">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              <h2 className="font-heading text-xs font-bold uppercase tracking-wider">
                EFT / Direct Bank Payment Instructions
              </h2>
            </div>
            <p className="mt-2 text-xs text-neutral-600">
              Please transfer the total of{" "}
              <strong className="text-neutral-950 font-bold">{formatPrice(order.total, sym)}</strong>{" "}
              to our bank account using your order reference:
            </p>

            <div className="mt-4 grid gap-3 rounded-lg bg-white p-5 border border-neutral-200 text-xs sm:grid-cols-2">
              <div>
                <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold">Bank:</span>
                <p className="font-bold text-neutral-950 mt-0.5">{settings.bankName}</p>
              </div>
              <div>
                <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold">Account Name:</span>
                <p className="font-bold text-neutral-950 mt-0.5">{settings.accountName || settings.storeName}</p>
              </div>
              <div>
                <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold">Account Number:</span>
                <p className="font-mono font-bold text-neutral-950 mt-0.5">{settings.accountNumber}</p>
              </div>
              <div>
                <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold">Branch Code:</span>
                <p className="font-mono font-bold text-neutral-950 mt-0.5">{settings.branchCode}</p>
              </div>
              <div className="sm:col-span-2 border-t border-neutral-100 pt-3">
                <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold">Payment Reference:</span>
                <p className="font-mono text-sm font-bold text-neutral-950 mt-0.5">
                  {order.orderNumber}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Email proof of payment to{" "}
                  <a href={`mailto:${settings.email}`} className="text-neutral-950 underline font-semibold">
                    {settings.email}
                  </a>
                  {settings.whatsapp && ` or WhatsApp ${settings.whatsapp}`}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fulfillment & Payment Details Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Fulfillment Details */}
          <div className="rounded-xl border border-neutral-200/80 bg-white p-6 space-y-3">
            <div className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-neutral-950">
              {order.deliveryMethod === "DELIVERY" ? (
                <Truck className="h-4 w-4 text-neutral-700" aria-hidden="true" />
              ) : (
                <Building className="h-4 w-4 text-neutral-700" aria-hidden="true" />
              )}
              <h3>Fulfillment Details</h3>
            </div>
            <p className="text-xs font-semibold text-neutral-950">
              {DELIVERY_METHOD_LABELS[order.deliveryMethod] || order.deliveryMethod}
            </p>
            {order.deliveryMethod === "DELIVERY" ? (
              <p className="text-xs text-neutral-500">
                {order.address}, {order.city} {order.postalCode}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">
                Collection from: {settings.address || "123 Main Road, Johannesburg"}
              </p>
            )}
            <div className="border-t border-neutral-100 pt-2.5 text-[11px] text-neutral-400 space-y-0.5">
              <p>Recipient: {order.customerName}</p>
              <p>Phone: {order.phone}</p>
              <p>Email: {order.email}</p>
            </div>
          </div>

          {/* Payment & Order Status */}
          <div className="rounded-xl border border-neutral-200/80 bg-white p-6 space-y-3">
            <div className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-neutral-950">
              <Clock className="h-4 w-4 text-neutral-700" aria-hidden="true" />
              <h3>Order Status</h3>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 uppercase tracking-wider">Status:</span>
              <span className="rounded-sm bg-neutral-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {statusLabel(order.status)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 uppercase tracking-wider">Payment Method:</span>
              <span className="font-semibold text-neutral-950">
                {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 uppercase tracking-wider">Payment Status:</span>
              <span
                className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-neutral-100 text-neutral-800"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
            {order.notes && (
              <div className="border-t border-neutral-100 pt-2.5 text-[11px] text-neutral-500">
                <span className="font-semibold text-neutral-700">Notes:</span> {order.notes}
              </div>
            )}
          </div>
        </div>

        {/* Ordered Items Receipt */}
        <div className="rounded-xl border border-neutral-200/80 bg-white overflow-hidden">
          <div className="border-b border-neutral-200 bg-neutral-50/70 px-6 py-4">
            <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-950">
              Items Ordered ({order.items.length})
            </h2>
          </div>
          <div className="divide-y divide-neutral-200/80">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 sm:px-6">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100 border border-neutral-200">
                  <Image
                    src={item.image || "/images/placeholder.svg"}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-neutral-950">{item.name}</p>
                  {(item.size || item.color) && (
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {[item.size && `Size: ${item.size}`, item.color && `Colour: ${item.color}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {formatPrice(item.price, sym)} × {item.quantity}
                  </p>
                </div>
                <span className="font-heading text-xs font-bold text-neutral-950">
                  {formatPrice(item.price * item.quantity, sym)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-neutral-200 bg-neutral-50/50 p-6 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-500 uppercase tracking-wider">Subtotal</span>
              <span className="font-semibold text-neutral-950">{formatPrice(order.subtotal, sym)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 uppercase tracking-wider">Delivery Fee</span>
              <span className="font-semibold text-neutral-950">
                {order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee, sym)}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-sm font-bold text-neutral-950">
              <span className="uppercase tracking-wider">Total</span>
              <span className="font-heading text-xl">{formatPrice(order.total, sym)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <Link
            href={`/track?orderNumber=${order.orderNumber}&email=${encodeURIComponent(order.email)}`}
            className="inline-flex items-center gap-2 rounded-md bg-neutral-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            <span>Track Order Status</span>
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:border-neutral-950 hover:bg-neutral-50 transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
