/**
 * Stateless session token helpers (no next/headers import) so they can be
 * used from proxy.ts, route handlers and server components alike.
 */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "gao_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export type AdminSession = { id: string; email: string; name: string };

function getKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET env var is missing or too short (min 16 chars).");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(session: AdminSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey());
    if (typeof payload.id !== "string" || typeof payload.email !== "string") return null;
    return { id: String(payload.id), email: payload.email, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
