"use client";

import Link from "next/link";
import { useState } from "react";
import BrandLockup from "../BrandLockup";
import { body, header } from "motion/react-client";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

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
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    const result = await subscribeToNewsletter(email);
    if (result.ok) {
      setStatus(result.alreadySubscribed ? "already" : "success");
      setEmail("");
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  };

  return (
    <footer data-nav-theme="light" className="bg-[#ebebeb] text-black overflow-hidden">
      {/* Newsletter */}
      <div className="px-8 py-16 border-b border-black/10">
        <h2 className="text-sm font-bold tracking-[0.14em] uppercase mb-1.5">Join the Community</h2>
        <p className="text-[0.7rem] tracking-[0.08em] text-black/45 mb-5">Sign up to the newsletter and join the community</p>
        <form className="flex" onSubmit={handleSubmit}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ENTER EMAIL" className="font-mono flex-1 min-w-0 bg-white px-4 py-3 text-[16px] md:text-[0.65rem] tracking-[0.14em] uppercase placeholder:text-black/30 outline-none border border-black/8 border-r-0" />
          <button type="submit" disabled={status === "loading"} className="bg-black text-white px-7 py-3 text-[0.65rem] tracking-[0.14em] uppercase font-semibold hover:bg-black/80 transition-colors duration-150 whitespace-nowrap">
            <span className="md:hidden">{status === "loading" ? "Signing up" : "Sign up"}</span>
            <span className="hidden md:inline">{status === "loading" ? "Signing up" : status === "success" ? "Subscribed" : status === "already" ? "Already signed up" : status === "error" ? "Error signing up" : "Sign up"}</span>
          </button>
        </form>
        {status !== "idle" && status !== "loading" && (
          <p className={`md:hidden mt-3 text-[0.65rem] tracking-[0.14em] uppercase ${status === "error" ? "text-red-700" : "text-black/65"}`}>
            {status === "error" ? errorMessage : status === "already" ? "Already signed up" : "Subscribed"}
          </p>
        )}
        {status === "error" && errorMessage && <p className="hidden md:block mt-3 text-[0.65rem] tracking-[0.14em] uppercase text-red-700">{errorMessage}</p>}
      </div>

      {/* Info + links row */}
      <div className="px-8 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8 border-black/10">
        <div className="shrink-0">
          <p className="text-sm uppercase font-semibold">9TSEVEN</p>
          <p className="text-sm text-black/60 mt-1.5">Sølvgade 28, St. Th</p>
          <p className="text-sm text-black/60 mt-1.5">1307 København K</p>
          <p className="text-[0.6rem] tracking-widest text-black/35 mt-1.5">© 2026 · 9TSEVEN</p>
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
      <BrandLockup variant="onLight" />
    </footer>
  );
}
