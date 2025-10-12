/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'cg.optimizely.com',
      },
      {
        protocol: 'https',
        hostname: '*.optimizely.com',
      },
    ],
  },
}

module.exports = nextConfig
