import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime, formatPrice, statusLabel } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { DashboardCharts } from "@/components/dashboard-charts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const settings = await getSettings();
  const sym = settings.currencySymbol;

  // 1. Fetch KPI metrics in parallel
  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    lowStockProducts,
    allOrders,
    recentOrders,
    orderItemsWithCat,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({
      where: { stock: { lte: 5 }, isActive: true },
      include: { category: true },
      orderBy: { stock: "asc" },
      take: 6,
    }),
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 6,
    }),
    prisma.orderItem.findMany({
      select: {
        quantity: true,
        product: {
          select: {
            category: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);

  // 2. Prepare 30-Day Revenue Trend
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
    dailyMap.set(key, 0);
  }

  for (const order of allOrders) {
    if (order.createdAt >= thirtyDaysAgo) {
      const key = order.createdAt.toLocaleDateString("en-ZA", {
        month: "short",
        day: "numeric",
      });
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) || 0) + order.total);
      }
    }
  }

  const revenueTrend = Array.from(dailyMap.entries()).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue),
  }));

  // 3. Sales by Category
  const catSalesMap = new Map<string, number>();
  for (const item of orderItemsWithCat) {
    const catName = item.product?.category?.name || "General";
    catSalesMap.set(catName, (catSalesMap.get(catName) || 0) + item.quantity);
  }

  const categorySales = Array.from(catSalesMap.entries())
    .map(([category, sales]) => ({ category, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 8);

  const kpis = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue, sym),
      subtext: "From confirmed & completed orders",
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary-light",
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      subtext: "All time placed orders",
      icon: ShoppingBag,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toString(),
      subtext: pendingOrders > 0 ? "Requires packing / shipping" : "All orders fulfilled",
      icon: Clock,
      color: pendingOrders > 0 ? "text-cta" : "text-success",
      bg: pendingOrders > 0 ? "bg-orange-50" : "bg-green-50",
    },
    {
      title: "Active Products",
      value: totalProducts.toString(),
      subtext: "Listed in store catalogue",
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-muted">
          Real-time performance and operational summary for {settings.storeName}.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">
                  {kpi.title}
                </span>
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-extrabold text-ink sm:text-3xl">{kpi.value}</p>
                <p className="mt-1 text-xs text-muted">{kpi.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <DashboardCharts
        revenueTrend={revenueTrend}
        categorySales={categorySales}
        currencySymbol={sym}
      />

      {/* 2-Column Tables: Recent Orders & Low Stock */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent Orders */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h2 className="text-base font-bold text-ink">Recent Orders</h2>
              <p className="text-xs text-muted">Latest customer purchases</p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface text-muted uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3 font-bold text-ink whitespace-nowrap">
                      {ord.orderNumber}
                      <span className="block text-[10px] font-normal text-muted">
                        {formatDate(ord.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-ink">{ord.customerName}</p>
                      <p className="text-muted text-[10px]">{ord.city || "Collection"}</p>
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
                    <td className="px-4 py-3 text-right font-bold text-ink whitespace-nowrap">
                      {formatPrice(ord.total, sym)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        href={`/orders/${ord.id}`}
                        className="btn-outline min-h-0 px-2.5 py-1 text-[11px]"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
                <span>Low Stock Alerts</span>
              </h2>
              <p className="text-xs text-muted">Items with 5 or fewer remaining</p>
            </div>
            <Link
              href="/products?stock=low"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              All products <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">
              All inventory levels are healthy!
            </div>
          ) : (
            <div className="divide-y divide-line">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 text-xs">
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-ink truncate">{p.name}</p>
                    <p className="text-muted">{p.category.name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`badge font-bold ${
                        p.stock === 0
                          ? "bg-red-100 text-danger border border-red-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                    <Link
                      href={`/products/${p.id}`}
                      className="btn-outline min-h-0 px-2 py-1 text-[11px]"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
