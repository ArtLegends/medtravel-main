/** @type {import('next').NextConfig} */
const nextConfig = {
    // Experimental optimizations for Next.js 15
    experimental: {
        // Optimize package imports for better tree-shaking
        optimizePackageImports: [
            '@heroui/react',
            '@iconify/react',
            'react-i18next',
            'framer-motion'
        ],
        // Enable partial prerendering for better performance
        ppr: false, // Will enable when stable
    },



    // Server external packages (moved from experimental)
    serverExternalPackages: ['@supabase/supabase-js'],

    // Compiler optimizations
    compiler: {
        // Remove console logs in production
        removeConsole: process.env.NODE_ENV === 'production',
        // Remove React properties in production
        reactRemoveProperties: process.env.NODE_ENV === 'production',
    },

    // Bundle analyzer and optimizations
    webpack: (config, { isServer }) => {
        // Optimize bundle splitting
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
            };
        }

        // Prevent MIME type errors
        config.resolve.alias = {
            ...config.resolve.alias,
        };

        // Optimize CSS loading
        config.optimization.usedExports = true;

        return config;
    },

    // Images optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        // Optimize image loading
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    // Headers for better caching and performance
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none';",
                    },
                ],
            },
            {
                source: '/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
