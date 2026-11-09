import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gao Essentialls — Curated Everyday & Luxury Essentials",
    template: "%s | Gao Essentialls",
  },
  description:
    "Discover curated fashion, premium cookware, modern appliances, footwear, handcrafted bags, sports jerseys, and cosy blankets at Gao Essentialls.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0b0d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-950 antialiased selection:bg-neutral-950 selection:text-white">
        {children}
      </body>
    </html>
  );
}
