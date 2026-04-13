// app/components/BrandStatementSection/index.tsx
import Image from "next/image";

export default function BrandStatementSection() {
  return (
    <section
      data-nav-theme="light"
      className="bg-white flex flex-col items-center px-10 pt-[90px] pb-[80px]"
    >
      {/* Brand line */}
      <p className="text-[10px] tracking-[0.22em] uppercase text-black/45 mb-[18px]">
        9TSEVEN©2025
      </p>

      {/* Middle row: Copenhagen | More than running | Denmark */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full mb-5">
        <span className="text-[9px] tracking-[0.28em] uppercase text-black/40">
          Copenhagen
        </span>
        <p className="text-[22px] tracking-[0.12em] uppercase font-light text-black/80 text-center px-8">
          More than running
        </p>
        <span className="text-[9px] tracking-[0.28em] uppercase text-black/40 text-right">
          Denmark
        </span>
      </div>

      {/* Body text */}
      <p className="text-[11px] leading-[1.8] tracking-[0.02em] text-black/45 max-w-[380px] text-center mb-[52px]">
        Rooted in identity, shaped by culture, and driven by community — our
        expression is a reflection of where we come from and where we&apos;re going.
      </p>

      {/* Logo */}
      <Image
        src="/Logo/9t7.svg"
        alt="9TSEVEN"
        width={80}
        height={80}
        className="opacity-25 w-20 h-auto"
      />
    </section>
  );
}
