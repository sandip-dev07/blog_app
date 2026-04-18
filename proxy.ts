import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (pathname === "/xmdx/login" && session) {
    return NextResponse.redirect(new URL("/xmdx/blogs", request.url));
  }

  if (!session) {
    return NextResponse.redirect(new URL("/xmdx/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/xmdx/login", "/xmdx/editor/:path*", "/xmdx/blogs/:path*"],
};
