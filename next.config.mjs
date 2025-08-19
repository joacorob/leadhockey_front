/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['uploadthingy.s3.us-west-1.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploadthingy.s3.us-west-1.amazonaws.com',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
