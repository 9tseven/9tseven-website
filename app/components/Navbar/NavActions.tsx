"use client";

import { Menu, ShoppingCart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useNavTheme } from "./hooks/useNavTheme";

interface NavActionsProps {
  onMenuOpen: () => void;
}

export default function NavActions({ onMenuOpen }: NavActionsProps) {
  const { openCart, totalQuantity } = useCart();
  const theme = useNavTheme();
  const isDark = theme === "dark";

  const badgeBg = isDark ? "bg-white" : "bg-black";
  const badgeText = isDark ? "text-black" : "text-white";
  const badgeLabel = totalQuantity > 99 ? "99+" : String(totalQuantity);

  return (
    <div className="md:hidden flex items-center gap-5">
      <button
        onClick={openCart}
        aria-label={`Open cart, ${totalQuantity} items`}
        className="relative opacity-60 hover:opacity-100 transition-opacity duration-200"
      >
        <ShoppingCart size={18} strokeWidth={1.5} />
        {totalQuantity > 0 && (
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center text-[9px] font-semibold leading-none ${badgeBg} ${badgeText}`}
          >
            {badgeLabel}
          </span>
        )}
      </button>
      <button
        onClick={onMenuOpen}
        aria-label="Open menu"
        className="opacity-60 hover:opacity-100 transition-opacity duration-200"
      >
        <Menu size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}
