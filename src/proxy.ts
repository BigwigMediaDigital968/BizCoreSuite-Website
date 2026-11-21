import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "./utils/adminSession";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

/**
 * Gate the admin panel and its APIs.
 *  - /admin/*                -> redirect to /admin/login when not signed in
 *  - POST /api/lead          -> public (landing-page demo form)
 *  - GET  /api/blog[/...]    -> public (route itself only returns published posts to visitors)
 *  - POST /api/upload        -> admin only (Cloudinary image uploads)
 *  - everything else under /api/lead, /api/blog, /api/admin/stats -> 401 unless signed in
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname.startsWith("/api/lead")) {
    const isPublicSubmit = pathname === "/api/lead" && request.method === "POST";
    return isPublicSubmit || authed ? NextResponse.next() : unauthorized();
  }

  if (pathname.startsWith("/api/blog")) {
    return request.method === "GET" || authed ? NextResponse.next() : unauthorized();
  }

  if (pathname.startsWith("/api/upload")) {
    return authed ? NextResponse.next() : unauthorized();
  }

  if (pathname.startsWith("/api/admin/stats")) {
    return authed ? NextResponse.next() : unauthorized();
  }

  const isLogin = pathname === "/admin/login";
  if (!authed && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (authed && isLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/lead",
    "/api/lead/:path*",
    "/api/blog",
    "/api/blog/:path*",
    "/api/admin/stats",
    "/api/upload",
  ],
};
