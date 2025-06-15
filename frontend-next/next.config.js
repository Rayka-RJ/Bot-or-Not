/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['via.placeholder.com', 'api.deepai.org'],
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/:path*`,
      },
    ];
  },

  // Enable webpack polling for Docker environments -- for hot loading
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 300,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
  // Experimental features for better hot reload
  experimental: {
    // Increase memory limit if needed
    workerThreads: false,
    cpus: 1,
  },
}


module.exports = nextConfig