import path from "node:path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Absolute path to the shared sqlite database in gao-essentialls/prisma/dev.db
const defaultDbPath = path
  .resolve(process.cwd(), "..", "gao-essentialls", "prisma", "dev.db")
  .replace(/\\/g, "/");

const datasourceUrl =
  process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("..")
    ? process.env.DATABASE_URL
    : `file:${defaultDbPath}`;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: datasourceUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
