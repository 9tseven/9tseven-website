import Image from "next/image";
import Tagline from "../Tagline";
import { IMAGES } from "./constants";

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

export default function InstagramMarquee() {
  return (
    <section data-nav-theme="dark" className="bg-bg">
      <div className="grid grid-cols-1 gap-10 px-6 py-20 md:grid-cols-3 md:gap-16 md:px-20 md:py-32">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-extrabold uppercase leading-[1.05] -tracking-wide text-fg sm:text-4xl md:text-5xl lg:text-6xl">Follow the runs. The mornings, the miles, the people in between — on Instagram.</h2>
        </div>

        <div className="md:flex md:justify-end">
          <Tagline href={INSTAGRAM_URL} bracketed tone="fg-muted">
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
          maskImage: "linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%)",
        }}
      >
        <div className="marquee-track flex w-max gap-4 md:gap-6">
          {[...IMAGES, ...IMAGES].map((img, i) => (
            <div key={`${img.id}-${i}`} className="relative h-56 w-auto shrink-0 overflow-hidden rounded-sm md:h-80" aria-hidden={i >= IMAGES.length ? true : undefined}>
              <Image src={img.src} alt={img.alt} sizes="(max-width: 768px) 224px, 320px" className="h-full w-auto object-cover" priority={false} />
            </div>
          ))}
        </div>

        {/* Gradient overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 bottom-20 opacity-80 md:opacity-0 transition-opacity duration-slow ease-out md:group-hover:opacity-100 md:group-focus-visible:opacity-100 md:bottom-32"
          style={{
            background: "linear-gradient(to right, color-mix(in srgb, var(--color-bg) 80%, transparent) 0%, color-mix(in srgb, var(--color-bg) 40%, transparent) 50%, color-mix(in srgb, var(--color-bg) 80%, transparent) 100%)",
          }}
        />

        {/* CTA  */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-20 flex translate-y-2 flex-col items-center justify-center gap-3 opacity-100 md:opacity-0 transition-all duration-slow ease-out md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100 md:bottom-32">
          <span className="text-2xl font-extrabold uppercase tracking-tight text-fg md:text-4xl">{INSTAGRAM_HANDLE}</span>
          <Tagline tone="fg-muted" className="inline-flex items-center gap-2">
            <InstagramGlyph className="h-4 w-4" />
            Visit our Instagram →
          </Tagline>
        </div>
      </a>
    </section>
  );
}
