import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * App-only image (NEXT_PUBLIC_INCLUDE_MODUL != "true"):
 *   - / and /modul/* are redirected straight to /aplikasi
 *
 * Full image (NEXT_PUBLIC_INCLUDE_MODUL = "true"):
 *   - all routes pass through normally
 */
export function middleware(request: NextRequest) {
  const includeModul = process.env.NEXT_PUBLIC_INCLUDE_MODUL === "true";

  if (!includeModul) {
    const { pathname } = request.nextUrl;

    // Redirect home and all modul routes to /aplikasi
    if (pathname === "/" || pathname.startsWith("/modul")) {
      return NextResponse.redirect(new URL("/aplikasi", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on root and all modul paths
  matcher: ["/", "/modul/:path*"],
};
