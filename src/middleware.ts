import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ==========================================
 * MIDDLEWARE KEAMANAN (Route Guard)
 * ==========================================
 * - / , /login, /register → publik (semua bisa akses)
 * - /dashboard → hanya admin
 * - lainnya → publik
 * ==========================================
 */

const RUTE_PUBLIK = ["/", "/login", "/register"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userRole = request.cookies.get("userRole")?.value || null;

  // Rute publik → bebas akses
  if (RUTE_PUBLIK.includes(pathname)) {
    return NextResponse.next();
  }

  // /dashboard → hanya admin
  if (pathname.startsWith("/dashboard")) {
    if (!userRole || userRole !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
