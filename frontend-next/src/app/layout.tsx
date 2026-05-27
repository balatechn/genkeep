import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'GenKeep – Password Keeper',
  description: 'Secure password generator & credential vault',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'GenKeep',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icon-192.svg',
    apple: '/icon-192.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4f46e5',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-dark-950 text-white">
        <Providers>{children}</Providers>
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }
        `}</Script>
      </body>
    </html>
  );
}
