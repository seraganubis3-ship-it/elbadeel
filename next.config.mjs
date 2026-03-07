import nextPWA from 'next-pwa';
import { execSync } from 'node:child_process';

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  importScripts: ['/custom-sw.js'],
  runtimeCaching: [
    {
      urlPattern: /^https?.*\/_next\/static\/.*$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: { maxEntries: 256, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    {
      urlPattern: /^https?.*\/_next\/image\?.*$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: { maxEntries: 256, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /^https?.*\.(?:js|css|png|jpg|jpeg|svg|webp|ico|woff2?)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: { maxEntries: 512, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /^https?.*\/api\/.*$/i,
      handler: 'NetworkOnly',
      options: { cacheName: 'api-network-only' },
    },
    {
      urlPattern: /^https?.*$/i,
      handler: 'NetworkOnly',
      options: { cacheName: 'network-only' },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'ioredis', 'bullmq'],
    instrumentationHook: true,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [
      { protocol: 'https', hostname: 'albadel.com.eg' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 's3.us-east-005.backblazeb2.com' },
      { protocol: 'https', hostname: 'f005.backblazeb2.com' },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: false,
  },
  compress: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules\/require-in-the-middle/ },
      { module: /node_modules\/@opentelemetry\/instrumentation/ },
      { module: /node_modules\/@sentry/ },
    ];

    if (isServer) {
      config.externals.push('ioredis', 'bullmq');
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      ioredis: false,
      bullmq: false,
    };

    return config;
  },
  generateBuildId: async () => {
    try {
      return execSync('git rev-parse HEAD').toString().trim();
    } catch {
      return null;
    }
  },
};

export default withPWA(nextConfig);
