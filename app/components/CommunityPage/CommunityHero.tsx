import Image from "next/image";

export default function CommunityHero() {
  return (
    <section data-nav-theme="light" className="relative w-screen h-screen min-h-176 flex items-center justify-center overflow-hidden">
      <Image src="/images/PhotoSection/photo-section6.webp" alt="Community Hero" fill priority sizes="100vw" quality={65} className="pt-20 object-cover object-[center_60%]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold leading-none tracking-tight text-white md:text-6xl lg:text-[10rem]">Community</h1>
      </div>
      <div className="absolute bottom-25 flex flex-col items-center">
        <p className="text-lg font-black tracking-tight text-white uppercase">More Than Running</p>
      </div>
      <div className="absolute top-25 flex flex-col items-center">
        <p className="text-lg font-black tracking-tight text-white uppercase">9TSEVEN - 2026</p>
      </div>
    </section>
  );
}
