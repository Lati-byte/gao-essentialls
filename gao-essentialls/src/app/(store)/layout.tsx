import { Suspense } from "react";
import { CartProvider } from "@/components/store/cart-context";
import { CartDrawer } from "@/components/store/cart-drawer";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { getActiveCategories } from "@/lib/catalog";
import { getSettings, toPublicSettings } from "@/lib/settings";

// The catalogue is edited live from the admin, so always render fresh data.
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getActiveCategories()]);
  const nav = categories.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <CartProvider settings={toPublicSettings(settings)}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      {settings.announcement && (
        <div className="bg-neutral-950 px-4 py-2.5 text-center text-xs font-medium tracking-wider text-neutral-300 uppercase">
          {settings.announcement}
        </div>
      )}
      <Suspense fallback={<div className="h-16 border-b border-line" />}>
        <Header categories={nav} storeName={settings.storeName} />
      </Suspense>
      <main id="main">{children}</main>
      <Footer settings={settings} categories={nav} />
      <CartDrawer />
    </CartProvider>
  );
}
