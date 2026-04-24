import crypto from "crypto";

import { resolveClientIp } from "@/lib/client-ip";
import { db } from "@/server/db";

function getIpHashSalt() {
  return (
    process.env.CLAP_IP_HASH_SALT?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    "blog-clap-salt"
  );
}

export function hashIpAddress(ipAddress: string) {
  return crypto
    .createHash("sha256")
    .update(`${getIpHashSalt()}:${ipAddress}`)
    .digest("hex");
}

export function getBlogClapIp(headers: Headers) {
  return resolveClientIp(headers);
}

export async function getBlogClapSummary(blogId: string, ipAddress?: string) {
  const clapCount = await db.blogClap.count({
    where: {
      blogId,
    },
  });

  if (!ipAddress) {
    return {
      clapCount,
      hasClapped: false,
    };
  }

  const existingClap = await db.blogClap.findUnique({
    where: {
      blogId_ipHash: {
        blogId,
        ipHash: hashIpAddress(ipAddress),
      },
    },
    select: {
      id: true,
    },
  });

  return {
    clapCount,
    hasClapped: Boolean(existingClap),
  };
}
