import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import AdminLayoutWrapper from '@/components/AdminLayoutWrapper';
import DynamicTitle from '@/components/DynamicTitle';
import { AuthProvider } from '@/contexts/AuthContext';
import { FavouritesProvider } from '@/contexts/FavouritesContext';
import AuthErrorHandler from '@/components/AuthErrorHandler';
import { QueryProvider } from '@/providers/QueryProvider';
import { WebVitalsTracker, PerformanceBudgetChecker, RealTimePerformanceMonitor } from '@/components/WebVitalsTracker';
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner';
import { PWAUpdateNotification } from '@/components/pwa/PWAUpdateNotification';
import { OfflineIndicator, OfflineStatusBar } from '@/components/pwa/OfflineIndicator';
import { MobileNavigation } from '@/components/mobile/MobileNavigation';
import '@/lib/performanceInit';
import '@/lib/pwa/MobileOptimizations';

export const metadata: Metadata = {
  title: 'PolitiFind - Find Politicians In Your Area',
  description: 'A comprehensive AI-powered political information application for India.',
  keywords: ['politics', 'politicians', 'India', 'government', 'democracy', 'civic engagement'],
  authors: [{ name: 'PolitiFind Team' }],
  creator: 'PolitiFind',
  publisher: 'PolitiFind',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PolitiFind',
  },
  applicationName: 'PolitiFind',
  category: 'government',
  classification: 'Political Information Platform',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'PolitiFind',
    'application-name': 'PolitiFind',
    'msapplication-TileColor': '#2563eb',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#2563eb',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        
        {/* PWA Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* iOS PWA Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PolitiFind" />
        
        {/* Windows PWA Support */}
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body
        className={cn('min-h-screen bg-background font-sans antialiased')}
      >
        <QueryProvider>
          <AuthErrorHandler>
            <AuthProvider>
              <FavouritesProvider>
                <div className="relative flex min-h-screen flex-col">
                  <DynamicTitle />
                  <OfflineStatusBar />
                  <AdminLayoutWrapper>
                    <main className="flex-1">{children}</main>
                  </AdminLayoutWrapper>
                </div>
                <Toaster />
                <WebVitalsTracker />
                <PerformanceBudgetChecker />
                <RealTimePerformanceMonitor />
                <PWAInstallBanner />
                <PWAUpdateNotification />
                <OfflineIndicator />
                <MobileNavigation />
              </FavouritesProvider>
            </AuthProvider>
          </AuthErrorHandler>
        </QueryProvider>
      </body>
    </html>
  );
}
