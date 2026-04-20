// app/components/BrandLockup/index.tsx

interface BrandLockupProps {
  variant: "onLight" | "onDark";
  className?: string;
}

export default function BrandLockup({ variant, className = "" }: BrandLockupProps) {
  const isLight = variant === "onLight";
  const colorClass = isLight ? "text-black" : "text-white";
  const imgInvert = isLight ? "invert" : "";

  return (
    <div
      className={`flex items-center justify-center gap-[4vw] px-[2vw] py-[4vw] overflow-hidden ${colorClass} ${className}`}
    >
      <img
        src="/Logo/9t7.svg"
        alt="9t7 logo"
        className={`w-[18vw] shrink-0 ${imgInvert} object-contain`}
      />
      <svg viewBox="0 0 163 174" className="w-[11vw] shrink-0" fill="currentColor" aria-hidden="true">
        <circle cx="80.45" cy="87.17" r="7.5" />
        <circle cx="152.70" cy="112.52" r="7.3" />
        <circle cx="124.35" cy="146.22" r="7.6" />
        <circle cx="152.70" cy="68.41" r="7.5" />
        <circle cx="128.64" cy="27.64" r="7.6" />
        <circle cx="10.64" cy="112.52" r="7.6" />
        <circle cx="33.79" cy="146.22" r="7.6" />
        <circle cx="10.64" cy="68.41" r="7.6" />
        <circle cx="30.79" cy="27.81" r="7.6" />
        <circle cx="80.29" cy="9.64" r="7.3" />
        <circle cx="80.29" cy="162.72" r="7.3" />
      </svg>
      <span
        className="text-[13.5vw] font-extrabold leading-none whitespace-nowrap shrink-0"
        style={{ letterSpacing: "-0.09em" }}
      >
        9TSEVEN
      </span>
    </div>
  );
}
