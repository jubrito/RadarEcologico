import type { NextConfig } from "next";

// GitHub Pages serves the site under /<repository>/. Set NEXT_PUBLIC_BASE_PATH
// accordingly in CI; it stays empty for local development.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
