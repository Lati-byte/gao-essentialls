import "server-only";
import { prisma } from "./db";

export async function getSettings() {
  const existing = await prisma.setting.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.setting.create({ data: { id: 1 } });
}

export type StoreSettings = Awaited<ReturnType<typeof getSettings>>;

/** The subset of settings that is safe and useful on the client. */
export type PublicSettings = {
  storeName: string;
  currencySymbol: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  address: string;
};

export function toPublicSettings(s: StoreSettings): PublicSettings {
  return {
    storeName: s.storeName,
    currencySymbol: s.currencySymbol,
    deliveryFee: s.deliveryFee,
    freeDeliveryThreshold: s.freeDeliveryThreshold,
    address: s.address || "123 Main Road, Johannesburg, 2001",
  };
}

export function calcDeliveryFee(subtotal: number, method: string, s: PublicSettings): number {
  if (method === "COLLECTION") return 0;
  if (s.freeDeliveryThreshold > 0 && subtotal >= s.freeDeliveryThreshold) return 0;
  return s.deliveryFee;
}
