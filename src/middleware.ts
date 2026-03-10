import NextAuth from "next-auth";
import authConfig from "./auth.config";
import {
    DEFAULT_LOGIN_REDIRECT,
    apiAuthPrefix,
    authRoutes,
    publicRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    if (isApiAuthRoute) {
        return undefined;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            let redirectUrl = DEFAULT_LOGIN_REDIRECT;
            if (role === "SUPER_ADMIN") redirectUrl = "/super-admin";
            else if (role === "ADMIN") redirectUrl = "/admin";
            else if (role === "FAMILY") redirectUrl = "/family";
            return Response.redirect(new URL(redirectUrl, nextUrl));
        }
        return undefined;
    }

    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }
        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
    }

    // Role-based route guards
    if (isLoggedIn) {
        const path = nextUrl.pathname;

        // SUPER_ADMIN Isolation
        if (role === "SUPER_ADMIN" && !path.startsWith("/super-admin") && !path.startsWith("/api")) {
            return Response.redirect(new URL("/super-admin", nextUrl));
        }
        if (role !== "SUPER_ADMIN" && path.startsWith("/super-admin")) {
            let fallback = "/staff";
            if (role === "ADMIN") fallback = "/admin";
            else if (role === "FAMILY") fallback = "/family";
            return Response.redirect(new URL(fallback, nextUrl));
        }

        if (role === "FAMILY" && (path.startsWith("/admin") || path.startsWith("/staff"))) {
            return Response.redirect(new URL("/family", nextUrl));
        }

        if (role !== "ADMIN" && role !== "FAMILY" && role !== "SUPER_ADMIN" && path.startsWith("/admin")) {
            return Response.redirect(new URL("/staff", nextUrl));
        }

        if (role !== "FAMILY" && role !== "SUPER_ADMIN" && path.startsWith("/family")) {
            const fallback = role === "ADMIN" ? "/admin" : "/staff";
            return Response.redirect(new URL(fallback, nextUrl));
        }

        // Enforce Password Reset
        const mustChangePassword = (req.auth?.user as any)?.mustChangePassword;
        if (mustChangePassword && !path.startsWith("/auth/reset-password") && !path.startsWith("/api")) {
            return Response.redirect(new URL("/auth/reset-password", nextUrl));
        }
    }

    return undefined;
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next|icon|apple-icon|opengraph-image|favicon\\.ico|manifest\\.json|sitemap\\.xml|robots\\.txt).*)', '/', '/(api|trpc)(.*)'],
}
