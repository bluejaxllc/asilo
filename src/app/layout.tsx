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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://asilo.bluejax.ai"),
  title: {
    default: "Asilo | Estancia para el Adulto Mayor",
    template: "%s | Asilo",
  },
  description:
    "El sistema operativo para residencias de retiro. Centralice identidades, automatice el cumplimiento normativo y controle su operación. Por BlueJax.",
  keywords: [
    "asilo",
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
    title: "Asilo | El Sistema Operativo para Residencias de Retiro",
    description:
      "Centralice identidades, automatice el cumplimiento normativo y controle su operación médica desde una única infraestructura. Por BlueJax.",
    type: "website",
    locale: "es_MX",
    siteName: "Asilo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asilo | El Sistema Operativo para Residencias de Retiro",
    description:
      "Centralice identidades, automatice el cumplimiento normativo y controle su operación médica. Por BlueJax.",
    creator: "@bluejax",
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
