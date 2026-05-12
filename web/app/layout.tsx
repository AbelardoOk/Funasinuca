import type { Metadata, Viewport } from 'next';
import { Archivo, Gasoek_One } from 'next/font/google';
import './globals.css';

const gasoekBold = Gasoek_One({
  variable: '--font-gasoek-one',
  subsets: ['latin'],
  weight: '400',
});

const ArchivoSans = Archivo({
  variable: '--font-arquivo-sans',
  subsets: ['latin'],
  weight: 'variable',
});

export const metadata: Metadata = {
  title: 'Funasinuca',
  description: 'Sistema para Agendamento de Mesas de Sinuca',
  manifest: '/manifest.json', // PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Funasinuca',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000', // cor da barra do navegador no mobile
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${gasoekBold.variable} ${ArchivoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full min-h-dvh flex flex-col overscroll-none">{children}</body>
    </html>
  );
}
