import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Belleza, Alegreya } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const belleza = Belleza({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-belleza',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-alegreya',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'IzyBotanic',
  description:
    'Seu assistente pessoal de cuidados com plantas com tecnologia de IA. Obtenha conselhos de especialistas, cronogramas de cuidados e muito mais.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${belleza.variable} ${alegreya.variable}`}
      suppressHydrationWarning
    >
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
