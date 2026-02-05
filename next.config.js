/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
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
