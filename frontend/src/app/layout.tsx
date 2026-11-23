import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AbleNova — Accessible AI Learning for Every Child',
  description:
    'AbleNova is an AI-powered personalized learning platform built specifically for children with disabilities. Accessible, offline-ready, and adaptive to every learner.',
  keywords: ['accessible education', 'children with disabilities', 'AI learning', 'offline education'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${inter.className}`}>
      <body className="min-h-screen flex flex-col bg-[#F6F3EE] dark:bg-slate-950 text-[#1F2933] dark:text-slate-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
