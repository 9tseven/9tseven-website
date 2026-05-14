import HeroSection from "./components/HeroSection";
import CommunitySection from "./components/CommunitySection";
import FeaturedProductsSection from "./components/FeaturedProductsSection";
import HomeImageSection from "./components/HomeImageSection";
import BrandStatementSection from "./components/BrandStatementSection";
import BlogSection from "./components/BlogSection";
import InstagramMarquee from "./components/InstagramMarquee";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturedProductsSection />
      <CommunitySection />
      <HomeImageSection />
      <BrandStatementSection />
      <BlogSection />
      <InstagramMarquee theme="light" />
    </main>
  );
}
