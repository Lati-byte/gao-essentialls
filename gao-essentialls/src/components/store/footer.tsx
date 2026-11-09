import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import type { StoreSettings } from "@/lib/settings";

export function Footer({
  settings,
  categories,
}: {
  settings: StoreSettings;
  categories: { name: string; slug: string }[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-neutral-200/80 bg-neutral-950 text-neutral-400">
      {/* Editorial Value Strip */}
      <div className="border-b border-neutral-900">
        <div className="container-page grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-neutral-900 text-neutral-200">
              <Truck className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">Nationwide Delivery</p>
              <p className="text-xs text-neutral-400">Doorstep courier & reliable dispatch</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-neutral-900 text-neutral-200">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">Quality Assured</p>
              <p className="text-xs text-neutral-400">Carefully curated & individually inspected</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-neutral-900 text-neutral-200">
              <RotateCcw className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">Hassle-Free Returns</p>
              <p className="text-xs text-neutral-400">7-day peace of mind policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        {/* Brand Column */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-sm bg-white font-bold text-neutral-950 text-xs tracking-wider">
              G
            </span>
            <span className="font-heading text-sm font-extrabold tracking-[0.2em] uppercase text-white">
              GAO <span className="font-light text-neutral-400">ESSENTIALLS</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-neutral-400">
            A contemporary multi-category destination delivering premium fashion, cookware, electric appliances, footwear, handcrafted bags, sports jerseys, and winter blankets.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium tracking-wider uppercase text-neutral-300">
              Open for Online Orders 24/7
            </span>
          </div>
        </div>

        {/* Categories Column */}
        <div>
          <h2 className="text-xs font-bold tracking-widest uppercase text-white">
            Curated Collections
          </h2>
          <ul className="mt-4 space-y-2.5 text-xs">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="transition-colors duration-150 hover:text-white"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            {categories.length > 6 && (
              <li>
                <Link href="/shop" className="font-semibold text-neutral-300 hover:text-white">
                  + View All Categories
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Customer Care Column */}
        <div>
          <h2 className="text-xs font-bold tracking-widest uppercase text-white">
            Customer Care
          </h2>
          <ul className="mt-4 space-y-2.5 text-xs">
            <li>
              <Link href="/track" className="transition-colors duration-150 hover:text-white">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition-colors duration-150 hover:text-white">
                Shopping Bag
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition-colors duration-150 hover:text-white">
                Our Story & Quality
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors duration-150 hover:text-white">
                Contact & Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info Column */}
        <div>
          <h2 className="text-xs font-bold tracking-widest uppercase text-white">
            Get In Touch
          </h2>
          <ul className="mt-4 space-y-3 text-xs">
            {settings.phone && (
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="hover:text-white transition-colors"
                >
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
                <a
                  href={`mailto:${settings.email}`}
                  className="break-all hover:text-white transition-colors"
                >
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
                <span className="leading-snug">{settings.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Payment Row */}
      <div className="border-t border-neutral-900 bg-black/40">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-[11px] text-neutral-500 sm:flex-row">
          <p>© {year} {settings.storeName}. All rights reserved.</p>
          <div className="flex items-center gap-4 tracking-wider uppercase text-neutral-400">
            <span>Cash on Delivery</span>
            <span>·</span>
            <span>Direct EFT</span>
            <span>·</span>
            <span>Store Collection</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
