import Link from "next/link";
import BrandLockup from "../BrandLockup";
import Newsletter from "../Newsletter";
import Tagline from "../Tagline";

const POLICY_LINKS = [
  { label: "Return & Exchange", href: "/returns" },
  { label: "Terms of Service", href: "/terms" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Shipping Policy", href: "/shipping" },
];

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M544.5 273.9C500.5 274 457.5 260.3 421.7 234.7L421.7 413.4C421.7 446.5 411.6 478.8 392.7 506C373.8 533.2 347.1 554 316.1 565.6C285.1 577.2 251.3 579.1 219.2 570.9C187.1 562.7 158.3 545 136.5 520.1C114.7 495.2 101.2 464.1 97.5 431.2C93.8 398.3 100.4 365.1 116.1 336C131.8 306.9 156.1 283.3 185.7 268.3C215.3 253.3 248.6 247.8 281.4 252.3L281.4 342.2C266.4 337.5 250.3 337.6 235.4 342.6C220.5 347.6 207.5 357.2 198.4 369.9C189.3 382.6 184.4 398 184.5 413.8C184.6 429.6 189.7 444.8 199 457.5C208.3 470.2 221.4 479.6 236.4 484.4C251.4 489.2 267.5 489.2 282.4 484.3C297.3 479.4 310.4 469.9 319.6 457.2C328.8 444.5 333.8 429.1 333.8 413.4L333.8 64L421.8 64C421.7 71.4 422.4 78.9 423.7 86.2C426.8 102.5 433.1 118.1 442.4 131.9C451.7 145.7 463.7 157.5 477.6 166.5C497.5 179.6 520.8 186.6 544.6 186.6L544.6 274z" />
    </svg>
  );
}

function YouTubeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M581.7 188.1C575.5 164.4 556.9 145.8 533.4 139.5C490.9 128 320.1 128 320.1 128C320.1 128 149.3 128 106.7 139.5C83.2 145.8 64.7 164.4 58.4 188.1C47 231 47 320.4 47 320.4C47 320.4 47 409.8 58.4 452.7C64.7 476.3 83.2 494.2 106.7 500.5C149.3 512 320.1 512 320.1 512C320.1 512 490.9 512 533.5 500.5C557 494.2 575.5 476.3 581.8 452.7C593.2 409.8 593.2 320.4 593.2 320.4C593.2 320.4 593.2 231 581.8 188.1zM264.2 401.6L264.2 239.2L406.9 320.4L264.2 401.6z" />
    </svg>
  );
}

const SOCIAL_ICON_CLASS = "h-3.5 w-3.5";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/9tseven_/", Icon: InstagramGlyph },
  { label: "TikTok", href: "https://www.tiktok.com/@9tseven__", Icon: TikTokGlyph },
  { label: "YouTube", href: "https://www.youtube.com/@9TSEVEN_9T7", Icon: YouTubeGlyph },
];

export default function Footer() {
  return (
    <footer data-nav-theme="light" className="bg-grey text-ink overflow-hidden">
      <Newsletter />

      {/* Info + links row */}
      <div className="px-8 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="shrink-0">
          <p className="text-sm uppercase font-semibold">9TSEVEN</p>
          <p className="text-sm text-ink-subtle mt-1.5">Sølvgade 28, St. Th</p>
          <p className="text-sm text-ink-subtle mt-1.5">1307 København K</p>
          <p className="text-sm text-ink-subtle mt-1.5">Info@9tseven.com</p>
          <Tagline tone="ink-faint" className="block text-[0.6rem] mt-1.5 normal-case">
            © 2026 · 9TSEVEN
          </Tagline>
        </div>

        <nav className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-x-6 md:gap-y-2.5">
          <div className="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-2.5">
            {POLICY_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-[0.6rem] tracking-label uppercase text-ink-subtle hover:text-ink transition-colors duration-fast">
                {link.label}
              </Link>
            ))}
          </div>
          <span className="w-full h-px bg-tint-hover md:hidden" />
          <span className="hidden md:block w-px h-3 bg-tint-hover self-center mx-1" />
          <div className="flex flex-wrap gap-x-6 gap-y-2.5">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <Link key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="inline-flex items-center gap-1.5 text-[0.6rem] tracking-label uppercase text-ink-subtle hover:text-ink transition-colors duration-fast">
                <Icon className={SOCIAL_ICON_CLASS} />
                {label}
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
