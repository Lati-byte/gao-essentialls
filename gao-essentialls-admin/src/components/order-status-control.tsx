"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateOrderStatus, updatePaymentStatus } from "@/actions/admin-orders";
import { ORDER_STATUSES, PAYMENT_STATUSES, statusLabel } from "@/lib/format";

interface OrderStatusControlProps {
  orderId: number;
  initialStatus: string;
  initialPaymentStatus: string;
}

export function OrderStatusControl({
  orderId,
  initialStatus,
  initialPaymentStatus,
}: OrderStatusControlProps) {
  const [status, setStatus] = useState(initialStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [isPending, startTransition] = useTransition();
  const [savedNotice, setSavedNotice] = useState(false);

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    });
  }

  function handlePaymentChange(newPayment: string) {
    setPaymentStatus(newPayment);
    startTransition(async () => {
      await updatePaymentStatus(orderId, newPayment);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    });
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h2 className="text-base font-bold text-ink">Manage Order State</h2>
        <div className="flex items-center gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />}
          {savedNotice && (
            <span className="flex items-center gap-1 text-xs font-bold text-success">
              <Check className="h-3.5 w-3.5" aria-hidden="true" /> Saved
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Order Status */}
        <div>
          <label htmlFor="order-status-select" className="label">
            Fulfillment Status
          </label>
          <select
            id="order-status-select"
            value={status}
            disabled={isPending}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="input font-semibold"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-muted">
            Changing to Cancelled automatically restores product stock.
          </p>
        </div>

        {/* Payment Status */}
        <div>
          <label htmlFor="payment-status-select" className="label">
            Payment Status
          </label>
          <select
            id="payment-status-select"
            value={paymentStatus}
            disabled={isPending}
            onChange={(e) => handlePaymentChange(e.target.value)}
            className="input font-semibold"
          >
            {PAYMENT_STATUSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-muted">
            Mark as PAID once payment is verified (EFT or Cash).
          </p>
        </div>
      </div>
    </div>
  );
}
