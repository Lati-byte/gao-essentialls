"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existing) {
      return { success: false, error: "Order not found." };
    }

    const oldStatus = existing.status;

    // Transaction to update status and adjust stock if cancelling or un-cancelling
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      // If cancelling, restore inventory stock
      if (newStatus === "CANCELLED" && oldStatus !== "CANCELLED") {
        for (const item of existing.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      // If reactivating a cancelled order, re-decrement stock
      if (oldStatus === "CANCELLED" && newStatus !== "CANCELLED") {
        for (const item of existing.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }
      }
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update order status error:", error);
    return { success: false, error: "Failed to update order status." };
  }
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update payment status error:", error);
    return { success: false, error: "Failed to update payment status." };
  }
}

export async function deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.order.delete({ where: { id: orderId } });
    revalidatePath("/orders");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete order" };
  }
}
