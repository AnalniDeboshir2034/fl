import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'L-Shop',
  description: 'Магазин кроссовок и одежды MaFinBuSi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
