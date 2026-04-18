import { headers as nextHeaders } from "next/headers";

import { auth } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma/enums";
import { db } from "@/server/db";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isConfiguredXmdxAdminEmail(email: string) {
  const adminEmail = process.env.AUTH_XMDX_EMAIL;

  return Boolean(adminEmail && normalizeEmail(email) === normalizeEmail(adminEmail));
}

export async function getXmdxSession(requestHeaders?: Headers) {
  return auth.api.getSession({
    headers: requestHeaders ?? (await nextHeaders()),
  });
}

export async function getXmdxAdminUser(requestHeaders?: Headers) {
  const session = await getXmdxSession(requestHeaders);

  if (!session) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return null;
  }

  if (user.role === UserRole.ADMIN || isConfiguredXmdxAdminEmail(user.email)) {
    return user;
  }

  return null;
}

export async function requireXmdxAdminUser() {
  const user = await getXmdxAdminUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
