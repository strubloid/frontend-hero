import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Protected routes — redirect to login if unauthenticated
  if (
    pathname.startsWith("/play") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/boss-encounter") ||
    pathname.startsWith("/world-map")
  ) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Auth pages — redirect to /play if already logged in
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (token) {
      return NextResponse.redirect(new URL("/play", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/play/:path*",
    "/profile/:path*",
    "/boss-encounter/:path*",
    "/world-map/:path*",
    "/login",
    "/register",
  ],
};
