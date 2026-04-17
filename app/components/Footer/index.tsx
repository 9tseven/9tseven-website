"use client";

import Link from "next/link";
import { useState } from "react";

const POLICY_LINKS = [
  { label: "Return & Exchange", href: "/returns" },
  { label: "Terms of Service", href: "/terms" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Shipping Policy", href: "/shipping" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/9tseven_/", external: true },
  { label: "TikTok", href: "https://www.tiktok.com/@9tseven__", external: true },
  { label: "YouTube", href: "https://www.youtube.com/@9TSEVEN_9T7", external: true },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-[#ebebeb] text-black overflow-hidden">
      {/* Newsletter */}
      <div className="px-8 py-16 border-b border-black/10">
        <h2 className="text-sm font-bold tracking-[0.14em] uppercase mb-1.5">Join the Community</h2>
        <p className="text-[0.7rem] tracking-[0.08em] text-black/45 mb-5">Sign up to the newsletter and join the community</p>
        <form className="flex" onSubmit={(e) => e.preventDefault()}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ENTER EMAIL" className="flex-1 bg-white px-4 py-3 text-[0.65rem] tracking-[0.14em] uppercase placeholder:text-black/30 outline-none border border-black/8 border-r-0" />
          <button type="submit" className="bg-black text-white px-7 py-3 text-[0.65rem] tracking-[0.14em] uppercase font-semibold hover:bg-black/80 transition-colors duration-150 whitespace-nowrap">
            Sign Up
          </button>
        </form>
      </div>

      {/* Info + links row */}
      <div className="px-8 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8 border-black/10">
        <div className="shrink-0">
          <p className="text-sm uppercase font-semibold">9TSEVEN</p>
          <p className="text-sm text-black/60 mt-1.5">Sølvgade 28, St. Th</p>
          <p className="text-sm text-black/60 mt-1.5">1307 København K</p>
          <p className="text-[0.6rem] tracking-widest text-black/35 mt-1.5">© 2025 · 9TSEVEN</p>
        </div>

        <nav className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-x-6 md:gap-y-2.5">
          <div className="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-2.5">
            {POLICY_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-[0.6rem] tracking-[0.14em] uppercase text-black/50 hover:text-black transition-colors duration-150">
                {link.label}
              </Link>
            ))}
          </div>
          <span className="w-full h-px bg-black/10 md:hidden" />
          <span className="hidden md:block w-px h-3 bg-black/15 self-center mx-1" />
          <div className="flex flex-wrap gap-x-6 gap-y-2.5">
            {SOCIAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-[0.6rem] tracking-[0.14em] uppercase text-black/50 hover:text-black transition-colors duration-150">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Big logo */}
      <div className="flex items-center justify-center gap-[4vw] px-[2vw] py-[4vw] overflow-hidden">
        <img src="/Logo/9t7.svg" alt="9t7 logo" className="w-[18vw] shrink-0 invert object-contain" />
        <svg viewBox="0 0 163 174" className="w-[11vw] shrink-0" fill="black" aria-hidden="true">
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
        <span className="text-[13.5vw] font-extrabold leading-none whitespace-nowrap shrink-0 text-black" style={{ letterSpacing: "-0.09em" }}>
          9TSEVEN
        </span>
      </div>
    </footer>
  );
}
