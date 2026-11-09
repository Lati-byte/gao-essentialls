"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X, PackageSearch, ArrowRight } from "lucide-react";
import { useCart } from "./cart-context";

type NavCategory = { name: string; slug: string };

export function Header({ categories, storeName }: { categories: NavCategory[]; storeName: string }) {
  const { count, ready, setDrawerOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  // Close the mobile menu on route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md transition-all">
      {/* Primary Header Row */}
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="btn-ghost -ml-2 p-2 text-neutral-800 lg:hidden"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        {/* Brand Wordmark */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={`${storeName} home`}>
          <span className="grid h-8 w-8 place-items-center rounded-sm bg-neutral-950 font-bold text-white text-xs tracking-wider transition-transform duration-300 group-hover:scale-105">
            G
          </span>
          <div className="flex flex-col">
            <span className="font-heading text-sm font-extrabold tracking-[0.2em] uppercase text-neutral-950 sm:text-base">
              GAO <span className="font-normal text-neutral-500">ESSENTIALLS</span>
            </span>
          </div>
        </Link>

        {/* Center Search Input (Desktop) */}
        <form onSubmit={onSearch} role="search" className="hidden max-w-md flex-1 md:block">
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden />
            <input
              id="site-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search air fryers, blankets, clothing, bags…"
              className="h-10 w-full rounded-full border border-neutral-200 bg-neutral-50/80 pl-9 pr-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </form>

        {/* Action Controls */}
        <nav className="flex items-center gap-1.5" aria-label="Account and cart">
          <Link
            href="/track"
            className="hidden items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 transition-colors hover:text-neutral-950 hover:bg-neutral-100 sm:inline-flex"
          >
            <PackageSearch className="h-4 w-4 text-neutral-500" aria-hidden />
            <span className="hidden xl:inline">Track Order</span>
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="group relative flex items-center gap-2 rounded-md px-3 py-2 text-neutral-800 transition-colors hover:bg-neutral-100"
            aria-label={`Open shopping bag, ${ready ? count : 0} items`}
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" aria-hidden />
              {ready && count > 0 && (
                <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-neutral-950 px-1 text-[10px] font-bold text-white shadow-sm">
                  {count}
                </span>
              )}
            </div>
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-neutral-900 sm:inline">
              Bag
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile Search Bar */}
      <form onSubmit={onSearch} role="search" className="container-page pb-3 md:hidden">
        <label htmlFor="site-search-mobile" className="sr-only">
          Search products
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden />
          <input
            id="site-search-mobile"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search essentials…"
            className="h-10 w-full rounded-full border border-neutral-200 bg-neutral-50/80 pl-9 pr-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>
      </form>

      {/* Desktop Category Navigation */}
      <nav aria-label="Categories" className="hidden border-t border-neutral-200/70 bg-white/70 lg:block">
        <div className="container-page">
          <ul className="flex items-center gap-1 overflow-x-auto py-2 text-xs font-semibold tracking-wider uppercase scrollbar-none">
            <li>
              <Link
                href="/shop"
                className={`inline-block rounded-md px-3 py-1.5 whitespace-nowrap transition-colors duration-150 ${
                  pathname === "/shop"
                    ? "bg-neutral-950 text-white font-bold"
                    : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
                }`}
              >
                All Products
              </Link>
            </li>
            {categories.map((c) => {
              const active = pathname === `/category/${c.slug}`;
              return (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    aria-current={active ? "page" : undefined}
                    className={`inline-block rounded-md px-3 py-1.5 whitespace-nowrap transition-colors duration-150 ${
                      active
                        ? "bg-neutral-950 text-white font-bold"
                        : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Polished Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 p-4">
              <span className="font-heading text-sm font-bold tracking-[0.15em] uppercase text-neutral-950">
                Menu
              </span>
              <button
                type="button"
                className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {/* Quick Links */}
            <div className="p-3">
              <Link
                href="/"
                className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
              >
                <span>Home</span>
                <ArrowRight className="h-4 w-4 text-neutral-400" aria-hidden />
              </Link>
              <Link
                href="/shop"
                className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
              >
                <span>All Products</span>
                <ArrowRight className="h-4 w-4 text-neutral-400" aria-hidden />
              </Link>
            </div>

            {/* Categories Section */}
            <div className="border-t border-neutral-200/80 px-3 py-4">
              <p className="px-3 pb-2 text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
                Categories
              </p>
              <div className="space-y-0.5">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                  >
                    <span>{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Utility Links */}
            <div className="mt-auto border-t border-neutral-200 bg-neutral-50 p-4 space-y-1">
              <Link
                href="/track"
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 hover:text-neutral-950"
              >
                <PackageSearch className="h-4 w-4 text-neutral-500" aria-hidden />
                <span>Track Order</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 hover:text-neutral-950"
              >
                <span>Contact Customer Care</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
