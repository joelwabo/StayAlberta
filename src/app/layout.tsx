import type { Metadata } from "next";
import { Source_Serif_4, Hanken_Grotesk } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const sourceSerif4 = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "StayAlberta by HrodricEstate | Professional Corporate Housing",
  description:
    "Premium short-term accommodations across Alberta for professionals and teams on extended assignments. Direct billing, predictable pricing, no platform fees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSerif4.variable} ${hankenGrotesk.variable} scroll-smooth h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=block"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
