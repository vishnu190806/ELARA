import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "worker_threads": false,
        "module": false,
      };
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^node:/,
        })
      );
    }
    return config;
  },
};
export default withPWA(nextConfig);
