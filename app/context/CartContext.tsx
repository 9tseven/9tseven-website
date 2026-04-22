// app/context/CartContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";

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

export interface Cart {
  id: string;
  lines: CartLine[];
  cost: {
    subtotalAmount: CartLinePrice;
  };
  checkoutUrl: string;
}

interface CartContextValue {
  cart: Cart;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (merchandise: CartLine["merchandise"], quantity: number) => void;
  removeLine: (id: string) => void;
  updateLine: (id: string, quantity: number) => void;
  totalQuantity: number;
}

const PLACEHOLDER_CART: Cart = {
  id: "placeholder-cart-1",
  checkoutUrl: "#",
  lines: [
    {
      id: "line-1",
      quantity: 1,
      merchandise: {
        id: "variant-1",
        title: "MORE THAN RUNNING SINGLET / SMALL",
        price: { amount: "550.00", currencyCode: "DKK" },
        product: {
          title: "MORE THAN RUNNING SINGLET - UNISEX",
          featuredImage: null,
        },
      },
    },
    {
      id: "line-2",
      quantity: 2,
      merchandise: {
        id: "variant-2",
        title: "9TSEVEN RACE SHORTS / MEDIUM",
        price: { amount: "449.00", currencyCode: "DKK" },
        product: {
          title: "9TSEVEN RACE SHORTS - UNISEX",
          featuredImage: null,
        },
      },
    },
  ],
  cost: {
    subtotalAmount: { amount: "999.00", currencyCode: "DKK" },
  },
};

function deriveSubtotal(lines: CartLine[]): CartLinePrice {
  const total = lines.reduce((sum, line) => sum + parseFloat(line.merchandise.price.amount) * line.quantity, 0);
  const currencyCode = lines[0]?.merchandise.price.currencyCode ?? "USD";
  return { amount: total.toFixed(2), currencyCode };
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(PLACEHOLDER_CART);
  const [isOpen, setIsOpen] = useState(false);
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const totalQuantity = cart.lines.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    lenis?.stop();

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
      lenis?.start();
    };
  }, [isOpen, lenis]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addLine = (merchandise: CartLine["merchandise"], quantity: number) => {
    setCart((prev) => {
      const existing = prev.lines.find((l) => l.merchandise.id === merchandise.id);
      const newLines = existing ? prev.lines.map((l) => (l.merchandise.id === merchandise.id ? { ...l, quantity: l.quantity + quantity } : l)) : [...prev.lines, { id: `line-${Date.now()}`, quantity, merchandise }];
      return { ...prev, lines: newLines, cost: { subtotalAmount: deriveSubtotal(newLines) } };
    });
  };

  const removeLine = (id: string) => {
    setCart((prev) => {
      const newLines = prev.lines.filter((l) => l.id !== id);
      return { ...prev, lines: newLines, cost: { subtotalAmount: deriveSubtotal(newLines) } };
    });
  };

  const updateLine = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeLine(id);
      return;
    }
    setCart((prev) => {
      const newLines = prev.lines.map((l) => (l.id === id ? { ...l, quantity } : l));
      return { ...prev, lines: newLines, cost: { subtotalAmount: deriveSubtotal(newLines) } };
    });
  };

  return <CartContext.Provider value={{ cart, isOpen, openCart, closeCart, addLine, removeLine, updateLine, totalQuantity }}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
