import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ChatbotProvider } from "@/components/chatbot/ChatbotProvider";
import { CookieBanner } from "@/components/CookieBanner";

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
  title: "SPP labs | Soluciones tecnológicas para empresas",
  description: "Creamos páginas web premium integradas con CRM, automatizaciones con IA y soluciones digitales para empresas.",
  openGraph: {
    title: "SPP labs | Soluciones tecnológicas para empresas",
    description: "Creamos páginas web premium integradas con CRM, automatizaciones con IA y soluciones digitales para empresas.",
    url: "https://spplabs.es",
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ChatbotProvider>
          {children}
          <CookieBanner />
        </ChatbotProvider>
      </body>
    </html>
  );
}
