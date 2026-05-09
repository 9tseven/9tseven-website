// app/components/BrandStatementSection/index.tsx
import Image from "next/image";
import Tagline from "../Tagline";

export default function BrandStatementSection() {
  return (
    <section data-nav-theme="light" className="bg-white flex flex-col items-center px-10 pt-22.5 pb-20">
      {/* Brand line */}
      <Tagline tone="ink-subtle" className="block text-[10px] mb-4.5">
        9TSEVEN © 2025
      </Tagline>

      <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center w-full mb-5">
        <span className="font-display text-4xl text-ink-muted">Copenhagen</span>
        <p className="font-display -order-1 md:order-0 whitespace-nowrap text-5xl md:text-[6rem] font-normal text-ink-muted text-center px-8">More Than Running</p>
        <span className="font-display text-4xl text-ink-muted text-right">Denmark</span>
      </div>

      {/* Body text */}
      <p className="text-[11px] leading-[1.8] tracking-label text-ink-subtle max-w-100 text-center mb-13">Rooted in identity, shaped by culture, and driven by community. Our expression is a reflection of where we come from and where we&apos;re going.</p>

      {/* Logo */}
      <Image src="/images/Logo/9t7.svg" alt="9TSEVEN" width={80} height={80} className="w-20 h-auto invert" />
    </section>
  );
}
