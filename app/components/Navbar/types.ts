export type NavTheme = "dark" | "light";
export type PillStyle = { left: number; width: number; height: number };

export type ShopSubcategory = { label: string; href: string };

export type ShopCategory =
  | { label: string; href: string; type: "subcategories"; subcategories: ShopSubcategory[] }
  | { label: string; href: string; type: "products" };
