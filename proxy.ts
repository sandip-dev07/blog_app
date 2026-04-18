import { NextRequest, NextResponse } from "next/server";

import { getXmdxAdminUser } from "@/lib/xmdx-admin";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const adminUser = await getXmdxAdminUser(request.headers);

  if (pathname === "/xmdx/login") {
    if (!adminUser) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/xmdx/blogs", request.url));
  }

  if (!adminUser) {
    return NextResponse.redirect(new URL("/xmdx/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/xmdx/login", "/xmdx/editor/:path*", "/xmdx/blogs/:path*"],
};
