import type { Metadata, Viewport } from "next";
import { Nunito_Sans, Rubik } from "next/font/google";
import "./globals.css";
import { getAdminSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { AdminShell } from "@/components/admin-shell";

const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik", display: "swap" });
const nunito = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard | Gao Essentialls",
    template: "%s | Gao Essentialls Admin",
  },
  description: "Management and operations dashboard for Gao Essentialls.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  const settings = await getSettings();

  return (
    <html lang="en" className={`${rubik.variable} ${nunito.variable}`}>
      <body className="min-h-screen bg-surface">
        {session ? (
          <AdminShell
            adminName={session.name || "Administrator"}
            adminEmail={session.email}
            storeName={settings.storeName}
          >
            {children}
          </AdminShell>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
