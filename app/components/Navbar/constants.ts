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
      { label: "Apparel_01", href: "/products/apparel/01" },
      { label: "Apparel_02", href: "/products/apparel/02" },
      { label: "Apparel_03", href: "/products/apparel/03" },
    ],
  },
  {
    label: "Accessories",
    href: "/products/accessories",
    type: "subcategories",
    subcategories: [
      { label: "Accessories_01", href: "/products/accessories/01" },
      { label: "Accessories_02", href: "/products/accessories/02" },
      { label: "Accessories_03", href: "/products/accessories/03" },
    ],
  },
  {
    label: "Equipment",
    href: "/products/equipment",
    type: "subcategories",
    subcategories: [
      { label: "Equipment_01", href: "/products/equipment/01" },
      { label: "Equipment_02", href: "/products/equipment/02" },
      { label: "Equipment_03", href: "/products/equipment/03" },
    ],
  },
  {
    label: "All Products",
    href: "/products",
    type: "products",
  },
];
