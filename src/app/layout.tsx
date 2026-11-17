import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tápio — Cardápios Digitais Inteligentes para Mesas (QR Code & NFC)",
  description:
    "Sistema completo de cardápio digital de mesa com painel master, gestão rápida pelo celular e plaquinhas NFC/QR Code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={plusJakarta.variable}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-orange-200 selection:text-orange-950">
        {children}
      </body>
    </html>
  );
}
