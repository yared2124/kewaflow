import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  MFA_PENDING_COOKIE_NAME,
  verifyTokenAsync,
  type SessionPayload,
  type MfaPendingPayload,
} from "@/lib/auth/token";

// Routes that require full MFA-verified authentication (SEC-001)
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/approvals",
  "/content",
  "/leads",
  "/calendar",
  "/brand",
  "/analytics",
  "/audit",
  "/media",
  "/settings",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass static files and Next.js internal paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const mfaCookie = request.cookies.get(MFA_PENDING_COOKIE_NAME)?.value;

  const validSession = sessionCookie
    ? await verifyTokenAsync<SessionPayload>(sessionCookie)
    : null;
  const validMfaPending = mfaCookie
    ? await verifyTokenAsync<MfaPendingPayload>(mfaCookie)
    : null;

  const isAuthenticated = Boolean(validSession?.mfaVerified);
  const isMfaPending = Boolean(validMfaPending);

  // If user is at root "/"
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is already authenticated and visits /login or /mfa
  if (pathname === "/login" || pathname === "/mfa") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // If user is visiting /mfa without a pending MFA session
    if (pathname === "/mfa" && !isMfaPending) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedRoute) {
    if (!isAuthenticated) {
      if (isMfaPending) {
        return NextResponse.redirect(new URL("/mfa", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
