"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, Lock, ShieldCheck } from "lucide-react";
import { loginAdmin } from "@/actions/auth";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, undefined);
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary font-heading text-xl font-bold text-white shadow">
              G
            </span>
            <span className="font-heading text-2xl font-bold tracking-tight text-ink">
              Gao <span className="text-cta">Essentialls</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-ink">Admin Portal</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage your store and orders</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-md">
          {state?.error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-danger"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue="admin@gaoessentialls.co.za"
                placeholder="admin@gaoessentialls.co.za"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                defaultValue="Admin@123"
                placeholder="••••••••"
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-3 text-base shadow disabled:opacity-60"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              {isPending ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          {/* Seed helper credentials note */}
          <div className="mt-6 rounded-lg border border-primary/20 bg-primary-light/40 p-3 text-xs text-ink">
            <p className="flex items-center gap-1.5 font-bold text-primary mb-1">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Default Demo Credentials:
            </p>
            <p>
              Email: <code>admin@gaoessentialls.co.za</code>
            </p>
            <p>
              Password: <code>Admin@123</code>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          <a href={storeUrl} className="hover:text-primary underline">
            ← Return to Gao Essentialls Storefront
          </a>
        </p>
      </div>
    </div>
  );
}
