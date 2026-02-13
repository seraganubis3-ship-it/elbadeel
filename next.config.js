/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'ioredis', 'bullmq'],
    instrumentationHook: true,
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
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
      {
        protocol: 'https',
        hostname: 's3.us-east-005.backblazeb2.com',
      },
    ],
  },
  
  // Compression
  compress: true,
  
  // Performance optimizations
  swcMinify: true,
  
  webpack: (config, { isServer }) => {
    // Ignore critical dependency warnings from instrumentation packages
    config.ignoreWarnings = [
      { module: /node_modules\/require-in-the-middle/ },
      { module: /node_modules\/@opentelemetry\/instrumentation/ },
      { module: /node_modules\/@sentry/ },
    ];

    // External packages for server components
    if (isServer) {
      config.externals.push('ioredis', 'bullmq');
    }

    // Fallbacks for Edge runtime
    config.resolve.fallback = {
      ...config.resolve.fallback,
      ioredis: false,
      bullmq: false,
    };
    
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
