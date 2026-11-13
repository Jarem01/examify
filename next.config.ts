import type { NextConfig } from 'next';

/**
 * The app is exported as static files so GitHub Pages can serve it.
 * `NEXT_PUBLIC_BASE_PATH` is set to "/examify" by the Pages workflow because
 * the site is served from https://<user>.github.io/examify/; local dev and
 * `npm start` leave it unset and serve from the root.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ['pv-5c5afd5ef018-2d258ccd-2fb3-4dd8-a558-df83a1dc551d.style.dev'],
};

export default nextConfig;
