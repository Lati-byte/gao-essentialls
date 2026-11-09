"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export type LoginResult = { error?: string };

export async function loginAdmin(
  prevState: LoginResult | undefined,
  formData: FormData
): Promise<LoginResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  try {
    const user = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Invalid email or password." };
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return { error: "Invalid email or password." };
    }

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return { error: "An error occurred during login. Please try again." };
  }

  redirect("/");
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
