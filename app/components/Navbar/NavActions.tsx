import { Menu } from "lucide-react";

interface NavActionsProps {
  onMenuOpen: () => void;
}

export default function NavActions({ onMenuOpen }: NavActionsProps) {
  return (
    <button
      onClick={onMenuOpen}
      aria-label="Open menu"
      className="md:hidden opacity-60 hover:opacity-100 transition-opacity duration-200"
    >
      <Menu size={18} strokeWidth={1.5} />
    </button>
  );
}
