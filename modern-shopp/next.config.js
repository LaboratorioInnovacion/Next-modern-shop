/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["placeholder.svg", "ui-avatars.com"],
    unoptimized: true,
  },
  // experimental: {
  //   appDir: true,
  // },
}

module.exports = nextConfig
