import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          {
            // Allow framing by bluejax.ai and its subdomains
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://*.bluejax.ai https://bluejax.ai",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

