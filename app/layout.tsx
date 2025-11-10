import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ChatWidget } from "@/components/chat-widget";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Mundo Cancún | Agencia de Viajes Premium",
  description: "Descubre los mejores paquetes de viaje a Cancún y la Riviera Maya. Resort, villas, experiencias de lujo y más.",
  keywords: "cancun, riviera maya, viajes, turismo, resort, playa, mexico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(inter.variable, playfair.variable, "font-sans antialiased")}>
        {children}
        <ChatWidget />
        <Toaster />
      </body>
    </html>
  );
}
