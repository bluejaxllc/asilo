/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
    "/",
    "/upgrade",
    "/api/antigravity/run",
    "/api/webhook/nurse-voice",
    "/api/webhook/family-whatsapp",
    "/api/webhooks/bluejax-payment",
    "/api/cron/birthday",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/verify",
    "/auth/accept-invite",
    "/auth/reset-password",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/staff";

/**
 * The prefix for super admin routes
 * @type {string}
 */
export const superAdminPrefix = "/super-admin";
