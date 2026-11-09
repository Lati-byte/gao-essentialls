import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ShieldCheck, Truck, RotateCcw, Sparkles } from "lucide-react";
import { ProductGrid } from "@/components/store/product-card";
import { getActiveCategories, toCardData } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { publicImage } from "@/lib/images";
import { getSettings } from "@/lib/settings";

export default async function HomePage() {
  const [settings, categories, featured, sale] = await Promise.all([
    getSettings(),
    getActiveCategories(),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true, category: { isActive: true } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true, salePrice: { not: null }, stock: { gt: 0 }, category: { isActive: true } },
      include: { category: true },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
  ]);

  const hero = publicImage("hero");
  const sym = settings.currencySymbol;

  const standards = [
    {
      num: "01",
      icon: Truck,
      title: "Nationwide Dispatch",
      desc: settings.freeDeliveryThreshold > 0 ? `Free delivery over ${formatPrice(settings.freeDeliveryThreshold, sym)}` : "Fast doorstep courier",
    },
    {
      num: "02",
      icon: Sparkles,
      title: "Flexible Payment",
      desc: "Cash on delivery, Instant EFT & in-store collection",
    },
    {
      num: "03",
      icon: RotateCcw,
      title: "7-Day Guarantee",
      desc: "Simple, effortless returns & order assistance",
    },
    {
      num: "04",
      icon: ShieldCheck,
      title: "Verified Authenticity",
      desc: "Each item inspected before careful packaging",
    },
  ];

  return (
    <>
      {/* Editorial Hero Section */}
      <section className="relative min-h-[540px] sm:min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden bg-neutral-950">
        <Image
          src={hero}
          alt="Gao Essentialls Lifestyle"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-55 scale-[1.02] transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-neutral-950/20" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent sm:hidden" aria-hidden />

        <div className="container-page relative z-10 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>Curated Edition 2026</span>
            </div>

            <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Elevated essentials for every aspect of living.
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-relaxed text-neutral-300 sm:text-base">
              From culinary cookware and smart appliances to seasonal outerwear, handcrafted bags, athletic kits, and plush blankets.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <Link
                href="/shop"
                className="btn min-h-12 bg-white px-7 text-xs font-bold uppercase tracking-wider text-neutral-950 hover:bg-neutral-100 active:scale-[0.99] transition-all shadow-md"
              >
                <span>Explore Collection</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#categories"
                className="btn min-h-12 border border-white/30 bg-white/5 px-7 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/15 active:scale-[0.99] transition-all backdrop-blur-xs"
              >
                View Categories
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Standards / Perks Bar */}
      <section aria-label="Brand standards" className="border-b border-neutral-200/80 bg-neutral-50/70">
        <div className="container-page grid grid-cols-2 gap-4 py-8 lg:grid-cols-4 lg:gap-8">
          {standards.map(({ num, icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 sm:gap-4 p-2">
              <span className="font-heading text-xs font-bold tracking-widest text-neutral-400 mt-1">
                {num}
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-900">{title}</p>
                <p className="mt-0.5 text-xs text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Categories Grid */}
      <section id="categories" className="container-page scroll-mt-24 py-16 sm:py-20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              Department Index
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:text-neutral-600 transition-colors"
          >
            <span>All Products</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/category/${c.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/60 transition-all duration-300 hover:shadow-lg"
              >
                <Image
                  src={c.image || "/images/placeholder.svg"}
                  alt={c.name}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h3 className="font-heading text-sm font-bold tracking-wide uppercase sm:text-base">
                    {c.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-between text-xs text-neutral-300">
                    <span>{c._count.products} {c._count.products === 1 ? "item" : "items"}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Featured Products Collection */}
      {featured.length > 0 && (
        <section className="container-page py-10 sm:py-16 border-t border-neutral-200/60">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                Curated Selection
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                Featured Essentials
              </h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:text-neutral-600 transition-colors"
            >
              <span>Explore All</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid products={featured.map(toCardData)} />
          </div>
        </section>
      )}

      {/* Seasonal Campaign Banner */}
      <section className="container-page py-12 sm:py-16">
        <div className="relative overflow-hidden rounded-2xl bg-neutral-950 p-8 sm:p-12 lg:p-16 text-white border border-neutral-800">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">
              Seasonal Focus · Winter Warmth
            </span>
            <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
              Cosy comfort for every home.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
              Discover heavy Korean fleece and mink blankets, warm knitted beanies, thermal jackets, and winter essentials engineered for lasting softness.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link
                href="/category/blankets"
                className="btn min-h-11 bg-white px-6 text-xs font-bold uppercase tracking-wider text-neutral-950 hover:bg-neutral-100 transition-all shadow-sm"
              >
                Shop Blankets
              </Link>
              <Link
                href="/category/hats"
                className="btn min-h-11 border border-white/30 bg-white/5 px-6 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/15 transition-all"
              >
                Beanies & Caps
              </Link>
            </div>
          </div>
          {/* Subtle architectural background accent */}
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-neutral-800/50 blur-3xl" aria-hidden />
        </div>
      </section>

      {/* On Sale / Seasonal Reductions */}
      {sale.length > 0 && (
        <section className="container-page pb-16 sm:pb-20">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
                Limited Time Offers
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                Seasonal Reductions
              </h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:text-neutral-600 transition-colors"
            >
              <span>View All Offers</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid products={sale.map(toCardData)} />
          </div>
        </section>
      )}
    </>
  );
}
