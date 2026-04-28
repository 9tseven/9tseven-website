export interface CartLinePrice {
  amount: string;
  currencyCode: string;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: CartLinePrice;
    product: {
      title: string;
      featuredImage: { url: string; altText: string | null } | null;
    };
  };
}

// The Shopify cart `id` is intentionally NOT part of this type.
// It contains a secret and stays server-side only (httpOnly cookie).
export interface Cart {
  lines: CartLine[];
  totalQuantity: number;
  cost: { subtotalAmount: CartLinePrice };
  checkoutUrl: string;
}
