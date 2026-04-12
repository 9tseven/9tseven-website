import Link from "next/link";
import { ShoppingCart, Menu } from "lucide-react";

interface NavActionsProps {
  onMenuOpen: () => void;
}

export default function NavActions({ onMenuOpen }: NavActionsProps) {
  return (
    <div className="flex items-center gap-5">
      <Link href="/cart" aria-label="Cart" className="opacity-60 hover:opacity-100 transition-opacity duration-200">
        <ShoppingCart size={16} strokeWidth={1.5} />
      </Link>
      <button onClick={onMenuOpen} aria-label="Open menu" className="md:hidden opacity-60 hover:opacity-100 transition-opacity duration-200">
        <Menu size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}
