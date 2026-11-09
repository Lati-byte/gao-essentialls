"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Edit, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { deleteProduct, quickUpdateStock, toggleProductActive } from "@/actions/admin-products";

interface ProductRowActionsProps {
  productId: string;
  slug: string;
  stock: number;
  isActive: boolean;
}

export function ProductRowActions({
  productId,
  slug,
  stock: initialStock,
  isActive: initialActive,
}: ProductRowActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [stock, setStock] = useState(initialStock);
  const [isActive, setIsActive] = useState(initialActive);
  const [editingStock, setEditingStock] = useState(false);

  function handleStockBlur() {
    setEditingStock(false);
    if (stock !== initialStock) {
      startTransition(async () => {
        await quickUpdateStock(productId, stock);
      });
    }
  }

  function handleToggleActive() {
    startTransition(async () => {
      const next = !isActive;
      setIsActive(next);
      await toggleProductActive(productId, next);
    });
  }

  function handleDelete() {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      startTransition(async () => {
        await deleteProduct(productId);
      });
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Quick stock input */}
      <div className="flex items-center">
        {editingStock ? (
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
            onBlur={handleStockBlur}
            onKeyDown={(e) => e.key === "Enter" && handleStockBlur()}
            autoFocus
            className="w-16 rounded border border-primary px-1.5 py-0.5 text-xs text-center font-bold"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingStock(true)}
            className={`badge cursor-pointer px-2 py-0.5 hover:ring-2 hover:ring-primary/40 ${
              stock === 0
                ? "bg-red-100 text-danger"
                : stock <= 5
                ? "bg-amber-100 text-amber-800"
                : "bg-surface text-ink border border-line"
            }`}
            title="Click to quick-edit stock"
          >
            {stock} in stock
          </button>
        )}
      </div>

      {/* Visibility toggle */}
      <button
        type="button"
        disabled={isPending}
        onClick={handleToggleActive}
        className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
          isActive
            ? "text-success hover:bg-green-50"
            : "text-muted hover:bg-slate-100 line-through"
        }`}
        title={isActive ? "Product is active (click to hide)" : "Product is hidden (click to show)"}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : isActive ? (
          <Eye className="h-4 w-4" aria-hidden="true" />
        ) : (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {/* Edit link */}
      <Link
        href={`/products/${productId}`}
        className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface hover:text-primary transition-colors"
        title="Edit product details"
      >
        <Edit className="h-4 w-4" aria-hidden="true" />
      </Link>

      {/* Delete button */}
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-danger transition-colors disabled:opacity-40"
        title="Delete product"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
