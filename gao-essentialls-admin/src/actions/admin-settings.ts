"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  currencySymbol: z.string().default("R"),
  deliveryFee: z.coerce.number().min(0),
  freeDeliveryThreshold: z.coerce.number().min(0),
  announcement: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().default(""),
  whatsapp: z.string().default(""),
  address: z.string().default(""),
  bankName: z.string().default(""),
  accountName: z.string().default(""),
  accountNumber: z.string().default(""),
  branchCode: z.string().default(""),
});

export async function updateStoreSettings(
  prevState: { success?: boolean; error?: string } | undefined,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin();

  const raw = {
    storeName: String(formData.get("storeName") || "").trim(),
    currencySymbol: String(formData.get("currencySymbol") || "R").trim(),
    deliveryFee: formData.get("deliveryFee") || 0,
    freeDeliveryThreshold: formData.get("freeDeliveryThreshold") || 0,
    announcement: String(formData.get("announcement") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    whatsapp: String(formData.get("whatsapp") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    bankName: String(formData.get("bankName") || "").trim(),
    accountName: String(formData.get("accountName") || "").trim(),
    accountNumber: String(formData.get("accountNumber") || "").trim(),
    branchCode: String(formData.get("branchCode") || "").trim(),
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid settings input." };
  }

  try {
    await prisma.setting.upsert({
      where: { id: 1 },
      update: parsed.data,
      create: { id: 1, ...parsed.data },
    });

    revalidatePath("/", "layout");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Update settings error:", error);
    return { error: "Failed to save settings." };
  }
}

export async function changeAdminPassword(
  prevState: { success?: boolean; error?: string } | undefined,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const session = await requireAdmin();

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!currentPassword || !newPassword) {
    return { error: "All password fields are required." };
  }

  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters long." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.id },
    });

    if (!admin) {
      return { error: "Admin account not found." };
    }

    const match = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!match) {
      return { error: "Current password entered is incorrect." };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash },
    });

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { error: "Failed to update password." };
  }
}
