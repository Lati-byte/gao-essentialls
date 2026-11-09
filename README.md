# Gao Essentialls – Modern E-Commerce Platform & Admin Dashboard

A contemporary South African luxury e-commerce platform built for high performance, reliability, and seamless management. Designed with a minimalist, content-first aesthetic inspired by Apple, Aesop, and COS.

---

## 🌟 Architecture Overview

This monorepo contains two independent Next.js 16 applications sharing a unified PostgreSQL database:

1. **`gao-essentialls/` (Customer Storefront)**
   - Next.js 16 (App Router) + Turbopack + Tailwind CSS v4
   - 7 curated categories (Clothes, Shoes, Electric Appliances, Pots, Air Fryers, Bedding, Luggage & Bags)
   - 41 real product assets in South African Rands (ZAR `R`)
   - Contemporary DTC luxury storefront (Slide-out cart drawer, dynamic filters, live order tracking)
   - Checkout flows: Cash on Delivery (COD), Direct Bank Transfer (EFT), Store Collection
   - Custom dynamic image streaming route handler (`/uploads/[...file]`)

2. **`gao-essentialls-admin/` (Management Console)**
   - Standalone administrative control panel
   - Real-time inventory & stock tracking
   - Product catalog management with real photo uploads
   - Order processing workflow (`PENDING` → `CONFIRMED` → `SHIPPED` → `DELIVERED` → `CANCELLED`)
   - Store settings, banking details & delivery fees configuration

---

## 🚀 Deployment Guide on Render (`render.com`)

### 1. Database Setup (Render PostgreSQL)
1. On your Render dashboard, click **New +** → **PostgreSQL**.
2. **Name**: `gao-db`
3. **Plan**: Free (or Starter for production)
4. Once provisioned, copy the **Internal Database URL** (for services inside Render) or **External Database URL**.

### 2. Storefront Web Service (`gao-essentialls`)
1. Click **New +** → **Web Service** → Connect your GitHub repository (`Lati-byte/gao-essentialls`).
2. **Name**: `gao-essentialls`
3. **Root Directory**: `gao-essentialls`
4. **Environment**: `Node`
5. **Build Command**:
   ```bash
   npm install && npx prisma db push && npm run build
   ```
6. **Start Command**:
   ```bash
   npm run start
   ```
7. **Environment Variables**:
   - `DATABASE_URL`: *(Your Render PostgreSQL connection string)*
   - `AUTH_SECRET`: *(A secure 32+ character random string)*
   - `NODE_ENV`: `production`

### 3. Database Seeding (First-Time Only)
After the storefront is deployed and the database schema is pushed, run the seed script to populate initial categories, products, and default admin:
- In Render Dashboard → `gao-essentialls` → **Shell** tab:
  ```bash
  npm run db:seed
  ```
  *(Default admin: `admin@gaoessentialls.co.za` / `Admin@12345`)*

### 4. Admin Web Service (`gao-essentialls-admin`)
1. Click **New +** → **Web Service** → Connect the same repository.
2. **Name**: `gao-essentialls-admin`
3. **Root Directory**: `gao-essentialls-admin`
4. **Environment**: `Node`
5. **Build Command**:
   ```bash
   npm install && npm run build
   ```
6. **Start Command**:
   ```bash
   npm run start
   ```
7. **Environment Variables**:
   - `DATABASE_URL`: *(Same PostgreSQL connection string as storefront)*
   - `AUTH_SECRET`: *(Same AUTH_SECRET)*
   - `NODE_ENV`: `production`
   - `NEXT_PUBLIC_STORE_URL`: `https://gaoessentialls.co.za`

---

## 🌐 Cloudflare DNS Configuration

Log in to **Cloudflare Dashboard** → `gaoessentialls.co.za` → **DNS** → **Records**:

| Type | Name | Target / Content | Proxy status |
|---|---|---|---|
| **CNAME** | `@` (root) | `gao-essentialls.onrender.com` | Proxied (Orange Cloud) |
| **CNAME** | `www` | `gao-essentialls.onrender.com` | Proxied (Orange Cloud) |
| **CNAME** | `admin` | `gao-essentialls-admin.onrender.com` | Proxied (Orange Cloud) |

In Cloudflare **SSL/TLS** settings, ensure encryption mode is set to **Full** or **Full (Strict)**.

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/Lati-byte/gao-essentialls.git
cd gao-essentialls

# Run storefront (Port 3000)
cd gao-essentialls
npm install
npm run dev

# Run admin dashboard in a separate terminal (Port 3001)
cd ../gao-essentialls-admin
npm install
npm run dev
```

---

## 🔒 Security & Best Practices
- Never commit `.env` files to git.
- Change the default admin password immediately upon first login on production.
- Cloudflare WAF, DDoS protection, and SSL are automatically active.
