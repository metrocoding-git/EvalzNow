/** @type {import('next').NextConfig} */

// Origin of the EvalzNow API (used by the Content-Security-Policy below)
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
let apiOrigin = "";
try { apiOrigin = new URL(apiUrl).origin; } catch { apiOrigin = ""; }

const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy: blocks injected third-party scripts, clickjacking and
// data exfiltration to unknown hosts. 'unsafe-inline'/'unsafe-eval' are still needed
// by Next.js inline bootstrapping and the charting libraries.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}`.trim(),
  "worker-src 'self' blob:",
  "frame-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

// Signed-in pages must never be stored by the browser/proxies, so the Back button
// after logout cannot show a cached copy of dashboard data.
const noStore = [
  { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
];

// Static public assets (images, PDFs) rarely change -> let browsers cache them.
const staticCache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }];

const nextConfig = {
  poweredByHeader: false,          // hide "X-Powered-By: Next.js"
  compress: true,                  // gzip HTML/JS/CSS served by `next start`
  productionBrowserSourceMaps: false,

  compiler: {
    // Strip debug console.log calls from the production bundle (the dashboard logged on
    // every key press and every render). console.error / console.warn are kept.
    removeConsole: isProd ? { exclude: ["error", "warn"] } : false,
  },

  experimental: {
    // Import only the icons/components actually used instead of whole libraries
    optimizePackageImports: ["lucide-react", "react-icons", "recharts", "framer-motion"],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800,
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/dashboard/:path*", headers: noStore },
      { source: "/welcome", headers: noStore },
      { source: "/login", headers: noStore },
      { source: "/Assets/:path*", headers: staticCache },
      { source: "/images/:path*", headers: staticCache },
      { source: "/icons/:path*", headers: staticCache },
      { source: "/docs/:path*", headers: staticCache },
    ];
  },
};

export default nextConfig;
