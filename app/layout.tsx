import type { Metadata } from "next";
import { Figtree, Monsieur_La_Doulaise } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";

const figtreeSans = Figtree({
  variable: "--font-figtree-sans",
  subsets: ["latin"],
});

const monsieurLaDoulaise = Monsieur_La_Doulaise({
  variable: "--font-monsieur",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "9TSEVEN",
  description: "More than running",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtreeSans.variable} ${monsieurLaDoulaise.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <SmoothScroll>{children}</SmoothScroll>
        <Footer />
      </body>
    </html>
  );
}
