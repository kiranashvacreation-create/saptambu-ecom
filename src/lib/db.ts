import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

let prisma: PrismaClient | null = null;

function validDatabaseUrl(value: string | undefined) {
  if (!value) return null;
  if (value.includes("USER:PASSWORD@HOST:PORT")) return null;

  try {
    const url = new URL(value);
    return url.protocol === "postgresql:" || url.protocol === "postgres:" ? value : null;
  } catch {
    return null;
  }
}

export function getDb() {
  const connectionString = validDatabaseUrl(process.env.DATABASE_URL);

  if (!connectionString) {
    return null;
  }

  if (!prisma) {
    const adapter = new PrismaPg({ connectionString });
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
}

export function requireDb() {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return db;
}
