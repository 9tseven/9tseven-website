// app/context/CartContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, useTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { addToCart, getCart, removeFromCart, updateCartLine } from "@/app/actions/cart";
import type { Cart } from "@/app/lib/cart-types";

export type { Cart, CartLine, CartLinePrice } from "@/app/lib/cart-types";

interface CartContextValue {
  cart: Cart | null;
  isOpen: boolean;
  pending: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (merchandiseId: string, quantity: number) => void;
  removeLine: (id: string) => void;
  updateLine: (id: string, quantity: number) => void;
  totalQuantity: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    getCart().then(setCart);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const totalQuantity = cart?.totalQuantity ?? 0;

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

  const addLine = (merchandiseId: string, quantity: number) => {
    startTransition(async () => {
      const next = await addToCart(merchandiseId, quantity);
      setCart(next);
    });
  };

  const removeLine = (id: string) => {
    startTransition(async () => {
      const next = await removeFromCart(id);
      setCart(next);
    });
  };

  const updateLine = (id: string, quantity: number) => {
    startTransition(async () => {
      const next = await updateCartLine(id, quantity);
      setCart(next);
    });
  };

  return <CartContext.Provider value={{ cart, isOpen, pending, openCart, closeCart, addLine, removeLine, updateLine, totalQuantity }}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
