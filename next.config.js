/** @type {import('next').NextConfig} */
const nextConfig = {
  // Si no necesitas estas opciones para tu despliegue, puedes comentarlas o eliminarlas.
  // distDir: process.env.NEXT_DIST_DIR || '.next',
  // output: process.env.NEXT_OUTPUT_MODE,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;