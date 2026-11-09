import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

interface AdminCustomersPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: AdminCustomersPageProps) {
  await requireAdmin();
  const { q } = await searchParams;
  const settings = await getSettings();
  const sym = settings.currencySymbol;

  // Retrieve all orders to build aggregated customer profiles
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      customerName: true,
      email: true,
      phone: true,
      city: true,
      total: true,
      createdAt: true,
      status: true,
    },
  });

  type CustomerSummary = {
    name: string;
    email: string;
    phone: string;
    city: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: Date;
  };

  const customerMap = new Map<string, CustomerSummary>();

  for (const o of orders) {
    const key = o.email.toLowerCase();
    const existing = customerMap.get(key);

    if (existing) {
      existing.totalOrders += 1;
      if (o.status !== "CANCELLED") {
        existing.totalSpent += o.total;
      }
      if (o.city && !existing.city) {
        existing.city = o.city;
      }
    } else {
      customerMap.set(key, {
        name: o.customerName,
        email: o.email,
        phone: o.phone,
        city: o.city || "Store Pickup",
        totalOrders: 1,
        totalSpent: o.status !== "CANCELLED" ? o.total : 0,
        lastOrderDate: o.createdAt,
      });
    }
  }

  let customers = Array.from(customerMap.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    customers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term)
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Customers
        </h1>
        <p className="mt-1 text-sm text-muted">
          Customer directory with purchase history and total customer value ({customers.length}{" "}
          registered customers).
        </p>
      </div>

      {/* Customer Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-surface text-muted uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-center">Orders</th>
                <th className="px-4 py-3 text-right">Total Spent</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.email} className="hover:bg-surface/50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-light text-primary font-bold text-xs uppercase">
                          {c.name.charAt(0)}
                        </span>
                        <div>
                          <p className="font-bold text-ink text-sm">{c.name}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-muted flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted shrink-0" aria-hidden="true" /> {c.email}
                      </p>
                      <p className="text-muted text-[10px] flex items-center gap-1.5 mt-0.5">
                        <Phone className="h-3 w-3 text-muted shrink-0" aria-hidden="true" /> {c.phone}
                      </p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {c.city}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className="badge bg-slate-100 text-ink font-semibold">
                        {c.totalOrders} {c.totalOrders === 1 ? "order" : "orders"}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-ink text-sm">
                      {formatPrice(c.totalSpent, sym)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {formatDate(c.lastOrderDate)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Link
                        href={`/orders?q=${encodeURIComponent(c.email)}`}
                        className="btn-outline min-h-0 px-2.5 py-1 text-xs"
                      >
                        View Orders
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
