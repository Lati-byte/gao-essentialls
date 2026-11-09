"use client";

import { useActionState } from "react";
import { AlertCircle, Check, Key, Loader2, Save, Store, Truck, Building } from "lucide-react";
import { changeAdminPassword, updateStoreSettings } from "@/actions/admin-settings";
import type { StoreSettings } from "@/lib/settings";

export function SettingsForms({ settings }: { settings: StoreSettings }) {
  const [storeState, storeAction, storePending] = useActionState(updateStoreSettings, undefined);
  const [pwState, pwAction, pwPending] = useActionState(changeAdminPassword, undefined);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* 1. Store General & Delivery Settings */}
      <form action={storeAction} className="card p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2 text-ink">
            <Store className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-bold">General Store & Delivery Configuration</h2>
          </div>
          <button
            type="submit"
            disabled={storePending}
            className="btn-primary min-h-9 px-4 text-xs flex items-center gap-1.5"
          >
            {storePending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            <span>Save Settings</span>
          </button>
        </div>

        {storeState?.error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{storeState.error}</span>
          </div>
        )}

        {storeState?.success && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-success"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Store settings saved successfully!</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Store Name</label>
            <input
              type="text"
              name="storeName"
              required
              defaultValue={settings.storeName}
              className="input"
            />
          </div>

          <div>
            <label className="label">Currency Symbol</label>
            <input
              type="text"
              name="currencySymbol"
              required
              defaultValue={settings.currencySymbol}
              className="input w-24 text-center font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label">Announcement Bar Text</label>
            <input
              type="text"
              name="announcement"
              defaultValue={settings.announcement}
              placeholder="e.g. Free delivery on orders over R1,000 • Cash on delivery available"
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">Standard Delivery Fee ({settings.currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              name="deliveryFee"
              defaultValue={settings.deliveryFee}
              className="input"
            />
          </div>

          <div>
            <label className="label">Free Delivery Threshold ({settings.currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              name="freeDeliveryThreshold"
              defaultValue={settings.freeDeliveryThreshold}
              className="input"
            />
            <p className="text-[10px] text-muted mt-1">Orders at or above this get free delivery</p>
          </div>
        </div>

        {/* Contact info */}
        <div className="border-t border-line pt-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
            Contact & Location Information
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Support Phone</label>
              <input
                type="text"
                name="phone"
                defaultValue={settings.phone}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="label">WhatsApp Number</label>
              <input
                type="text"
                name="whatsapp"
                defaultValue={settings.whatsapp}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="label">Support Email</label>
              <input
                type="email"
                name="email"
                defaultValue={settings.email}
                className="input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="label">Physical Address (Collection Point)</label>
            <input
              type="text"
              name="address"
              defaultValue={settings.address}
              className="input text-xs"
            />
          </div>
        </div>

        {/* EFT Bank details */}
        <div className="border-t border-line pt-5 space-y-4">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              EFT Payment Bank Account Details
            </h3>
          </div>
          <p className="text-xs text-muted">
            Displayed to customers on order confirmation when they select EFT / Bank Transfer.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Bank Name</label>
              <input
                type="text"
                name="bankName"
                defaultValue={settings.bankName}
                placeholder="e.g. FNB / Standard Bank / Capitec"
                className="input text-xs"
              />
            </div>
            <div>
              <label className="label">Account Holder Name</label>
              <input
                type="text"
                name="accountName"
                defaultValue={settings.accountName}
                placeholder="e.g. Gao Essentialls (Pty) Ltd"
                className="input text-xs"
              />
            </div>
            <div>
              <label className="label">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                defaultValue={settings.accountNumber}
                className="input text-xs font-mono"
              />
            </div>
            <div>
              <label className="label">Branch Code</label>
              <input
                type="text"
                name="branchCode"
                defaultValue={settings.branchCode}
                className="input text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </form>

      {/* 2. Admin Password Change Form */}
      <form action={pwAction} className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2 text-ink">
            <Key className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-bold">Admin Security & Password</h2>
          </div>
          <button
            type="submit"
            disabled={pwPending}
            className="btn-outline min-h-9 px-4 text-xs flex items-center gap-1.5"
          >
            {pwPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            <span>Update Password</span>
          </button>
        </div>

        {pwState?.error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{pwState.error}</span>
          </div>
        )}

        {pwState?.success && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-success"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Admin password changed successfully!</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              required
              placeholder="••••••••"
              className="input text-xs"
            />
          </div>
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              name="newPassword"
              required
              placeholder="Min 6 characters"
              className="input text-xs"
            />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Re-type new password"
              className="input text-xs"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
