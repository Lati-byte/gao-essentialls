/* eslint-disable no-console */
/**
 * Seeds Gao Essentialls with store settings, default admin account,
 * and base product categories (NO mock products or mock orders).
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

function img(name: string): string {
  const dir = path.join(process.cwd(), "public", "images");
  for (const ext of ["webp", "jpg", "jpeg", "png", "svg"]) {
    if (fs.existsSync(path.join(dir, `${name}.${ext}`))) return `/images/${name}.${ext}`;
  }
  return "/images/placeholder.svg";
}

const baseCategories = [
  { name: "Clothes", slug: "clothes", description: "Everyday fashion for men and women – tees, hoodies, jackets and dresses." },
  { name: "Shoes", slug: "shoes", description: "Sneakers, loafers and slides for the whole family." },
  { name: "Electric Appliances", slug: "electric-appliances", description: "Kettles, toasters, blenders, irons and more to make home life easier." },
  { name: "Pots", slug: "pots", description: "Quality cookware – stainless steel sets, casseroles, potjies and pressure cookers." },
  { name: "Air Fryers", slug: "air-fryers", description: "Healthy crispy meals in minutes – compact, family and dual-basket air fryers." },
  { name: "Blankets", slug: "blankets", description: "Plush mink, sherpa fleece and knitted throw blankets for every room." },
  { name: "Soccer Jerseys", slug: "soccer-jerseys", description: "Supporter kits and retro classics for match day and training." },
  { name: "Caps", slug: "caps", description: "Everyday baseball, trucker and snapback caps." },
  { name: "Hats", slug: "hats", description: "Sun hats, bucket hats, beanies and fedoras for every season." },
  { name: "Ladies Bags", slug: "ladies-bags", description: "Totes, crossbody bags, backpacks and evening clutches." },
];

async function main() {
  console.log("Ensuring store settings exist…");
  const existingSettings = await prisma.setting.findFirst();
  if (!existingSettings) {
    await prisma.setting.create({
      data: {
        storeName: "Gao Essentialls",
        currencySymbol: "R",
        deliveryFee: 99,
        freeDeliveryThreshold: 1000,
        announcement: "Free delivery on orders over R1,000 • Cash on delivery available",
        phone: "+27 71 234 5678",
        email: "hello@gaoessentialls.co.za",
        whatsapp: "+27 71 234 5678",
        address: "123 Main Road, Johannesburg, 2001",
        bankName: "FNB",
        accountName: "Gao Essentialls (Pty) Ltd",
        accountNumber: "62000000000",
        branchCode: "250655",
      },
    });
  }

  console.log("Ensuring default admin account exists…");
  const adminCount = await prisma.adminUser.count();
  if (adminCount === 0) {
    await prisma.adminUser.create({
      data: {
        email: "admin@gaoessentialls.co.za",
        name: "Store Admin",
        passwordHash: await bcrypt.hash("Admin@123", 10),
      },
    });
  }

  console.log("Ensuring base categories exist…");
  for (const [index, cat] of baseCategories.entries()) {
    const existingCat = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existingCat) {
      const categoryImage = fs.existsSync(
        path.join(process.cwd(), "public", "images", "categories", `${cat.slug}.jpg`)
      )
        ? `/images/categories/${cat.slug}.jpg`
        : img(cat.slug);

      await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: categoryImage,
          sortOrder: index,
        },
      });
    }
  }

  const counts = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    orders: await prisma.order.count(),
  };
  console.log("Production seed check complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
