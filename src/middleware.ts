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
        return undefined; // Do nothing, let it pass
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            let redirectUrl = DEFAULT_LOGIN_REDIRECT;
            if (role === "ADMIN") redirectUrl = "/admin";
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

        // FAMILY users can ONLY access /family
        if (role === "FAMILY" && (path.startsWith("/admin") || path.startsWith("/staff"))) {
            return Response.redirect(new URL("/family", nextUrl));
        }

        // Non-ADMIN users cannot access /admin
        if (role !== "ADMIN" && role !== "FAMILY" && path.startsWith("/admin")) {
            return Response.redirect(new URL("/staff", nextUrl));
        }

        // Non-FAMILY, non-ADMIN, non-STAFF users trying /family
        if (role !== "FAMILY" && path.startsWith("/family")) {
            const fallback = role === "ADMIN" ? "/admin" : "/staff";
            return Response.redirect(new URL(fallback, nextUrl));
        }
    }

    return undefined;
})

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
