const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  // MODIFICACIÓN: `outputFileTracingRoot` movido fuera de `experimental`
  outputFileTracingRoot: path.join(__dirname, '../'), 
  
  // Si no hay otras propiedades experimentales, el objeto 'experimental' se puede omitir.
  // experimental: {}, // O se puede dejar vacío si hay otras propiedades que no se mencionan aquí.

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;