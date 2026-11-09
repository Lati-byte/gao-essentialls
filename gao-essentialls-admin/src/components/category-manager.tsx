"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  AlertCircle,
  Check,
  Edit2,
  FolderPlus,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { deleteCategory, saveCategory } from "@/actions/admin-categories";

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
  _count: {
    products: number;
  };
}

export function CategoryManager({ categories }: { categories: CategoryItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  function openCreate() {
    setEditingCategory(null);
    setImageUrl("");
    setIsCreating(true);
    setError(null);
    setSuccess(null);
  }

  function openEdit(cat: CategoryItem) {
    setIsCreating(false);
    setEditingCategory(cat);
    setImageUrl(cat.image || "");
    setError(null);
    setSuccess(null);
  }

  function closeForm() {
    setIsCreating(false);
    setEditingCategory(null);
    setImageUrl("");
    setError(null);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Upload failed");
      } else {
        setImageUrl(json.url);
      }
    } catch {
      setError("Network error uploading image");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("image", imageUrl);

    startTransition(async () => {
      setError(null);
      const res = await saveCategory(fd);
      if (!res.success) {
        setError(res.error || "Failed to save category");
      } else {
        setSuccess("Category saved successfully!");
        closeForm();
        setTimeout(() => setSuccess(null), 3000);
      }
    });
  }

  function handleDelete(id: number, name: string) {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      startTransition(async () => {
        setError(null);
        const res = await deleteCategory(id);
        if (!res.success) {
          setError(res.error || "Failed to delete category");
        } else {
          setSuccess("Category deleted successfully!");
          setTimeout(() => setSuccess(null), 3000);
        }
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted">
            Organize products into dedicated collections ({categories.length} categories).
          </p>
        </div>

        {!isCreating && !editingCategory && (
          <button
            type="button"
            onClick={openCreate}
            className="btn-primary flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add Category
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 p-4 text-xs text-success"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </div>
      )}

      {/* Inline Create / Edit Form */}
      {(isCreating || editingCategory) && (
        <div className="card p-6 border-primary/30 shadow-md">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-5">
            <h2 className="text-base font-bold text-ink">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="text-muted hover:text-ink p-1 rounded-md"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {editingCategory && <input type="hidden" name="id" value={editingCategory.id} />}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">
                  Category Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingCategory?.name || ""}
                  placeholder="e.g. Electric Appliances"
                  className="input"
                />
              </div>

              <div>
                <label className="label">URL Slug (optional)</label>
                <input
                  type="text"
                  name="slug"
                  defaultValue={editingCategory?.slug || ""}
                  placeholder="e.g. electric-appliances"
                  className="input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                rows={2}
                defaultValue={editingCategory?.description || ""}
                placeholder="Short summary displayed on storefront banner..."
                className="input min-h-20 resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Image Uploader */}
              <div>
                <label className="label">Banner Photo</label>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
                    <Image
                      src={imageUrl || "/images/placeholder.svg"}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <label className="btn-outline min-h-9 px-3 text-xs cursor-pointer inline-flex items-center gap-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="sr-only"
                    />
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                    ) : (
                      <UploadCloud className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
                  </label>
                </div>
              </div>

              {/* Sort Order & Active */}
              <div className="space-y-3">
                <div>
                  <label className="label">Display Order</label>
                  <input
                    type="number"
                    name="sortOrder"
                    defaultValue={editingCategory?.sortOrder ?? 0}
                    className="input w-28 text-xs font-semibold"
                  />
                  <p className="text-[10px] text-muted mt-0.5">Lower numbers display first</p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editingCategory ? editingCategory.isActive : true}
                    className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-ink">Active on storefront</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={closeForm}
                className="btn-outline min-h-9 px-4 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary min-h-9 px-5 text-xs flex items-center gap-2"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                <span>{editingCategory ? "Update Category" : "Save Category"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-surface text-muted uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-line bg-surface">
                        <Image
                          src={c.image || "/images/placeholder.svg"}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-ink text-sm">{c.name}</p>
                        <p className="text-[10px] text-muted line-clamp-1">{c.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted">
                    {c.slug}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="badge bg-primary-light text-primary font-bold">
                      {c._count.products} products
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink">
                    #{c.sortOrder}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {c.isActive ? (
                      <span className="badge bg-green-100 text-success">Active</span>
                    ) : (
                      <span className="badge bg-slate-100 text-muted">Hidden</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface hover:text-primary transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(c.id, c.name)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-danger transition-colors disabled:opacity-40"
                        title="Delete category"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
