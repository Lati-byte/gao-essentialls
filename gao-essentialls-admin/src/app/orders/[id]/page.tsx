import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building,
  Mail,
  MapPin,
  Phone,
  Truck,
  User,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  DELIVERY_METHOD_LABELS,
  formatDateTime,
  formatPrice,
  PAYMENT_METHOD_LABELS,
  statusLabel,
} from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { OrderStatusControl } from "@/components/order-status-control";

export const dynamic = "force-dynamic";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  await requireAdmin();
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { sku: true, stock: true },
            },
          },
        },
      },
    }),
    getSettings(),
  ]);

  if (!order) {
    notFound();
  }

  const sym = settings.currencySymbol;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <Link
            href="/orders"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Orders
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Order {order.orderNumber}
            </h1>
            <span
              className={`badge px-2.5 py-1 text-xs font-bold ${
                order.status === "DELIVERED"
                  ? "bg-green-100 text-success border border-green-200"
                  : order.status === "CANCELLED"
                  ? "bg-red-100 text-danger border border-red-200"
                  : order.status === "PENDING"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-primary-light text-primary border border-primary/20"
              }`}
            >
              {statusLabel(order.status)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Live Order Status Changer */}
      <OrderStatusControl
        orderId={order.id}
        initialStatus={order.status}
        initialPaymentStatus={order.paymentStatus}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: Customer info, address, items */}
        <div className="space-y-6">
          {/* Customer & Fulfillment Info */}
          <div className="card p-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-3">
                <User className="h-4 w-4 text-primary" aria-hidden="true" /> Customer Details
              </h2>
              <p className="text-base font-bold text-ink">{order.customerName}</p>
              <div className="mt-2 space-y-1 text-xs">
                <a
                  href={`mailto:${order.email}`}
                  className="flex items-center gap-1.5 text-muted hover:text-primary"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" /> {order.email}
                </a>
                <a
                  href={`tel:${order.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 text-muted hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {order.phone}
                </a>
              </div>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-line pt-4 sm:pt-0 sm:pl-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-3">
                {order.deliveryMethod === "DELIVERY" ? (
                  <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
                ) : (
                  <Building className="h-4 w-4 text-primary" aria-hidden="true" />
                )}
                Fulfillment Method
              </h2>
              <p className="text-sm font-bold text-ink">
                {DELIVERY_METHOD_LABELS[order.deliveryMethod] || order.deliveryMethod}
              </p>
              {order.deliveryMethod === "DELIVERY" ? (
                <div className="mt-2 text-xs text-muted flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    {order.address}
                    <br />
                    {order.city} {order.postalCode}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted">
                  Customer will collect in store ({settings.address || "Main Store"}).
                </p>
              )}
            </div>

            {order.notes && (
              <div className="sm:col-span-2 border-t border-line pt-3">
                <span className="text-xs font-bold text-muted">Customer Notes / Instructions:</span>
                <p className="mt-1 text-xs text-ink bg-surface p-3 rounded-lg border border-line">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Ordered Products Table */}
          <div className="card overflow-hidden">
            <div className="border-b border-line bg-surface p-4">
              <h2 className="text-sm font-bold text-ink">
                Ordered Products ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-line">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center gap-4 p-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface border border-line">
                    <Image
                      src={it.image || "/images/placeholder.svg"}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-ink text-sm">{it.name}</p>
                    <div className="mt-0.5 flex flex-wrap gap-2 text-muted">
                      {it.product?.sku && <span>SKU: {it.product.sku}</span>}
                      {it.size && <span>Size: {it.size}</span>}
                      {it.color && <span>Colour: {it.color}</span>}
                    </div>
                    <p className="mt-1 text-muted">
                      {formatPrice(it.price, sym)} × {it.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-ink">
                    {formatPrice(it.price * it.quantity, sym)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Payment summary & financial breakdown */}
        <aside aria-label="Order financial summary" className="space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-bold text-ink border-b border-line pb-3">
              Payment Summary
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Payment Method</span>
                <span className="font-bold text-ink">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment Status</span>
                <span
                  className={`badge ${
                    order.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-line pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-semibold text-ink">{formatPrice(order.subtotal, sym)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery Fee</span>
                <span className="font-semibold text-ink">
                  {order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee, sym)}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
                <span>Total Due</span>
                <span className="text-xl text-primary">{formatPrice(order.total, sym)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
