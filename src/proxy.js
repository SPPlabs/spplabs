import { NextResponse } from "next/server";

export async function proxy(request) {
  const url = request.nextUrl;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0]; // e.g. spplabs.es or api.spplabs.es or localhost

  const isApiDomain = hostname.startsWith("api.spplabs.es") || hostname === "api.localhost";
  const isDashboardDomain = hostname === "spplabs.es" || hostname === "www.spplabs.es" || hostname === "spplabs.localhost";

  const path = url.pathname;

  // 1. API Domain Enforcements (e.g. api.spplabs.es)
  if (isApiDomain) {
    // Only permit POST requests to /contacts, /bookings, or other public API paths
    if (path === "/contacts" || path === "/bookings") {
      return NextResponse.next();
    }
    
    // Return 404 for all other paths on the API domain
    return new NextResponse(
      JSON.stringify({ error: "Not Found", message: "API endpoint does not exist." }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 2. Dashboard Domain Enforcements (e.g. spplabs.es)
  if (isDashboardDomain) {
    // Blocks external POST requests to /contacts and /bookings directly on dashboard domain
    if (path === "/contacts" || path === "/bookings") {
      return new NextResponse(
        JSON.stringify({
          error: "Forbidden",
          message: "API requests must be sent to api.spplabs.es",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // 3. Dashboard Authentication Guard
  if (path.startsWith("/dashboard")) {
    const sessionCookie = request.cookies.get("spp_session")?.value;
    
    if (!sessionCookie) {
      // Not logged in: redirect to login page
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Prevent access to login/signup pages if already logged in
  if (path === "/login" || path === "/signup") {
    const sessionCookie = request.cookies.get("spp_session")?.value;
    if (sessionCookie) {
      // Already logged in: redirect to dashboard
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
