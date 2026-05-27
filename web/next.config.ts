import type { NextConfig } from 'next';

console.log('>>> API_URL:', process.env.API_URL);

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    console.log('>>> rewrite destination:', `${process.env.API_URL}/api/:path*`);
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
