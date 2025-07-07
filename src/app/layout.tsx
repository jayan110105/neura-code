import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Neura-Code',
    template: '%s - Neura-Code'
  },
  description: 'Your intelligent personal productivity assistant. Manage todos, notes, bookmarks, reminders, and daily logs with AI-powered search and insights.',
  keywords: ['productivity', 'todo', 'notes', 'bookmarks', 'reminders', 'daily logs', 'AI assistant', 'personal management'],
  authors: [{ name: 'Neura-Code' }],
  creator: 'Neura-Code',
  metadataBase: new URL('https://neura.jayan.dev'),
  openGraph: {
    type: 'website',
    title: 'Neura-Code | Personal Productivity Assistant',
    description: 'Your intelligent personal productivity assistant. Manage todos, notes, bookmarks, reminders, and daily logs with AI-powered search and insights.',
    siteName: 'Neura-Code',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neura-Code | Personal Productivity Assistant',
    description: 'Your intelligent personal productivity assistant. Manage todos, notes, bookmarks, reminders, and daily logs with AI-powered search and insights.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
