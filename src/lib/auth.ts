import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";

export async function getSession(): Promise<Session | null> {
  return await getServerSession(authConfig);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}
