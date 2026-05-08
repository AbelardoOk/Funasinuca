import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    EXTERNAL_API_URL: process.env.EXTERNAL_API_URL,
  },
};

export default nextConfig;
