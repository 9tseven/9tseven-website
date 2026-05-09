import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NewsletterPopup from "./components/NewsletterPopup";
import SmoothScroll from "./components/SmoothScroll";
import LoadScreen from "./components/LoadScreen";
import { CartProvider } from "./context/CartContext";

const PRE_HYDRATION_SCRIPT = `try{if(sessionStorage.getItem('loadScreenSeen'))document.documentElement.setAttribute('data-load-seen','1');}catch(e){}`;

const openSauceOne = localFont({
  variable: "--font-open-sauce-one",
  src: [
    { path: "../public/fonts/OpenSauceOne-Light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/OpenSauceOne-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "../public/fonts/OpenSauceOne-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/OpenSauceOne-Italic.woff2", weight: "400", style: "italic" },
    { path: "../public/fonts/OpenSauceOne-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/OpenSauceOne-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "../public/fonts/OpenSauceOne-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/OpenSauceOne-SemiBoldItalic.woff2", weight: "600", style: "italic" },
    { path: "../public/fonts/OpenSauceOne-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/OpenSauceOne-BoldItalic.woff2", weight: "700", style: "italic" },
    { path: "../public/fonts/OpenSauceOne-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../public/fonts/OpenSauceOne-ExtraBoldItalic.woff2", weight: "800", style: "italic" },
    { path: "../public/fonts/OpenSauceOne-Black.woff2", weight: "900", style: "normal" },
    { path: "../public/fonts/OpenSauceOne-BlackItalic.woff2", weight: "900", style: "italic" },
  ],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className={`${openSauceOne.variable} ${jetbrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_HYDRATION_SCRIPT }} />
        <link rel="stylesheet" href="https://use.typekit.net/srx3ckv.css" />
      </head>
      <body className="min-h-full flex flex-col">
        <LoadScreen />
        <SmoothScroll>
          <CartProvider>
            <NewsletterPopup />
            <Navbar />
            {children}
            <Footer />
          </CartProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
