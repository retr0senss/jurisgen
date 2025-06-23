import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import Header from '@/components/header';
import { UserStoreProvider } from '@/components/providers/user-store-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jurisgen.vercel.app"),
  title: {
    default: "JurisGen - AI Destekli Hukuk Asistanı",
    template: `%s | JurisGen`,
  },
  description: "Türkiye'nin en gelişmiş yapay zeka destekli hukuk asistanı. Anında hukuki tavsiye alın, belgelerinizi analiz edin ve güncel mevzuata erişin.",
  keywords: ["hukuk", "yapay zeka", "avukat", "danışman", "mevzuat", "türk hukuk sistemi", "hukuki danışmanlık", "ai"],
  authors: [{ name: "JurisGen Ekibi", url: "https://jurisgen.vercel.app" }],
  creator: "JurisGen Ekibi",
  publisher: "JurisGen Ekibi",
  openGraph: {
    title: "JurisGen - AI Destekli Hukuk Asistanı",
    description: "Türkiye'nin en gelişmiş yapay zeka destekli hukuk asistanı.",
    url: "https://jurisgen.vercel.app",
    siteName: "JurisGen",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JurisGen - AI Destekli Hukuk Asistanı",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JurisGen - AI Destekli Hukuk Asistanı",
    description: "Türkiye'nin en gelişmiş yapay zeka destekli hukuk asistanı.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="tr">
        <body className={`${inter.className} antialiased`}>
          <ThemeProvider defaultTheme="light">
            <UserStoreProvider>
              <Header />
              <main>{children}</main>
            </UserStoreProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
