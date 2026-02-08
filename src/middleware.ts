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

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    if (isApiAuthRoute) {
        return undefined; // Do nothing, let it pass
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            console.log("Middleware Auth Debug:", JSON.stringify(req.auth?.user, null, 2));
            const role = req.auth?.user?.role;
            console.log("Middleware Role:", role);
            const redirectUrl = role === "ADMIN" ? "/admin" : DEFAULT_LOGIN_REDIRECT;
            console.log("Redirecting to:", redirectUrl);
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

    return undefined;
})

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
