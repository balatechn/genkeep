import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'GenKeep – Password Keeper',
  description: 'Secure password generator & keeper',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-dark-950 text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
