"use client";

import { Menu, ShoppingCart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface NavActionsProps {
  onMenuOpen: () => void;
}

export default function NavActions({ onMenuOpen }: NavActionsProps) {
  const { openCart, totalQuantity } = useCart();
  const badgeLabel = totalQuantity > 99 ? "99+" : String(totalQuantity);

  return (
    <div className="md:hidden flex items-center gap-4 bg-overlay backdrop-blur-md rounded-full px-4 py-2.5 text-fg">
      <button onClick={openCart} aria-label={`Open cart, ${totalQuantity} items`} className="relative opacity-70 hover:opacity-100 transition-opacity duration-base">
        <ShoppingCart size={18} strokeWidth={1.5} />
        {totalQuantity > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-3.5 h-3.5 px-1 rounded-full flex items-center justify-center text-[9px] font-semibold leading-none bg-white text-ink">{badgeLabel}</span>}
      </button>
      <span className="w-px h-4 bg-surface-hover" aria-hidden="true" />
      <button onClick={onMenuOpen} aria-label="Open menu" className="opacity-70 hover:opacity-100 transition-opacity duration-base">
        <Menu size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}
