import Link from "next/link";
import BrandLockup from "../BrandLockup";
import Newsletter from "../Newsletter";

const POLICY_LINKS = [
  { label: "Return & Exchange", href: "/returns" },
  { label: "Terms of Service", href: "/terms" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Shipping Policy", href: "/shipping" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/9tseven_/" },
  { label: "TikTok", href: "https://www.tiktok.com/@9tseven__" },
  { label: "YouTube", href: "https://www.youtube.com/@9TSEVEN_9T7" },
];

export default function Footer() {
  return (
    <footer data-nav-theme="light" className="bg-[#ebebeb] text-black overflow-hidden">
      <Newsletter />

      {/* Info + links row */}
      <div className="px-8 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="shrink-0">
          <p className="text-sm uppercase font-semibold">9TSEVEN</p>
          <p className="text-sm text-black/60 mt-1.5">Sølvgade 28, St. Th</p>
          <p className="text-sm text-black/60 mt-1.5">1307 København K</p>
          <p className="text-[0.6rem] tracking-widest text-black/35 mt-1.5">© 2026 · 9TSEVEN</p>
        </div>

        <nav className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-x-6 md:gap-y-2.5">
          <div className="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-2.5">
            {POLICY_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-[0.6rem] tracking-[0.14em] uppercase text-black/50 hover:text-black transition-colors duration-150">
                {link.label}
              </Link>
            ))}
          </div>
          <span className="w-full h-px bg-black/10 md:hidden" />
          <span className="hidden md:block w-px h-3 bg-black/15 self-center mx-1" />
          <div className="flex flex-wrap gap-x-6 gap-y-2.5">
            {SOCIAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-[0.6rem] tracking-[0.14em] uppercase text-black/50 hover:text-black transition-colors duration-150">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Big logo */}
      <BrandLockup variant="onLight" />
    </footer>
  );
}
