import { getHeroSlides } from "@/app/lib/hero";
import HeroSectionClient from "./HeroSectionClient";

export default async function HeroSection() {
  const slides = await getHeroSlides();
  return <HeroSectionClient slides={slides} />;
}
