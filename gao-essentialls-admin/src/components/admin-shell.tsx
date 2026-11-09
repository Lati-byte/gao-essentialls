"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { logoutAdmin } from "@/actions/auth";

interface AdminNavProps {
  adminName: string;
  adminEmail: string;
  storeName: string;
}

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Layers },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/settings", label: "Store Settings", icon: Settings },
];

export function AdminShell({
  children,
  adminName,
  adminEmail,
  storeName,
}: {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
  storeName: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000";

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Mobile Sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-white transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-line px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-heading font-bold text-white text-base">
              G
            </span>
            <span className="font-heading font-bold text-ink">
              Gao <span className="text-cta">Admin</span>
            </span>
          </Link>
          <button
            type="button"
            className="md:hidden text-muted hover:text-ink"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto" aria-label="Admin Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User & View Store info */}
        <div className="border-t border-line p-4 space-y-3">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full justify-center text-xs gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span>View Live Store</span>
          </a>

          <div className="flex items-center justify-between pt-2">
            <div className="min-w-0 pr-2">
              <p className="truncate text-xs font-bold text-ink">{adminName}</p>
              <p className="truncate text-[10px] text-muted">{adminEmail}</p>
            </div>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-danger transition-colors"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 sm:px-8 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-ghost -ml-2 px-2.5 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <span className="text-xs font-semibold text-muted hidden sm:inline">
              Store: <strong className="text-ink">{storeName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products/new"
              className="btn-primary min-h-9 px-3 py-1.5 text-xs shadow-sm"
            >
              + Add Product
            </Link>
          </div>
        </header>

        {/* Main page content */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
