import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, images, and public uploads
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/login";
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(sessionCookie);

  // If unauthenticated and not on /login, redirect to /login
  if (!session && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and on /login, redirect to dashboard root /
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
