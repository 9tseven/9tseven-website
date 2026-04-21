import ParticleCanvas from "./ParticleCanvas";

export default function ParticleField() {
  return (
    <section data-nav-theme="dark" className="bg-black" style={{ height: "200vh" }}>
      <div className="sticky top-0 h-screen w-full">
        <ParticleCanvas />
      </div>
    </section>
  );
}
