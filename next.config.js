/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // ✅ Eliminamos distDir porque 'out' es el valor por defecto
  // ✅ ELIMINAMOS assetPrefix porque rompe las rutas en Vercel
  trailingSlash: false, 
  images: {
    unoptimized: true, 
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
  // ✅ Esto ayuda a que Capacitor y Vercel se lleven bien
  swcMinify: true,
}

module.exports = nextConfig