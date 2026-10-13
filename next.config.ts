import type { NextConfig } from "next";

// "/ostov-architects" on GitHub Pages, empty locally. Exposed to the client
// because plain <img>/<picture> sources do not get basePath applied by Next.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages serves /about/index.html for /about/ but not /about.html for /about.
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  experimental: {
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
