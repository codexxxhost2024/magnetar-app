/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['hebbkx1anhila5yf.public.blob.vercel-storage.com', 'firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Configure headers for PWA
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, geolocation=*, interest-cohort=(), accelerometer=*, gyroscope=*, magnetometer=*, payment=*, ambient-light-sensor=*, autoplay=*',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src * 'self' data: blob: 'unsafe-inline' 'unsafe-eval'; script-src * 'self' data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src * 'self' data: blob: 'unsafe-inline'; img-src * 'self' data: blob: 'unsafe-inline'; frame-src * 'self' data: blob:; style-src * 'self' data: blob: 'unsafe-inline'; font-src * 'self' data: blob: 'unsafe-inline'; frame-ancestors 'self' *;",
          },
        ],
      },
      {
        source: '/service-worker.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

