import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("ai_startup_session")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Basic check for session token presence & JWT shape (header.payload.signature)
  const hasValidTokenShape = Boolean(token && token.split(".").length === 3);

  // 1. If user is authenticated and attempts to visit login or signup, redirect to /dashboard
  if (hasValidTokenShape && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. If user is NOT authenticated and attempts to visit dashboard, redirect to /login
  if (!hasValidTokenShape && isDashboardRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/dashboard", "/dashboard/:path*"],
};
