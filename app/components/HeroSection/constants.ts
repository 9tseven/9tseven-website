import type { HeroSlide } from "./types";

export const ACCENT_GRADIENT = "radial-gradient(ellipse 80% 60% at 50% 50%, #1a1a1a 0%, transparent 70%)";

export const SLIDES: HeroSlide[] = [
  {
    id: 0,
    bg: "#0d0c0a",
    image: "/images/Hero/hero-img1.webp",
    heading: "Shop now",
    subheading: "Explore our latest collection",
    href: "/products",
  },
  {
    id: 1,
    bg: "#0a0c0d",
    image: "/images/Hero/hero-img2.webp",
    heading: "New arrivals",
    subheading: "Fresh drops for the season",
    href: "/products",
  },
  {
    id: 2,
    bg: "#0c0d0a",
    image: "/images/Hero/hero-img3.webp",
    video: "/images/Hero/hero-video.webm",
    heading: "Our mantra",
    subheading: "Learn what drives us forward",
    href: "/mantra",
  },
  {
    id: 3,
    bg: "#0d0a0c",
    image: "/images/Hero/hero-img4.webp",
    heading: "Join the community",
    subheading: "Be part of the movement",
    href: "/community",
  },
  {
    id: 4,
    bg: "var(--color-bg)",
    image: "/images/Hero/hero-img5.webp",
    heading: "The collection",
    subheading: "Discover every piece",
    href: "/products",
  },
];

export const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;
