import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Examify — study smarter',
  description:
    'Examify is an adaptive study platform with flashcards, Learn rounds, timed games and practice tests.',
};

export const viewport: Viewport = {
  themeColor: '#060a16',
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href={`${basePath}/apple-icon.svg`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
