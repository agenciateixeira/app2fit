import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from './contexts/AppContext'

export const metadata: Metadata = {
  title: '2Fit - Seu Coach Digital',
  description: 'Coach nutricional e fitness digital personalizado',
  manifest: '/manifest.json',
  themeColor: '#00FF88',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '2Fit',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: '2Fit',
    title: '2Fit - Seu Coach Digital',
    description: 'Coach nutricional e fitness digital personalizado',
  },
  twitter: {
    card: 'summary',
    title: '2Fit - Seu Coach Digital',
    description: 'Coach nutricional e fitness digital personalizado',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="application-name" content="2Fit" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="2Fit" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#00FF88" />
        
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
      </head>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}