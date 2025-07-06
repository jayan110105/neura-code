import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', '@tabler/icons-react'],
    serverMinification: true,
  },
  
  images: {
    formats: ['image/webp', 'image/avif'],
  },
}

export default nextConfig
