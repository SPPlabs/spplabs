import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ChatbotProvider } from "@/components/chatbot/ChatbotProvider";

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
  title: "SPP Labs | Next-Generation Operations & Analytics Platform",
  description: "Accelerate your development cycle, monitor performance, and scale secure workflows with SPP Labs' premium operations platform.",
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ChatbotProvider>
          {children}
        </ChatbotProvider>
      </body>
    </html>
  );
}
