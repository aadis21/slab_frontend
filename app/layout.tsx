import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'InvestSlabs v1.0 — Smart Investment Platform',
  description:
    'InvestSlabs is a modern investment platform offering curated mutual fund plans with up to 20% annual returns. Start investing from ₹10,000.',
  keywords: 'investment, mutual funds, SIP, portfolio, ELSS, returns',
  openGraph: {
    title: 'InvestSlabs v1.0',
    description: 'Grow your wealth with curated investment plans',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-background text-text-dark antialiased">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
