import Image from "next/image";

export default function CommunityHero() {
  return (
    <section data-nav-theme="light" className="relative flex items-center justify-center overflow-hidden">
      <Image src="/images/PhotoSection/photo-section6.webp" alt="Community Hero" width={1920} height={1080} className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold leading-none tracking-tight text-white md:text-6xl lg:text-[10rem]">Community</h1>
      </div>
      <div className="absolute bottom-2 flex flex-col items-center">
        <p className="text-lg font-black tracking-tight text-white uppercase">More Than Running</p>
      </div>
      <div className="absolute top-2 flex flex-col items-center">
        <p className="text-lg font-black tracking-tight text-white uppercase">@9TSEVEN - 2026</p>
      </div>
    </section>
  );
}
