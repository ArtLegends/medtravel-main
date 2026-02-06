/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  reactStrictMode: true,

  experimental: {
    optimizePackageImports: [
      '@heroui/react',
      '@iconify/react',
      'react-i18next',
      'framer-motion',
    ],
    ppr: false,
  },

  serverExternalPackages: ['@supabase/supabase-js'],

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          heroui: {
            test: /[\\/]node_modules[\\/]@heroui[\\/]/,
            name: 'heroui',
            chunks: 'all',
            priority: 10,
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 10,
          },
        },
      }
    }

    config.optimization.usedExports = true
    config.resolve.alias['@'] = path.resolve(__dirname)

    return config
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none';",
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },

  /**
   * ВАЖНО:
   * - clinic rewrites делаем afterFiles, чтобы НЕ перехватывать реальные /api/** роуты
   * - исключаем зарезервированные префиксы из :country, чтобы даже теоретически не матчить /api, /customer, /patient и т.д.
   * - используем :path* чтобы поддержать любую глубину country/province/city/district/...
   * - порядок: review/inquiry ПЕРЕД detail (иначе detail схватит "inquiry" как slug)
   */
  async rewrites() {
    const RESERVED =
  'api|_next|static|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.json|customer|patient|partner|admin|login|auth|settings|labs|ref' +
  '|dentistry|plastic-surgery|hair-transplant|crowns|veneers|dental-implants';

    const country = `:country((?!${RESERVED})(?:[^/]+))`;

    const clinicRewrites = [
      { source: `/${country}/:path*/:slug/review`, destination: '/clinic/:slug/review' },
      { source: `/${country}/:path*/:slug/inquiry`, destination: '/clinic/:slug/inquiry' },
      { source: `/${country}/:path*/:slug`, destination: '/clinic/:slug' },
    ];

    return { afterFiles: clinicRewrites, fallback: [] };
  },

  // async redirects() {
  //   return [
  //     {
  //       source:
  //         '/:category(dentistry|plastic-surgery|hair-transplant|crowns|veneers|dental-implants)/:country/:province?/:city?/:district?/:clinic',
  //       destination: '/clinic/:clinic',
  //       permanent: false,
  //     },
  //   ]
  // },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'cdn.whatclinic.com' },
      { protocol: 'https', hostname: 'www.whatclinic.com' },
      { protocol: 'https', hostname: 'whatclinic.com' },
      { protocol: 'https', hostname: 'atlantis-dental.ru' },
      { protocol: 'https', hostname: 'pixsector.com' },
      { protocol: 'https', hostname: 'img.icons8.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: 'esteinturkey.com' },
    ],
  },
}

module.exports = nextConfig
