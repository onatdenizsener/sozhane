/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'puppeteer', 'bcryptjs'],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'better-sqlite3'];
    return config;
  },
};

module.exports = nextConfig;
