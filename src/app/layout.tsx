import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AuthProvider } from '@/context/AuthContext'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'FORGE — Shape your days. Build your life.',
    template: '%s | FORGE',
  },
  description:
    'FORGE is your personal life operating system. Set goals, build habits, plan your days, and reflect on your growth — all in one beautiful, intelligent space.',
  keywords: ['productivity', 'goals', 'habits', 'life planner', 'daily planning', 'FORGE'],
  authors: [{ name: 'FORGE' }],
  creator: 'FORGE',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'FORGE — Shape your days. Build your life.',
    description: 'Your personal life operating system.',
    siteName: 'FORGE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FORGE',
    description: 'Shape your days. Build your life.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#050714' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
