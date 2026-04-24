export const PRODUCTS = [
  {
    id: 0,
    category: "Apparel",
    name: "Product Name",
    price: 699,
    sizes: ["XS", "S", "M", "L", "XL"],
    soldOutSizes: ["XS", "XL"],
    images: ["/ProductPlaceholder/p1.webp", "/ProductPlaceholder/p3.webp"],
    description: "Engineered for performance, constructed from a lightweight blend designed for breathability, moisture management, and to help you perform at your best.",
    material: "88% Polyester / 12% Spandex\nRace-ready fit · Minimal seams for comfort",
    sizing: "Model is 181cm and is wearing a size M. The product is true to size.",
  },
  {
    id: 1,
    category: "Apparel",
    name: "Product Name",
    price: 699,
    sizes: ["S", "M", "L"],
    soldOutSizes: ["L"],
    images: ["/ProductPlaceholder/p2.webp", "/ProductPlaceholder/p4.webp"],
    description: "A lightweight layer built for long miles. Breathable, fast-drying, and designed to move with you.",
    material: "92% Recycled Polyester / 8% Elastane\nRelaxed fit · Flatlock seams",
    sizing: "Model is 184cm and is wearing a size M. Runs slightly relaxed — size down for a fitted look.",
  },
  {
    id: 2,
    category: "Accessories",
    name: "Product Name",
    price: 499,
    sizes: ["ONE SIZE"],
    soldOutSizes: [],
    images: ["/ProductPlaceholder/p3.webp", "/ProductPlaceholder/p5.webp"],
    description: "A minimal accessory refined for daily use. Lightweight, durable, and built to last through season after season.",
    material: "100% Cotton Twill\nAdjustable strap · Embroidered logo",
    sizing: "One size. Fully adjustable.",
  },
  {
    id: 3,
    category: "Accessories",
    name: "Product Name",
    price: 499,
    sizes: ["ONE SIZE"],
    soldOutSizes: [],
    images: ["/ProductPlaceholder/p4.webp", "/ProductPlaceholder/p1.webp"],
    description: "Designed for the road and the rest day alike. Quiet utility, soft-touch materials, and considered details.",
    material: "80% Nylon / 20% Spandex\nFour-way stretch · Reinforced stitching",
    sizing: "One size. Designed to fit most.",
  },
  {
    id: 4,
    category: "Apparel",
    name: "Product Name",
    price: 699,
    sizes: ["XS", "S", "M"],
    soldOutSizes: ["XS"],
    images: ["/ProductPlaceholder/p5.webp", "/ProductPlaceholder/p2.webp"],
    description: "A training staple engineered for high-output days. Wicks moisture fast, dries faster, and stays out of the way.",
    material: "100% Recycled Polyester\nAthletic fit · Laser-cut ventilation",
    sizing: "Model is 178cm and is wearing a size S. Size up for a standard fit.",
  },
  {
    id: 5,
    category: "Accessories",
    name: "Product Name",
    price: 499,
    sizes: ["ONE SIZE"],
    soldOutSizes: [],
    images: ["/ProductPlaceholder/p2.webp", "/ProductPlaceholder/p5.webp"],
    description: "A small object, carefully made. Built from materials chosen for longevity over novelty.",
    material: "Full-grain leather · Solid brass hardware",
    sizing: "One size.",
  },
] as const;

export type Product = (typeof PRODUCTS)[number];

/** px gap between cards */
export const CARD_GAP = 16;

/** px of the next card that peeks at the right edge */
export const PEEK_AMOUNT = 40;
