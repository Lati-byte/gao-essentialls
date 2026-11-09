import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  DELIVERY_METHOD_LABELS,
  formatDate,
  formatPrice,
  ORDER_STATUSES,
  PAYMENT_METHOD_LABELS,
  statusLabel,
} from "@/lib/format";
import { getSettings } from "@/lib/settings";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const settings = await getSettings();
  const sym = settings.currencySymbol;

  const where: Prisma.OrderWhereInput = {};
  const and: Prisma.OrderWhereInput[] = [];

  const q = params.q?.trim();
  if (q) {
    and.push({
      OR: [
        { orderNumber: { contains: q } },
        { customerName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ],
    });
  }

  if (params.status && params.status !== "ALL") {
    and.push({ status: params.status });
  }

  if (and.length) where.AND = and;

  const pageSize = 15;
  const page = Math.max(1, parseInt(params.page || "1") || 1);

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function buildUrl(changes: Record<string, string | undefined>) {
    const updated = { ...params, ...changes };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(updated)) {
      if (v !== undefined && v !== "" && v !== null) {
        sp.set(k, v);
      }
    }
    return `/orders?${sp.toString()}`;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage customer orders, track payments, and update delivery statuses ({total} orders).
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 space-y-4">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 border-b border-line pb-3">
          <Link
            href={buildUrl({ status: undefined, page: "1" })}
            className={`btn min-h-0 py-1.5 px-3 text-xs ${
              !params.status || params.status === "ALL"
                ? "bg-primary text-white"
                : "border border-line bg-white text-muted hover:text-ink"
            }`}
          >
            All Orders
          </Link>
          {ORDER_STATUSES.map((s) => (
            <Link
              key={s}
              href={buildUrl({ status: s, page: "1" })}
              className={`btn min-h-0 py-1.5 px-3 text-xs ${
                params.status === s
                  ? "bg-primary text-white"
                  : "border border-line bg-white text-muted hover:text-ink"
              }`}
            >
              {statusLabel(s)}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form method="get" className="flex items-center gap-3">
          {params.status && <input type="hidden" name="status" value={params.status} />}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Search by order number, customer name, email, or phone..."
              className="input pl-9 min-h-9 text-xs"
            />
          </div>
          <button type="submit" className="btn-primary min-h-9 px-4 text-xs">
            Search
          </button>
          {params.q && (
            <Link
              href={buildUrl({ q: undefined, page: "1" })}
              className="text-xs font-semibold text-danger hover:underline"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-surface text-muted uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Order Number</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Fulfillment</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3 font-bold text-ink whitespace-nowrap">
                      <Link
                        href={`/orders/${ord.id}`}
                        className="hover:text-primary transition-colors text-sm"
                      >
                        {ord.orderNumber}
                      </Link>
                      <span className="block text-[10px] font-normal text-muted">
                        {formatDate(ord.createdAt)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink text-sm">{ord.customerName}</p>
                      <p className="text-muted text-[10px]">{ord.email} • {ord.phone}</p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-ink">
                        {DELIVERY_METHOD_LABELS[ord.deliveryMethod] || ord.deliveryMethod}
                      </span>
                      {ord.city && (
                        <span className="block text-[10px] text-muted">{ord.city}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-ink">
                        {PAYMENT_METHOD_LABELS[ord.paymentMethod] || ord.paymentMethod}
                      </p>
                      <span
                        className={`badge mt-0.5 ${
                          ord.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`badge ${
                          ord.status === "DELIVERED"
                            ? "bg-green-100 text-success"
                            : ord.status === "CANCELLED"
                            ? "bg-red-100 text-danger"
                            : ord.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-primary-light text-primary"
                        }`}
                      >
                        {statusLabel(ord.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-ink whitespace-nowrap text-sm">
                      {formatPrice(ord.total, sym)}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        href={`/orders/${ord.id}`}
                        className="btn-outline min-h-0 px-3 py-1 text-xs"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-xs">
            <span className="text-muted">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="btn-outline min-h-0 px-2.5 py-1 text-xs"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="btn-outline min-h-0 px-2.5 py-1 text-xs"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
