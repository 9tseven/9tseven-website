import HeroSection from "./components/HeroSection";
import MantraSection from "./components/MantraSection";
import FeaturedProductsSection from "./components/FeaturedProductsSection";
import HomeImageSection from "./components/HomeImageSection";
import BrandStatementSection from "./components/BrandStatementSection";
import BlogSection from "./components/BlogSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturedProductsSection />
      <MantraSection />
      <HomeImageSection />
      <BrandStatementSection />
      <BlogSection />
    </main>
  );
}
