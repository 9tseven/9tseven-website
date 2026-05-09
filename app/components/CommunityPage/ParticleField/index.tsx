import ParticleCanvas from "./ParticleCanvas";

export default function ParticleField() {
  return (
    <section data-nav-theme="dark" className="relative bg-bg" style={{ height: "200vh" }}>
      <div className="sticky top-0 z-10 h-screen w-full">
        <ParticleCanvas />
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-0 flex justify-center px-6 pb-12 md:pb-10">
        <p className="max-w-xs md:max-w-none font-mono whitespace-normal text-center text-sm font-normal leading-tight text-fg-faint md:whitespace-nowrap md:text-sm md:leading-none">"We gather, not to lose ourselves, but to be seen more clearly."</p>
      </div>
    </section>
  );
}
