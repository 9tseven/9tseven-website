export const PRODUCTS = [
  { id: 0, category: "Apparel",     name: "Product Name", price: 699, sizes: ["XS", "S", "M", "L", "XL"], images: ["/ProductPlaceholder/p1.webp", "/ProductPlaceholder/p3.webp"] },
  { id: 1, category: "Apparel",     name: "Product Name", price: 699, sizes: ["S", "M", "L"],              images: ["/ProductPlaceholder/p2.webp", "/ProductPlaceholder/p4.webp"] },
  { id: 2, category: "Accessories", name: "Product Name", price: 499, sizes: ["ONE SIZE"],                 images: ["/ProductPlaceholder/p3.webp", "/ProductPlaceholder/p5.webp"] },
  { id: 3, category: "Accessories", name: "Product Name", price: 499, sizes: ["ONE SIZE"],                 images: ["/ProductPlaceholder/p4.webp", "/ProductPlaceholder/p1.webp"] },
  { id: 4, category: "Apparel",     name: "Product Name", price: 699, sizes: ["XS", "S", "M"],             images: ["/ProductPlaceholder/p5.webp", "/ProductPlaceholder/p2.webp"] },
  { id: 5, category: "Accessories", name: "Product Name", price: 499, sizes: ["ONE SIZE"],                 images: ["/ProductPlaceholder/p2.webp", "/ProductPlaceholder/p5.webp"] },
] as const;

export type Product = (typeof PRODUCTS)[number];

/** px gap between cards */
export const CARD_GAP = 16;

/** px of the next card that peeks at the right edge */
export const PEEK_AMOUNT = 40;
