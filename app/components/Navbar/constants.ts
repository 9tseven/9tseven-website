import type { ShopCategory } from "./types";

export const SHOP_MENU: ShopCategory[] = [
  {
    label: "New Arrivals",
    href: "/products/new-arrivals",
    type: "products",
  },
  {
    label: "Apparel",
    href: "/products/apparel",
    type: "subcategories",
    subcategories: [
      { label: "Tops", href: "/products/apparel?tag=tops" },
      { label: "Bottoms", href: "/products/apparel?tag=bottoms" },
      { label: "Activewear", href: "/products/apparel?tag=running" },
    ],
  },
  {
    label: "Accessories",
    href: "/products/accessories",
    type: "subcategories",
    subcategories: [
      { label: "Socks", href: "/products/accessories?tag=socks" },
    ],
  },
  {
    label: "Equipment",
    href: "/products/equipment",
    type: "subcategories",
    subcategories: [
      { label: "Water Bottle", href: "/products/equipment?tag=water-bottle" },
    ],
  },
  {
    label: "All Products",
    href: "/products",
    type: "products",
  },
];
