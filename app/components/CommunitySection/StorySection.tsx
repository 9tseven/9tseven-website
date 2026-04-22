export default function StorySection() {
  return (
    <section data-nav-theme="light" className="bg-white px-6 py-20 md:px-20 md:py-32">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-16">
        <div>
          <span className="font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-black/70">(&nbsp;&nbsp;&nbsp;Our Story&nbsp;&nbsp;&nbsp;)</span>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-3xl font-extrabold uppercase leading-[1.05] tracking-[-0.01em] text-black sm:text-4xl md:text-5xl lg:text-6xl">We started 9TSEVEN because the runs we wanted to be part of didn&apos;t exist yet. This is for the miles, the mornings, and the community we&apos;re building along the way.</h2>

          <div className="mt-10 grid grid-cols-1 gap-8 md:mt-14 md:grid-cols-2 md:gap-12">
            <div className="space-y-4 text-[13px] leading-[1.7] text-black/55 md:text-sm">
              <p>Copenhagen has no shortage of runners, but the culture around the sport felt closed off — PB-chasing, pace-obsessed, gear that looked like it belonged on a podium rather than a Sunday morning. We wanted somewhere you could show up, put in the work, and leave with people you actually wanted to see again next week.</p>
              <p>That&apos;s how the Sunday Socials started. No drop, no pace targets — just a loop through the city, coffee after, and space for everyone from first-timers to sub-three marathoners. It&apos;s the reason the brand exists, and it&apos;s still the thing we care most about.</p>
            </div>

            <div className="space-y-4 text-[13px] leading-[1.7] text-black/55 md:text-sm">
              <p>Around the Sundays, we build bigger moments. Marathon week activations, shakeout runs with visiting crews, pop-ups on race weekends, and capsule drops tied to the events that mean something to us. The gear comes from the runs, not the other way around.</p>
              <p>9TSEVEN is less a label and more an excuse to keep showing up. For the people already lacing up, and for anyone who&apos;s been waiting for a reason to start. The door stays open — we&apos;re just trying to widen it a little.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
