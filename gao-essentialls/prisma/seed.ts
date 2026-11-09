/* eslint-disable no-console */
/**
 * Seeds Gao Essentialls with categories, mock products, sample orders,
 * a default admin user and store settings.
 *
 * Run with: npm run db:seed   (WARNING: wipes existing data)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

/** Find /images/<name>.<ext> for whichever extension exists. */
function img(name: string): string {
  const dir = path.join(process.cwd(), "public", "images");
  for (const ext of ["webp", "jpg", "jpeg", "png", "svg"]) {
    if (fs.existsSync(path.join(dir, `${name}.${ext}`))) return `/images/${name}.${ext}`;
  }
  return "/images/placeholder.svg";
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type MockProduct = {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
};

type MockCategory = {
  name: string;
  slug: string;
  description: string;
  products: MockProduct[];
};

const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["4", "5", "6", "7", "8", "9", "10", "11"];

const catalogue: MockCategory[] = [
  {
    name: "Clothes",
    slug: "clothes",
    description: "Everyday fashion for men and women – tees, hoodies, jackets and dresses.",
    products: [
      { name: "Classic Cotton Crew T-Shirt", description: "Soft 100% cotton crew-neck tee with a relaxed fit. Breathable, durable and perfect for everyday wear.", price: 199, salePrice: 149, stock: 60, sizes: CLOTHING_SIZES, colors: ["White", "Black", "Navy", "Olive"], featured: true },
      { name: "Slim Fit Denim Jacket", description: "Timeless mid-wash denim jacket with button front, chest pockets and a slim modern cut.", price: 699, stock: 18, sizes: CLOTHING_SIZES, colors: ["Mid Blue", "Black"] },
      { name: "Everyday Fleece Hoodie", description: "Warm brushed-fleece hoodie with kangaroo pocket and adjustable drawstring hood.", price: 449, stock: 35, sizes: CLOTHING_SIZES, colors: ["Grey", "Black", "Maroon"] },
      { name: "Ladies Floral Summer Dress", description: "Light and flowy midi dress with a flattering waist tie and vibrant floral print.", price: 399, salePrice: 329, stock: 4, sizes: ["XS", "S", "M", "L", "XL"], colors: ["Blue Floral", "Pink Floral"] },
    ],
  },
  {
    name: "Shoes",
    slug: "shoes",
    description: "Sneakers, loafers and slides for the whole family.",
    products: [
      { name: "Urban Runner Sneakers", description: "Lightweight knit sneakers with cushioned sole for all-day comfort on the go.", price: 899, salePrice: 749, stock: 25, sizes: SHOE_SIZES, colors: ["White/Grey", "Black"], featured: true },
      { name: "Classic Leather Loafers", description: "Genuine leather slip-on loafers with a padded insole – smart and comfortable.", price: 1099, stock: 12, sizes: SHOE_SIZES, colors: ["Brown", "Black"] },
      { name: "Kids Velcro Sneakers", description: "Easy on, easy off velcro sneakers with grippy rubber soles for active kids.", price: 399, stock: 30, sizes: ["10", "11", "12", "13", "1", "2"], colors: ["Blue", "Pink"] },
      { name: "Comfort Pool Slides", description: "Soft moulded slides with a contoured footbed – ideal for the pool, beach or home.", price: 249, stock: 0, sizes: SHOE_SIZES, colors: ["Black", "Navy"] },
    ],
  },
  {
    name: "Electric Appliances",
    slug: "electric-appliances",
    description: "Kettles, toasters, blenders, irons and more to make home life easier.",
    products: [
      { name: "1.7L Cordless Electric Kettle", description: "Fast-boil 2200W stainless steel kettle with 360° swivel base and auto shut-off.", price: 349, stock: 40, featured: true },
      { name: "2-Slice Stainless Steel Toaster", description: "Wide slots, 7 browning levels, defrost and reheat functions with removable crumb tray.", price: 399, salePrice: 329, stock: 22 },
      { name: "600W Countertop Blender", description: "1.5L glass jug blender with 4 speeds and pulse – perfect for smoothies and soups.", price: 699, stock: 15 },
      { name: "2200W Steam Iron", description: "Non-stick soleplate, vertical steam and self-clean function for crisp, wrinkle-free clothes.", price: 449, stock: 3 },
      { name: "20L Microwave Oven", description: "700W microwave with 5 power levels, defrost setting and easy-clean interior.", price: 1499, stock: 9 },
    ],
  },
  {
    name: "Pots",
    slug: "pots",
    description: "Quality cookware – stainless steel sets, casseroles, potjies and pressure cookers.",
    products: [
      { name: "5-Piece Stainless Steel Pot Set", description: "Encapsulated base pots with glass lids, suitable for all hob types including induction.", price: 1299, salePrice: 999, stock: 14, featured: true },
      { name: "Non-Stick Casserole Pot 24cm", description: "Durable non-stick coating with cool-touch handles and a tempered glass lid.", price: 549, stock: 20 },
      { name: "Cast Iron Potjie Pot No. 3", description: "Traditional three-legged cast iron potjie – perfect for slow cooking over the fire.", price: 899, stock: 8 },
      { name: "6L Stovetop Pressure Cooker", description: "Cook stews, beans and tough cuts in a fraction of the time. Multiple safety valves.", price: 999, stock: 11 },
    ],
  },
  {
    name: "Air Fryers",
    slug: "air-fryers",
    description: "Healthier, crispy cooking with little to no oil.",
    products: [
      { name: "Digital Air Fryer 5.5L", description: "1700W air fryer with touch screen, 8 presets and a non-stick dishwasher-safe basket.", price: 1299, salePrice: 1099, stock: 25, featured: true },
      { name: "Compact Air Fryer 3.5L", description: "Space-saving air fryer with manual dials – ideal for singles and couples.", price: 799, stock: 30 },
      { name: "Dual Basket Air Fryer 9L", description: "Two independent baskets so you can cook mains and sides at the same time.", price: 2199, stock: 6, featured: true },
      { name: "12L Air Fryer Oven", description: "Air fry, bake, roast and dehydrate with rotisserie spit and 3 cooking racks.", price: 1899, stock: 2 },
    ],
  },
  {
    name: "Ladies Bags",
    slug: "ladies-bags",
    description: "Handbags, totes, crossbody bags and clutches for every occasion.",
    products: [
      { name: "Structured Leather Tote Bag", description: "Spacious vegan-leather tote with zip closure, inner pockets and sturdy handles.", price: 799, salePrice: 649, stock: 16, colors: ["Tan", "Black", "Burgundy"], featured: true },
      { name: "Crossbody Sling Bag", description: "Compact crossbody with adjustable strap – keeps essentials close and hands free.", price: 449, stock: 24, colors: ["Black", "Beige"] },
      { name: "Satin Evening Clutch", description: "Elegant clutch with detachable chain strap – the perfect finish for evening wear.", price: 349, stock: 10, colors: ["Gold", "Silver", "Black"] },
      { name: "Mini Fashion Backpack", description: "Chic mini backpack with front zip pocket and adjustable straps.", price: 549, stock: 13, colors: ["Blush", "Black"] },
    ],
  },
  {
    name: "Hats",
    slug: "hats",
    description: "Sun hats, fedoras, bucket hats and beanies.",
    products: [
      { name: "Wide Brim Sun Hat", description: "Woven straw-look sun hat with a wide brim for stylish sun protection.", price: 299, stock: 20, colors: ["Natural", "Black"], featured: true },
      { name: "Classic Felt Fedora", description: "Timeless fedora with a grosgrain band – adds instant polish to any outfit.", price: 399, stock: 9, sizes: ["S/M", "L/XL"], colors: ["Camel", "Charcoal"] },
      { name: "Cotton Bucket Hat", description: "Lightweight cotton twill bucket hat – packable and perfect for weekends.", price: 199, stock: 28, colors: ["Khaki", "Black", "White"] },
      { name: "Knitted Winter Beanie", description: "Chunky ribbed knit beanie to keep you warm through chilly winter days.", price: 149, stock: 50, colors: ["Grey", "Black", "Mustard"] },
    ],
  },
  {
    name: "Caps",
    slug: "caps",
    description: "Baseball caps, snapbacks and trucker caps.",
    products: [
      { name: "Classic Baseball Cap", description: "Six-panel cotton cap with curved peak and adjustable strap.", price: 179, stock: 45, colors: ["Black", "Navy", "Red", "White"], featured: true },
      { name: "Flat Peak Snapback Cap", description: "Structured snapback with flat peak and classic plastic snap closure.", price: 249, stock: 22, colors: ["Black", "Olive"] },
      { name: "Trucker Mesh Cap", description: "Breathable mesh-back trucker cap with foam front panel.", price: 199, stock: 18, colors: ["White/Black", "Blue/White"] },
      { name: "Kids Adjustable Cap", description: "Fun, colourful cap sized for little heads with a soft adjustable strap.", price: 129, stock: 4, colors: ["Yellow", "Blue", "Pink"] },
    ],
  },
  {
    name: "Soccer Jerseys",
    slug: "soccer-jerseys",
    description: "Supporter jerseys for match day – adults and kids.",
    products: [
      { name: "Home Supporter Jersey – Gold & Green", description: "Breathable quick-dry supporter jersey in classic gold and green. Show your colours on match day!", price: 699, salePrice: 599, stock: 40, sizes: CLOTHING_SIZES, featured: true },
      { name: "Away Supporter Jersey – White", description: "Lightweight away jersey with moisture-wicking fabric and ribbed collar.", price: 699, stock: 26, sizes: CLOTHING_SIZES },
      { name: "Kids Replica Jersey", description: "Comfortable supporter jersey made for young fans.", price: 449, stock: 19, sizes: ["4-5Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y"] },
      { name: "Retro Classic Jersey", description: "Throwback-style jersey with vintage collar – a must-have for collectors.", price: 549, stock: 7, sizes: CLOTHING_SIZES },
    ],
  },
  {
    name: "Blankets",
    slug: "blankets",
    description: "Cosy mink, fleece and knitted blankets for cold nights.",
    products: [
      { name: "Queen Size Mink Blanket", description: "Ultra-soft, heavyweight double-ply mink blanket – a winter favourite.", price: 699, salePrice: 549, stock: 30, colors: ["Grey", "Burgundy", "Brown"], featured: true },
      { name: "Sherpa Fleece Throw", description: "Plush fleece on one side, cosy sherpa on the other. Perfect for the couch.", price: 399, stock: 21, colors: ["Cream", "Charcoal"] },
      { name: "Chunky Knitted Throw", description: "Hand-feel cable knit throw that adds texture and warmth to any room.", price: 499, stock: 12, colors: ["Ivory", "Sage"] },
      { name: "Baby Fleece Blanket", description: "Gentle, lightweight fleece blanket for babies – machine washable.", price: 249, stock: 25, colors: ["Mint", "Pink", "Blue"] },
    ],
  },
];

/** Deterministic pseudo-random so seeding gives the same demo data each time. */
let seed = 42;
function rand() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

const FIRST = ["Thabo", "Lerato", "Sipho", "Naledi", "Kagiso", "Ayanda", "Mpho", "Zanele", "Bongani", "Palesa", "Tumelo", "Nomsa"];
const LAST = ["Mokoena", "Dlamini", "Nkosi", "Khumalo", "Molefe", "Ndlovu", "Mahlangu", "Sithole"];
const CITIES = ["Johannesburg", "Pretoria", "Durban", "Cape Town", "Polokwane", "Bloemfontein"];

async function main() {
  console.log("Clearing existing data…");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.setting.deleteMany();

  console.log("Creating settings and admin user…");
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

  await prisma.adminUser.create({
    data: {
      email: "admin@gaoessentialls.co.za",
      name: "Store Admin",
      passwordHash: await bcrypt.hash("Admin@123", 10),
    },
  });

  console.log("Creating categories and products…");
  const createdProducts: { id: string; name: string; price: number; image: string; sizes: string[]; colors: string[] }[] = [];
  let skuCounter = 1000;

  for (const [index, cat] of catalogue.entries()) {
    const categoryImage = fs.existsSync(path.join(process.cwd(), "public", "images", "categories", `${cat.slug}.jpg`))
      ? `/images/categories/${cat.slug}.jpg`
      : img(cat.slug);

    const category = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug, description: cat.description, image: categoryImage, sortOrder: index },
    });

    for (const p of cat.products) {
      skuCounter += 1;
      const prodSlug = slugify(p.name);
      const prodImage = fs.existsSync(path.join(process.cwd(), "public", "images", "products", `${prodSlug}.jpg`))
        ? `/images/products/${prodSlug}.jpg`
        : categoryImage;

      const product = await prisma.product.create({
        data: {
          name: p.name,
          slug: prodSlug,
          description: p.description,
          price: p.price,
          salePrice: p.salePrice ?? null,
          stock: p.stock,
          sku: `GAO-${skuCounter}`,
          images: JSON.stringify([prodImage]),
          sizes: JSON.stringify(p.sizes ?? []),
          colors: JSON.stringify(p.colors ?? []),
          isFeatured: p.featured ?? false,
          categoryId: category.id,
        },
      });
      createdProducts.push({
        id: product.id,
        name: product.name,
        price: p.salePrice ?? p.price,
        image: prodImage,
        sizes: p.sizes ?? [],
        colors: p.colors ?? [],
      });
    }
  }

  console.log("Creating sample orders…");
  const statuses = ["DELIVERED", "DELIVERED", "DELIVERED", "SHIPPED", "CONFIRMED", "PENDING", "PENDING", "CANCELLED"];
  const now = Date.now();
  for (let i = 0; i < 32; i++) {
    const daysAgo = Math.floor(rand() * 30);
    const createdAt = new Date(now - daysAgo * 86_400_000 - Math.floor(rand() * 86_400_000));
    const first = pick(FIRST);
    const last = pick(LAST);
    const itemCount = 1 + Math.floor(rand() * 3);
    const items = Array.from({ length: itemCount }, () => {
      const p = pick(createdProducts);
      return {
        productId: p.id,
        name: p.name,
        image: p.image,
        price: p.price,
        quantity: 1 + Math.floor(rand() * 2),
        size: p.sizes.length ? pick(p.sizes) : "",
        color: p.colors.length ? pick(p.colors) : "",
      };
    });
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const delivery = rand() > 0.2 ? "DELIVERY" : "COLLECTION";
    const deliveryFee = delivery === "COLLECTION" || subtotal >= 1000 ? 0 : 99;
    const status = daysAgo < 2 ? "PENDING" : pick(statuses);
    const paymentMethod = delivery === "COLLECTION" ? "PAY_ON_COLLECTION" : pick(["COD", "EFT"]);

    await prisma.order.create({
      data: {
        orderNumber: `GAO-${(100000 + i * 7919).toString().slice(-6)}`,
        customerName: `${first} ${last}`,
        email: `${first}.${last}`.toLowerCase() + "@example.com",
        phone: `+27 7${Math.floor(rand() * 10)} ${100 + Math.floor(rand() * 900)} ${1000 + Math.floor(rand() * 9000)}`,
        address: delivery === "DELIVERY" ? `${10 + Math.floor(rand() * 200)} ${pick(["Oak", "Church", "Market", "Main", "Long"])} Street` : "",
        city: delivery === "DELIVERY" ? pick(CITIES) : "",
        postalCode: delivery === "DELIVERY" ? `${1000 + Math.floor(rand() * 8000)}` : "",
        deliveryMethod: delivery,
        paymentMethod,
        status,
        paymentStatus: status === "DELIVERED" ? "PAID" : status === "CANCELLED" ? "UNPAID" : rand() > 0.5 ? "PAID" : "UNPAID",
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        createdAt,
        items: { create: items },
      },
    });
  }

  const counts = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    orders: await prisma.order.count(),
  };
  console.log("Seed complete:", counts);
  console.log("Admin login → admin@gaoessentialls.co.za / Admin@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
