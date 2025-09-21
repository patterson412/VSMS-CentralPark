import type { Metadata, Viewport } from 'next';
import { Providers } from '@/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Vehicle Sales Management - Central Park Puppies',
  description: 'Comprehensive Vehicle Sales Management System with AI-powered descriptions',
  keywords: ['vehicle sales', 'car dealership', 'inventory management', 'automotive'],
  authors: [{ name: 'Central Park Puppies' }],
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="__next">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}