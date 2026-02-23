import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://retiro.bluejax.ai"),
  title: {
    default: "Retiro | Estancia para el Adulto Mayor",
    template: "%s | Retiro",
  },
  description:
    "El sistema operativo para residencias de retiro. Centralice identidades, automatice el cumplimiento normativo y controle su operación. Por BlueJax.",
  keywords: [
    "retiro",
    "residencia adulto mayor",
    "gestión geriátrica",
    "cuidado del adulto mayor",
    "estancia para ancianos",
    "software residencias",
    "BlueJax",
  ],
  authors: [{ name: "BlueJax", url: "https://bluejax.ai" }],
  creator: "BlueJax",
  openGraph: {
    title: "Retiro | El Sistema Operativo para Estancias del Adulto Mayor",
    description:
      "Centralice identidades, automatice el cumplimiento normativo y controle su operación médica desde una única infraestructura. Por BlueJax.",
    type: "website",
    locale: "es_MX",
    siteName: "Retiro",
  },
  twitter: {
    card: "summary_large_image",
    title: "Retiro | El Sistema Operativo para Estancias del Adulto Mayor",
    description:
      "Centralice identidades, automatice el cumplimiento normativo y controle su operación médica. Por BlueJax.",
    creator: "@bluejax",
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
