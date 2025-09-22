/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'cdn.whatclinic.com' },
      { protocol: 'https', hostname: 'www.whatclinic.com' },
      { protocol: 'https', hostname: 'whatclinic.com' },
    ],
  },
};

export default nextConfig;
