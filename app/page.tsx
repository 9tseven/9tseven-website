// app/page.tsx
import HeroSection from "./components/HeroSection";
import MantraSection from "./components/MantraSection";
import FeaturedProductsSection from "./components/FeaturedProductsSection";
import HomeImageSection from "./components/HomeImageSection";
import BrandStatementSection from "./components/BrandStatementSection";
import InspoSection from "./components/InspoSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturedProductsSection />
      <MantraSection />
      <HomeImageSection />
      <BrandStatementSection />
    </main>
  );
}
