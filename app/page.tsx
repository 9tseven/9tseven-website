// app/page.tsx
import HeroSection from "./components/HeroSection";
import ManifestoSection from "./components/ManifestoSection";
import FeaturedProductsSection from "./components/FeaturedProductsSection";
import HomeImageSection from "./components/HomeImageSection";
import BrandStatementSection from "./components/BrandStatementSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ManifestoSection />
      <FeaturedProductsSection />
      <HomeImageSection />
      <BrandStatementSection />
    </main>
  );
}
