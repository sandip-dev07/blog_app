"use server";

import { isConfiguredXmdxAdminEmail } from "@/lib/xmdx-admin";

export async function canUseXmdxPassword(email: string) {
  const adminEmail = process.env.AUTH_XMDX_EMAIL;

  if (!adminEmail) {
    return {
      allowed: false,
      configured: false,
    };
  }

  return {
    allowed: isConfiguredXmdxAdminEmail(email),
    configured: true,
  };
}
