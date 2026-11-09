import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // When visiting /admin on the storefront port (3000), redirect to the standalone Admin Panel on port 3001
  if (pathname.startsWith("/admin")) {
    const adminPath = pathname.replace(/^\/admin/, "") || "/";
    const adminUrl = new URL(adminPath, "http://localhost:3001");
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/admin/:path*"],
};
