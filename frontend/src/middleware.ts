import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * When the image is built with NEXT_PUBLIC_INCLUDE_MODUL=false (the default
 * "app-only" image), all /modul routes return 404 so the learning module is
 * inaccessible.  Set NEXT_PUBLIC_INCLUDE_MODUL=true to enable them (the
 * "full" image).
 */
export function middleware(request: NextRequest) {
  const includeModul = process.env.NEXT_PUBLIC_INCLUDE_MODUL === "true";

  if (!includeModul && request.nextUrl.pathname.startsWith("/modul")) {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/modul/:path*"],
};
