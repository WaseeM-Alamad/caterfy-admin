import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Caterfy Admin',
  description: 'Caterfy Admin Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
