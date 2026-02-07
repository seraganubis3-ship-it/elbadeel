/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'albadel.com.eg',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
  generateBuildId: async () => {
    // Return the git hash as the build ID
    try {
      return require('child_process')
        .execSync('git rev-parse HEAD')
        .toString()
        .trim();
    } catch {
      // Fallback to default if no git
      return null;
    }
  },
};

module.exports = nextConfig;
