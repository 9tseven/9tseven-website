// app/components/BrandStatementSection/index.tsx
import Image from "next/image";

export default function BrandStatementSection() {
  return (
    <section data-nav-theme="light" className="bg-white flex flex-col items-center px-10 pt-22.5 pb-20">
      {/* Brand line */}
      <p className="text-[10px] tracking-[0.22em] uppercase text-black/45 mb-4.5">9TSEVEN©2025</p>

      {/* Middle row: Copenhagen | More than running | Denmark */}
      <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center w-full mb-5">
        <span className="font-(family-name:--font-monsieur) text-[1.8rem] text-black/80">Copenhagen</span>
        <p className="font-(family-name:--font-monsieur) -order-1 md:order-0 whitespace-nowrap text-[2.3rem] font-normal text-black/80 text-center px-8">More Than Running</p>
        <span className="font-(family-name:--font-monsieur) text-[1.8rem] text-black/80 text-right">Denmark</span>
      </div>

      {/* Body text */}
      <p className="text-[11px] leading-[1.8] tracking-[0.02em] text-black/45 max-w-100 text-center mb-13">Rooted in identity, shaped by culture, and driven by community — our expression is a reflection of where we come from and where we&apos;re going.</p>

      {/* Logo */}
      <Image src="/images/Logo/9t7.svg" alt="9TSEVEN" width={80} height={80} className="w-20 h-auto invert" />
    </section>
  );
}
