import Image from "next/image";
import { IMAGES } from "./constants";

export default function InstagramMarquee() {
  return (
    <section data-nav-theme="dark" className="bg-black">
      <div className="grid grid-cols-1 gap-10 px-6 py-20 md:grid-cols-3 md:gap-16 md:px-20 md:py-32">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-extrabold uppercase leading-[1.05] tracking-[-0.01em] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Follow the runs. The mornings, the miles, the people in between — on Instagram.
          </h2>
        </div>

        <div className="md:flex md:justify-end">
          <span className="font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-white/70">
            (&nbsp;&nbsp;&nbsp;On Instagram&nbsp;&nbsp;&nbsp;)
          </span>
        </div>
      </div>

      <div
        className="marquee-container relative overflow-hidden pb-20 md:pb-32"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%)",
        }}
      >
        <div className="marquee-track flex w-max gap-4 md:gap-6">
          {[...IMAGES, ...IMAGES].map((img, i) => (
            <div
              key={`${img.id}-${i}`}
              className="relative h-56 w-auto shrink-0 overflow-hidden rounded-sm md:h-80"
              aria-hidden={i >= IMAGES.length ? true : undefined}
            >
              <Image
                src={img.src}
                alt={img.alt}
                sizes="(max-width: 768px) 224px, 320px"
                className="h-full w-auto object-cover"
                priority={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
