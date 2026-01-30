/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@chat2poster/core-schema",
    "@chat2poster/core-adapters",
    "@chat2poster/core-renderer",
    "@chat2poster/core-pagination",
    "@chat2poster/core-export",
    "@chat2poster/shared-utils",
    "@chat2poster/themes",
  ],
};

export default nextConfig;
