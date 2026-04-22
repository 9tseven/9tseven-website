import type { Metadata, Viewport } from "next";
import { Monsieur_La_Doulaise } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";
import LoadScreen from "./components/LoadScreen";
import { CartProvider } from "./context/CartContext";

const loadScreenPreHydrationScript = `try{if(sessionStorage.getItem('loadScreenSeen'))document.documentElement.setAttribute('data-load-seen','1');}catch(e){}`;

const openSauceSans = localFont({
  variable: "--font-open-sauce-sans",
  src: [
    { path: "../public/fonts/OpenSauceSans-Light.otf", weight: "300", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-LightItalic.otf", weight: "300", style: "italic" },
    { path: "../public/fonts/OpenSauceSans-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-Italic.otf", weight: "400", style: "italic" },
    { path: "../public/fonts/OpenSauceSans-Medium.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "../public/fonts/OpenSauceSans-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-SemiBoldItalic.otf", weight: "600", style: "italic" },
    { path: "../public/fonts/OpenSauceSans-Bold.otf", weight: "700", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "../public/fonts/OpenSauceSans-ExtraBold.otf", weight: "800", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-ExtraBoldItalic.otf", weight: "800", style: "italic" },
    { path: "../public/fonts/OpenSauceSans-Black.otf", weight: "900", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-BlackItalic.otf", weight: "900", style: "italic" },
  ],
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

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSauceSans.variable} ${monsieurLaDoulaise.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: loadScreenPreHydrationScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <LoadScreen />
        <SmoothScroll>
          <CartProvider>
            <Navbar />
            {children}
            <Footer />
          </CartProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
