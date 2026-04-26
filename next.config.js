/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Capacitor mobile build
  output: process.env.NEXT_EXPORT === 'true' ? 'export' : undefined,
  serverExternalPackages: ['@prisma/client'],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
}

module.exports = nextConfig
