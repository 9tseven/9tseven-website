import ParticleCanvas from "./ParticleCanvas";

export default function ParticleField() {
  return (
    <section data-nav-theme="dark" className="relative bg-black" style={{ height: "200vh" }}>
      <div className="sticky top-0 z-10 h-screen w-full">
        <ParticleCanvas />
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-0 flex justify-center px-6 pb-12 md:pb-10">
        <p className="font-mono whitespace-nowrap text-center text-sm font-normal leading-none text-white/40 md:text-sm">it is not the loss of individuality, but the community that they shape.</p>
      </div>
    </section>
  );
}
