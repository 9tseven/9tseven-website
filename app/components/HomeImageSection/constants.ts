// app/components/HomeImageSection/constants.ts

export type Panel = {
  label: string;
  leftText: string;
  rightText: string;
  image: string;
  alt: string;
  href: string;
};

export const PANELS: Panel[] = [
  {
    label: "Our Products",
    leftText: "Shop",
    rightText: "[ View all ]",
    image: "/PhotoSection/photo-section1.webp",
    alt: "9TSEVEN products",
    href: "/products",
  },
  {
    label: "Our Mantra",
    leftText: "Mantra",
    rightText: "[ Read more ]",
    image: "/PhotoSection/photo-section4.webp",
    alt: "Our mantra",
    href: "/mantra",
  },
  {
    label: "Our Community",
    leftText: "Social",
    rightText: "[ Instagram ]",
    image: "/PhotoSection/photo-section7.webp",
    alt: "Our community",
    href: "https://www.instagram.com/9tseven",
  },
];
