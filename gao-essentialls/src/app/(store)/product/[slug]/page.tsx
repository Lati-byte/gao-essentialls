import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/store/product-card";
import { ProductView } from "@/components/store/product-view";
import { prisma } from "@/lib/db";
import { parseList } from "@/lib/format";
import { toCardData } from "@/lib/catalog";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  // Fetch related products in the same category
  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      id: { not: product.id },
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const parsedProduct = {
    ...product,
    images: parseList(product.images),
    sizes: parseList(product.sizes),
    colors: parseList(product.colors),
  };

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Editorial Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 text-xs font-medium text-neutral-400">
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <Link href="/" className="hover:text-neutral-950 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-neutral-300">/</li>
          <li>
            <Link href="/shop" className="hover:text-neutral-950 transition-colors">
              Shop
            </Link>
          </li>
          <li aria-hidden="true" className="text-neutral-300">/</li>
          <li>
            <Link href={`/category/${product.category.slug}`} className="hover:text-neutral-950 transition-colors">
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden="true" className="text-neutral-300">/</li>
          <li className="text-neutral-950 font-semibold max-w-[200px] truncate sm:max-w-none">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main Product View Presentation */}
      <ProductView product={parsedProduct} />

      {/* Related Collection Section */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-neutral-200/80 pt-16">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                Related Essentials
              </p>
              <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                More from {product.category.name}
              </h2>
            </div>
            <Link
              href={`/category/${product.category.slug}`}
              className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:text-neutral-600 transition-colors"
            >
              <span>View Department</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
          <ProductGrid products={related.map(toCardData)} />
        </section>
      )}
    </div>
  );
}
