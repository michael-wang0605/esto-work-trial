/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TEMP while you iterate — prevents type errors from failing the build
    ignoreBuildErrors: true,
  },
  eslint: {
    // TEMP — prevents ESLint warnings/errors from failing the build
    ignoreDuringBuilds: true,
  },
  // Prisma configuration
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  // Ensure Prisma client is generated during build
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), '@prisma/client']
    }
    return config
  },
  // Build output configuration for Vercel
  // output: 'standalone', // Not needed for Vercel
  experimental: {
    // outputFileTracingRoot: undefined, // Not needed for Vercel
  },
};

module.exports = nextConfig;
