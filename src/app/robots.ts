import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://app.bluejax.ai";

    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/"],
                disallow: [
                    "/api/",
                    "/admin/",
                    "/staff/",
                    "/family/",
                    "/auth/",
                    "/_next/",
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
