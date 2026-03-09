/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  assetPrefix: './', 
  // ✅ CAMBIO CLAVE: Ponemos esto en false para evitar subcarpetas raras
  trailingSlash: false, 
  images: {
    unoptimized: true, 
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
  // Forzamos a que no cree carpetas para las rutas
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig