"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { saveProduct } from "@/actions/admin-products";

interface CategoryOption {
  id: number;
  name: string;
}

interface ProductFormProps {
  initialData?: {
    id: number;
    name: string;
    slug: string;
    description: string;
    categoryId: number;
    price: number;
    salePrice: number | null;
    stock: number;
    sku: string;
    images: string[];
    sizes: string[];
    colors: string[];
    isFeatured: boolean;
    isActive: boolean;
  };
  categories: CategoryOption[];
  currencySymbol: string;
}

export function ProductForm({ initialData, categories, currencySymbol }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(saveProduct, undefined);

  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [sizes, setSizes] = useState<string[]>(initialData?.sizes || []);
  const [colors, setColors] = useState<string[]>(initialData?.colors || []);

  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle image upload to API
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error || "Failed to upload image");
      } else {
        setImages((prev) => [...prev, json.url]);
      }
    } catch {
      setUploadError("Network error during upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function addSize() {
    const s = sizeInput.trim().toUpperCase();
    if (s && !sizes.includes(s)) {
      setSizes((prev) => [...prev, s]);
      setSizeInput("");
    }
  }

  function removeSize(s: string) {
    setSizes((prev) => prev.filter((item) => item !== s));
  }

  function addColor() {
    const c = colorInput.trim();
    if (c && !colors.includes(c)) {
      setColors((prev) => [...prev, c]);
      setColorInput("");
    }
  }

  function removeColor(c: string) {
    setColors((prev) => prev.filter((item) => item !== c));
  }

  return (
    <form action={formAction} className="space-y-8">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="sizes" value={JSON.stringify(sizes)} />
      <input type="hidden" name="colors" value={JSON.stringify(colors)} />

      {/* Header and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Products
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-ink">
            {initialData ? `Edit: ${initialData.name}` : "Create New Product"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/products" className="btn-outline min-h-10 px-4 text-xs">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary min-h-10 px-5 text-xs shadow-md disabled:opacity-60 flex items-center gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{initialData ? "Update Product" : "Save Product"}</span>
          </button>
        </div>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-danger"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-success"
        >
          <Check className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Product saved successfully!</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left Column: General info, images, variants */}
        <div className="space-y-6">
          {/* Basic Details */}
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-bold text-ink border-b border-line pb-3">
              Basic Information
            </h2>

            <div>
              <label htmlFor="name" className="label">
                Product Name <span className="text-danger">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={initialData?.name || ""}
                placeholder="e.g. Stainless Steel 5-Piece Pot Set"
                className="input"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="categoryId" className="label">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  defaultValue={initialData?.categoryId || categories[0]?.id || ""}
                  className="input"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sku" className="label">
                  SKU / Stock Code
                </label>
                <input
                  id="sku"
                  name="sku"
                  type="text"
                  defaultValue={initialData?.sku || ""}
                  placeholder="e.g. GAO-1045"
                  className="input uppercase"
                />
              </div>
            </div>

            <div>
              <label htmlFor="slug" className="label">
                URL Slug (optional)
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                defaultValue={initialData?.slug || ""}
                placeholder="Leave blank to auto-generate from name"
                className="input text-xs"
              />
            </div>

            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={initialData?.description || ""}
                placeholder="Provide detailed description, specifications, and materials..."
                className="input min-h-28 resize-none"
              />
            </div>
          </div>

          {/* Product Images */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-base font-bold text-ink">Product Images</h2>
              <span className="text-xs text-muted">{images.length} images</span>
            </div>

            {uploadError && (
              <p className="text-xs text-danger font-semibold">{uploadError}</p>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-surface"
                >
                  <Image src={img} alt="" fill sizes="120px" className="object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 badge bg-primary text-[10px] text-white">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 grid h-7 w-7 place-items-center rounded-md bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}

              {/* Upload button */}
              <label className="card flex aspect-square cursor-pointer flex-col items-center justify-center border-dashed border-2 hover:border-primary transition-colors p-4 text-center">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="sr-only"
                />
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                ) : (
                  <>
                    <UploadCloud className="h-6 w-6 text-muted mb-1" aria-hidden="true" />
                    <span className="text-xs font-bold text-primary">Upload Photo</span>
                    <span className="text-[10px] text-muted mt-0.5">PNG, JPG, WebP</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Variants: Sizes & Colors */}
          <div className="card p-6 space-y-6">
            <h2 className="text-base font-bold text-ink border-b border-line pb-3">
              Variants (Optional)
            </h2>

            {/* Sizes */}
            <div>
              <label className="label">Available Sizes</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSize();
                    }
                  }}
                  placeholder="e.g. S, M, L, XL or 6, 7, 8"
                  className="input flex-1 min-h-9 text-xs"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="btn-outline min-h-9 px-3 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add Size
                </button>
              </div>

              {sizes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 rounded-md bg-surface px-2.5 py-1 text-xs font-semibold text-ink border border-line"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSize(s)}
                        className="text-muted hover:text-danger"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="border-t border-line pt-4">
              <label className="label">Available Colours</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addColor();
                    }
                  }}
                  placeholder="e.g. Black, White, Navy, Floral"
                  className="input flex-1 min-h-9 text-xs"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="btn-outline min-h-9 px-3 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add Colour
                </button>
              </div>

              {colors.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 rounded-md bg-surface px-2.5 py-1 text-xs font-semibold text-ink border border-line"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => removeColor(c)}
                        className="text-muted hover:text-danger"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Inventory, Visibility */}
        <div className="space-y-6">
          {/* Pricing & Stock */}
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-bold text-ink border-b border-line pb-3">
              Pricing & Inventory
            </h2>

            <div>
              <label htmlFor="price" className="label">
                Regular Price ({currencySymbol}) <span className="text-danger">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={initialData?.price ?? ""}
                placeholder="e.g. 599.00"
                className="input font-semibold"
              />
            </div>

            <div>
              <label htmlFor="salePrice" className="label">
                Sale Price ({currencySymbol})
              </label>
              <input
                id="salePrice"
                name="salePrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={initialData?.salePrice ?? ""}
                placeholder="Optional discounted price"
                className="input"
              />
              <p className="mt-1 text-xs text-muted">
                If provided, items will display with a discount badge.
              </p>
            </div>

            <div>
              <label htmlFor="stock" className="label">
                Stock Quantity <span className="text-danger">*</span>
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                required
                defaultValue={initialData?.stock ?? 10}
                className="input font-bold"
              />
              <p className="mt-1 text-xs text-muted">
                Automatically decremented when orders are placed.
              </p>
            </div>
          </div>

          {/* Visibility and Featured flags */}
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-bold text-ink border-b border-line pb-3">
              Visibility & Flags
            </h2>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={initialData ? initialData.isActive : true}
                className="mt-1 h-4 w-4 rounded border-line text-primary focus:ring-primary"
              />
              <div>
                <p className="text-sm font-bold text-ink">Active (Published)</p>
                <p className="text-xs text-muted">
                  Show this product in storefront searches, category grids, and shop.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-line">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={initialData?.isFeatured || false}
                className="mt-1 h-4 w-4 rounded border-line text-primary focus:ring-primary"
              />
              <div>
                <p className="text-sm font-bold text-ink">Featured Product</p>
                <p className="text-xs text-muted">
                  Feature this item on the homepage featured carousel and hero spots.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
