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
  // Configuración para Docker
  output: 'standalone',
  // experimental: {
  //   appDir: true,
  // },
}

module.exports = nextConfig
