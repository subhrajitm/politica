import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import AdminLayoutWrapper from '@/components/AdminLayoutWrapper';
import DynamicTitle from '@/components/DynamicTitle';

export const metadata: Metadata = {
  title: 'PolitiFind - Find Politicians In Your Area',
  description:
    'A comprehensive AI-powered political information application for India.',
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
        <div className="relative flex min-h-screen flex-col">
          <DynamicTitle />
          <AdminLayoutWrapper>
            <main className="flex-1">{children}</main>
          </AdminLayoutWrapper>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
