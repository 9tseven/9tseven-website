import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
    // AVIF first (≈20% smaller than WebP), WebP fallback. Next picks per Accept header.
    formats: ["image/avif", "image/webp"],
    // Allowlist; Next 16 requires this to be explicit. 65 for media-heavy carousels, 75 default.
    qualities: [65, 75],
    // Cap upper end at 2048 — 3840 is wasteful for this site's hero/product cards on retina.
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2048],
    minimumCacheTTL: 2678400,
  },
  /* config options here */
};

export default nextConfig;
