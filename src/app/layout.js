import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ChatbotProvider } from "@/components/chatbot/ChatbotProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/schemas";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://spplabs.es"),
  alternates: {
    canonical: "https://spplabs.es",
    languages: {
      "es-ES": "https://spplabs.es",
      "es": "https://spplabs.es",
      "x-default": "https://spplabs.es",
    },
  },
  title: "SPP labs | Soluciones tecnológicas para empresas",
  description: "Creamos páginas web premium integradas con CRM, automatizaciones con IA y soluciones digitales para empresas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "SPP labs",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "SPP labs | Soluciones tecnológicas para empresas",
    description: "Creamos páginas web premium integradas con CRM, automatizaciones con IA y soluciones digitales para empresas.",
    url: "https://spplabs.es",
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "SPP Labs | Soluciones tecnológicas para empresas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SPP labs | Soluciones tecnológicas para empresas",
    description: "Creamos páginas web premium integradas con CRM, automatizaciones con IA y soluciones digitales para empresas.",
    images: ["/logo.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  const organizationSchema = getOrganizationSchema();
  const webSiteSchema = getWebSiteSchema();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ChatbotProvider>
          {children}
          <CookieBanner />
        </ChatbotProvider>
      </body>
    </html>
  );
}
