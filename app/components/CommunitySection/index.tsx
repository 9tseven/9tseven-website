"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import Link from "next/link";
import CirclesAnimation from "../CirclesAnimation";
import Tagline from "../Tagline";

export default function CommunitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.6, once: true });

  return (
    <section ref={sectionRef} data-nav-theme="light" className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-8">
        <div className="flex flex-col items-center gap-10 md:flex-row md:gap-0">
          {/* Heading */}
          <div className="flex-1">
            <Tagline>( COMMUNITY )</Tagline>
            <h2 className="text-5xl font-bold leading-none tracking-tight text-ink md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.5rem] mt-2">
              Community.
              <br />
              Create a space for inspiration &amp; human connection.
            </h2>
          </div>

          {/* Dots */}
          <div className="shrink-0">
            <CirclesAnimation active={inView} />
          </div>
        </div>

        {/* CTA link */}
        <Link href="/community" className="font-mono text-sm tracking-tight text-ink underline underline-offset-4 transition-opacity hover:opacity-50">
          READ MORE ABOUT THE COMMUNITY
        </Link>
      </div>
    </section>
  );
}
