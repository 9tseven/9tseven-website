import ParticleCanvas from "./ParticleCanvas";

export default function ParticleField() {
  return (
    <section data-nav-theme="dark" className="relative bg-bg" style={{ height: "200vh" }}>
      <div className="sticky top-0 z-10 h-screen w-full">
        <ParticleCanvas />
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-0 flex justify-center px-6 pb-12 md:pb-10">
        <p className="max-w-xs font-mono whitespace-normal text-center text-sm font-normal leading-tight text-fg-faint md:max-w-none md:whitespace-nowrap md:text-sm md:leading-none">it is not the loss of individuality, but the community that they shape.</p>
      </div>
    </section>
  );
}
