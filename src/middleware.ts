import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "next-firebase-auth-edge";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/claims";

import { authConfig } from "./server/auth/config";

const AUTH_PATHS = ["/login", "/auth/logout", "/forgot-password"];

const pathStartsWith = (pathname: string, prefixes: string[]) =>
  prefixes.some((prefix) => pathname.startsWith(prefix));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPath = pathStartsWith(pathname, AUTH_PATHS);

  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSerializeOptions: authConfig.cookieSerializeOptions,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    serviceAccount: authConfig.serviceAccount,
    enableCustomToken: true,
    checkRevoked: true,

    handleValidToken: async ({ decodedToken }, headers) => {
      // Un compte sans rôle n'a été créé ni par un admin ni par le script d'amorçage.
      const role = filterStandardClaims(decodedToken).role as string | undefined;
      if (!["admin", "user"].includes(role ?? "") && pathname !== "/unauthorized") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      // La connexion reste accessible si le serveur refuse une ancienne version d'accès.
      return NextResponse.next({ request: { headers } });
    },

    handleInvalidToken: async (reason) => {
      console.info("Missing or invalid token:", reason);
      if (isAuthPath) return NextResponse.next();
      return NextResponse.redirect(new URL("/login", request.url));
    },

    handleError: async (error) => {
      console.error("Auth error", error);
      if (isAuthPath) return NextResponse.next();
      return NextResponse.redirect(new URL("/login", request.url));
    },
  });
}

export const config = {
  matcher: [
    "/api/login",
    "/api/logout",
    "/((?!_next|favicon.ico|api|.*\\.).*)",
  ],
};
