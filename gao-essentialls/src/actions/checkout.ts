"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { effectivePrice } from "@/lib/format";
import { getSettings } from "@/lib/settings";

const checkoutItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  size: z.string().default(""),
  color: z.string().default(""),
});

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Full name is required (min 2 characters)"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  deliveryMethod: z.enum(["DELIVERY", "COLLECTION"]),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["COD", "EFT", "PAY_ON_COLLECTION"]),
  notes: z.string().optional(),
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutResult =
  | { success: true; orderNumber: string }
  | { success: false; error: string };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Invalid order information";
    return { success: false, error: firstIssue };
  }

  const data = parsed.data;

  // Validate address when delivery is selected
  if (data.deliveryMethod === "DELIVERY") {
    if (!data.address || data.address.trim().length < 5) {
      return { success: false, error: "Please enter your full delivery street address" };
    }
    if (!data.city || data.city.trim().length < 2) {
      return { success: false, error: "Please enter your city/town" };
    }
  }

  // Validate collection payment method
  if (data.deliveryMethod === "COLLECTION" && data.paymentMethod === "COD") {
    data.paymentMethod = "PAY_ON_COLLECTION";
  }

  try {
    const settings = await getSettings();

    // Fetch and lock/verify all products in items
    const productIds = data.items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (dbProducts.length !== productIds.length) {
      return {
        success: false,
        error: "One or more items in your cart are no longer available. Please review your cart.",
      };
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Check stock and compute subtotal using verified DB prices
    let subtotal = 0;
    const orderItemsToCreate: {
      productId: number;
      name: string;
      image: string;
      price: number;
      quantity: number;
      size: string;
      color: string;
    }[] = [];

    for (const item of data.items) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        return { success: false, error: `Product ID ${item.productId} was not found.` };
      }

      if (prod.stock < item.quantity) {
        return {
          success: false,
          error: `Sorry, "${prod.name}" only has ${prod.stock} items left in stock. Please reduce your quantity.`,
        };
      }

      const itemPrice = effectivePrice(prod);
      subtotal += itemPrice * item.quantity;

      let primaryImage = "/images/placeholder.svg";
      try {
        const imgs = JSON.parse(prod.images);
        if (Array.isArray(imgs) && imgs.length > 0) primaryImage = imgs[0];
      } catch {
        /* fallback */
      }

      orderItemsToCreate.push({
        productId: prod.id,
        name: prod.name,
        image: primaryImage,
        price: itemPrice,
        quantity: item.quantity,
        size: item.size || "",
        color: item.color || "",
      });
    }

    // Calculate delivery fee
    let deliveryFee = 0;
    if (data.deliveryMethod === "DELIVERY") {
      if (settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold) {
        deliveryFee = 0;
      } else {
        deliveryFee = settings.deliveryFee;
      }
    }

    const total = subtotal + deliveryFee;

    // Generate unique order number (e.g. GAO-94821)
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `GAO-${randomSuffix}`;

    // Execute in a database transaction: create order and decrement stock
    const order = await prisma.$transaction(async (tx) => {
      // Create the order with its items
      const created = await tx.order.create({
        data: {
          orderNumber,
          customerName: data.customerName.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          address: data.deliveryMethod === "DELIVERY" ? data.address?.trim() || "" : "",
          city: data.deliveryMethod === "DELIVERY" ? data.city?.trim() || "" : "",
          postalCode: data.deliveryMethod === "DELIVERY" ? data.postalCode?.trim() || "" : "",
          deliveryMethod: data.deliveryMethod,
          paymentMethod: data.paymentMethod,
          status: "PENDING",
          paymentStatus: "UNPAID",
          subtotal,
          deliveryFee,
          total,
          notes: data.notes?.trim() || "",
          items: {
            create: orderItemsToCreate,
          },
        },
      });

      // Decrement stock for each product
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return created;
    });

    return { success: true, orderNumber: order.orderNumber };
  } catch (error) {
    console.error("Failed to place order:", error);
    return {
      success: false,
      error: "An unexpected error occurred while placing your order. Please try again.",
    };
  }
}
