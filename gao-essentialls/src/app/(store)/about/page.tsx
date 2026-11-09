import Link from "next/link";
import { ArrowRight, Heart, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="container-page py-12 sm:py-20">
      {/* Editorial Header */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          Our Story & Philosophy
        </span>
        <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
          Curated quality essentials for every home.
        </h1>
        <p className="mt-4 text-xs sm:text-sm text-neutral-500 leading-relaxed">
          Gao Essentialls was founded on a simple premise: everyday items — from kitchen appliances and cookware to clothing, bags, athletic apparel, and blankets — should be durable, accessible, and reliably delivered.
        </p>
      </div>

      {/* Narrative Section */}
      <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-8 sm:p-12 space-y-6 text-xs sm:text-sm text-neutral-600 leading-relaxed">
        <h2 className="font-heading text-base font-bold uppercase tracking-wider text-neutral-950">
          Curated for Modern Living
        </h2>
        <p>
          At <strong>{settings.storeName}</strong>, we handpick products across multiple daily categories so you don&apos;t have to compromise on utility, craftsmanship, or aesthetic value. Whether you are outfitting your kitchen with modern appliances and heavy-gauge pots, updating your seasonal wardrobe with jackets and hats, or wrapping yourself in luxury blankets, we ensure every piece meets our durability standards.
        </p>
        <p>
          We know trust is earned. That is why we offer flexible fulfillment and payment methods — including <strong>Cash on Delivery (COD)</strong>, direct bank transfers (Instant EFT), and convenient Johannesburg warehouse collection.
        </p>

        {/* Pillars Grid */}
        <div className="grid gap-6 pt-8 sm:grid-cols-3 border-t border-neutral-200">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-10 w-10 place-items-center rounded-sm bg-neutral-900 text-white mb-3">
              <Truck className="h-4 w-4" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-neutral-950 text-xs uppercase tracking-wider">
              Nationwide Dispatch
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1">Doorstep courier delivery across South Africa with real-time parcel tracking.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="grid h-10 w-10 place-items-center rounded-sm bg-neutral-900 text-white mb-3">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-neutral-950 text-xs uppercase tracking-wider">
              Individually Checked
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1">Every appliance, bag, garment, and pot is inspected before being packaged.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="grid h-10 w-10 place-items-center rounded-sm bg-neutral-900 text-white mb-3">
              <Heart className="h-4 w-4" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-neutral-950 text-xs uppercase tracking-wider">
              Customer First
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1">Dedicated customer care via phone, email, and WhatsApp for every inquiry.</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mx-auto mt-12 max-w-xs text-center">
        <Link
          href="/shop"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <span>Explore The Catalogue</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
