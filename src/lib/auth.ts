import "server-only";

import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getDb, requireDb } from "@/lib/db";

const COOKIE_NAME = "saptambu_admin";

function authSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET || "dev-admin-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function createPasswordHash(password: string) {
  return hash(password, 12);
}

export async function verifyAdmin(email: string, password: string) {
  const db = getDb();
  if (!db) return null;

  const admin = await db.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!admin) return null;

  const ok = await compare(password, admin.passwordHash);
  return ok ? admin : null;
}

export async function setAdminSession(adminId: string) {
  const payload = Buffer.from(
    JSON.stringify({ adminId, exp: Date.now() + 1000 * 60 * 60 * 12 }),
  ).toString("base64url");
  const token = `${payload}.${sign(payload)}`;

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getAdmin() {
  const db = getDb();
  if (!db) return null;

  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      adminId: string;
      exp: number;
    };

    if (!parsed.adminId || parsed.exp < Date.now()) return null;
    return db.adminUser.findUnique({ where: { id: parsed.adminId } });
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function ensureSeedAdmin() {
  const db = requireDb();
  const email = (process.env.ADMIN_EMAIL || "admin@saptambu.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const existing = await db.adminUser.findUnique({ where: { email } });

  if (existing) return existing;

  return db.adminUser.create({
    data: {
      email,
      passwordHash: await createPasswordHash(password),
    },
  });
}
