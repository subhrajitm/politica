import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import AdminLayoutWrapper from '@/components/AdminLayoutWrapper';
import DynamicTitle from '@/components/DynamicTitle';
import { AuthProvider } from '@/contexts/AuthContext';
import { FavouritesProvider } from '@/contexts/FavouritesContext';

export const metadata: Metadata = {
  title: 'OurNation - Know Who Represents You',
  description:
    'A cutting-edge AI platform unlocking deep political insights from every corner of the world',
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
      </head>
      <body
        className={cn('min-h-screen bg-background font-sans antialiased')}
      >
        <AuthProvider>
          <FavouritesProvider>
            <div className="relative flex min-h-screen flex-col">
              <DynamicTitle />
              <AdminLayoutWrapper>
                <main className="flex-1">{children}</main>
              </AdminLayoutWrapper>
            </div>
            <Toaster />
          </FavouritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
