import { NextRequest, NextResponse } from "next/server";

import { BLOG_CLIENT_IP_HEADER, getForwardedClientIp } from "@/lib/client-ip";
import { getXmdxAdminUser } from "@/lib/xmdx-admin";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  const clientIp = getForwardedClientIp(request.headers);

  if (clientIp) {
    requestHeaders.set(BLOG_CLIENT_IP_HEADER, clientIp);
  }

  if (pathname.startsWith("/api/blogs/")) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const adminUser = await getXmdxAdminUser(requestHeaders);

  if (pathname === "/xmdx/login") {
    if (!adminUser) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.redirect(new URL("/xmdx/blogs", request.url));
  }

  if (!adminUser) {
    return NextResponse.redirect(new URL("/xmdx/login", request.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/api/blogs/:path*",
    "/xmdx/login",
    "/xmdx/editor/:path*",
    "/xmdx/blogs/:path*",
  ],
};
