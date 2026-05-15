import Image from "next/image";
import Tagline from "../Tagline";
import { getCommunityImages } from "@/app/lib/community";

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

const INSTAGRAM_URL = "https://www.instagram.com/9tseven_/";
const INSTAGRAM_HANDLE = "@9tseven_";

type Theme = "dark" | "light";

interface Props {
  /** `dark` = black bg + white fg (default). `light` = white bg + black ink. */
  theme?: Theme;
}

const THEME = {
  dark: {
    navTheme: "dark",
    section: "bg-bg",
    heading: "text-fg",
    headlineTone: "fg-muted" as const,
    ctaHandle: "text-fg",
    ctaTagline: "fg-muted" as const,
    overlayColor: "var(--color-bg)",
  },
  light: {
    navTheme: "light",
    section: "bg-white",
    heading: "text-ink",
    headlineTone: "ink-muted" as const,
    ctaHandle: "text-fg",
    ctaTagline: "fg-muted" as const,
    overlayColor: "var(--color-bg)",
  },
} satisfies Record<Theme, unknown>;

export default async function InstagramMarquee({ theme = "dark" }: Props = {}) {
  const images = await getCommunityImages();
  if (images.length === 0) return null;

  const t = THEME[theme];

  return (
    <section data-nav-theme={t.navTheme} className={t.section}>
      <div className="grid grid-cols-1 gap-2 px-6 py-20 md:grid-cols-3 md:gap-16 md:px-20 md:py-32">
        <div className="md:col-span-2">
          <h2 className={`text-3xl font-extrabold uppercase leading-[1.05] -tracking-wide ${t.heading} sm:text-4xl md:text-5xl lg:text-6xl`}>Follow the runs. The mornings, the miles, the people in between — on Instagram.</h2>
        </div>

        <div className="-order-1 md:order-1 md:flex md:justify-end">
          <Tagline href={INSTAGRAM_URL} bracketed tone={t.headlineTone}>
            On Instagram
          </Tagline>
        </div>
      </div>

      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit 9tseven on Instagram"
        className="marquee-container group relative block overflow-hidden pb-20 outline-none md:pb-32"
        style={{
          maskImage: "linear-gradient(to right, transparent 0, black 160px, black calc(100% - 160px), transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0, black 160px, black calc(100% - 160px), transparent 100%)",
        }}
      >
        <div className="marquee-track flex w-max gap-1 md:gap-2.5">
          {[...images, ...images].map((img, i) => (
            <div key={`${img.id}-${i}`} className="relative aspect-square h-56 shrink-0 overflow-hidden rounded-sm transition-transform duration-slow ease-out md:h-80 md:group-hover:scale-[1] md:group-focus-visible:scale-[0.98]" aria-hidden={i >= images.length ? true : undefined}>
              <Image src={img.url} alt={img.alt} width={img.width} height={img.height} sizes="(max-width: 768px) 224px, 320px" quality={65} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        {/* Gradient overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-40 top-0 bottom-20 opacity-80 md:opacity-0 transition-opacity duration-slow ease-out md:group-hover:opacity-100 md:group-focus-visible:opacity-100 md:bottom-32"
          style={{
            background: `radial-gradient(ellipse 50% 65% at center, color-mix(in srgb, ${t.overlayColor} 80%, transparent) 0%, color-mix(in srgb, ${t.overlayColor} 35%, transparent) 60%, color-mix(in srgb, ${t.overlayColor} 5%, transparent) 100%)`,
            maskImage: "linear-gradient(to bottom, transparent 0, black 96px, black calc(100% - 96px), transparent 100%), linear-gradient(to right, transparent 0, black 200px, black calc(100% - 200px), transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, black 96px, black calc(100% - 96px), transparent 100%), linear-gradient(to right, transparent 0, black 200px, black calc(100% - 200px), transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />

        {/* CTA  */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-20 flex translate-y-2 flex-col items-center justify-center gap-3 opacity-100 md:opacity-0 transition-all duration-slow ease-out md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100 md:bottom-32">
          <span className={`text-2xl font-extrabold uppercase tracking-tight ${t.ctaHandle} md:text-4xl`}>{INSTAGRAM_HANDLE}</span>
          <Tagline tone={t.ctaTagline} className="inline-flex items-center gap-2">
            <InstagramGlyph className="h-4 w-4" />
            Visit our Instagram →
          </Tagline>
        </div>
      </a>
    </section>
  );
}
