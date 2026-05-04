import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Conan — Tokyo Travel Agent',
  description: 'Your expert Tokyo travel agent powered by AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
