"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import Image from "next/image";
import type { BannerImage } from "@/app/lib/banner";
import { NEWSLETTER_BUTTON_LABEL, useNewsletterForm } from "@/app/components/Newsletter/useNewsletterForm";

interface NewsletterPopupClientProps {
  title: string;
  body: string;
  image: BannerImage;
}

const SEEN_KEY = "newsletterPopupSeen";
const LOAD_KEY = "loadScreenSeen";
const LOAD_POLL_MS = 100;
const LOAD_POLL_TIMEOUT_MS = 8000;

export default function NewsletterPopupClient({ title, body, image }: NewsletterPopupClientProps) {
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const { email, setEmail, state, handleSubmit } = useNewsletterForm();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) return;

    const tryOpen = () => {
      if (!sessionStorage.getItem(LOAD_KEY)) return false;
      sessionStorage.setItem(SEEN_KEY, "1");
      setOpen(true);
      return true;
    };

    if (tryOpen()) return;
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += LOAD_POLL_MS;
      if (tryOpen() || elapsed >= LOAD_POLL_TIMEOUT_MS) clearInterval(id);
    }, LOAD_POLL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>('input,button,[href],[tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-modal="true" aria-labelledby="newsletter-popup-title" className="fixed inset-0 z-90 flex items-center justify-center bg-bg/60 px-6" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
          <motion.div ref={dialogRef} onClick={(e) => e.stopPropagation()} className="relative w-[min(92vw,56rem)] bg-white text-ink shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-[clamp(0.25rem,0.5vw,0.5rem)]" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25, ease: "easeOut" }}>
            <Image src={image.url} alt={image.alt} width={image.width} height={image.height} className="w-full h-full object-cover max-h-[40vh] md:max-h-none" />
            <div className="px-[clamp(1.25rem,3vw,3rem)] py-[clamp(1.75rem,3.5vw,3.5rem)] grid">
              <div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="absolute top-[clamp(0.5rem,1vw,1rem)] right-[clamp(0.5rem,1vw,1rem)] w-[clamp(1.75rem,2.5vw,2.5rem)] h-[clamp(1.75rem,2.5vw,2.5rem)] flex items-center justify-center rounded-full bg-ink md:bg-transparent text-fg md:text-ink-subtle hover:bg-ink/80 md:hover:bg-transparent md:hover:text-ink transition-colors duration-fast">
                  <svg viewBox="0 0 24 24" className="w-1/2 h-1/2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6 L18 18 M18 6 L6 18" />
                  </svg>
                </button>
                <h2 id="newsletter-popup-title" className="text-[clamp(0.75rem,1.1vw,1rem)] font-bold tracking-label uppercase mb-[clamp(0.5rem,1vw,1rem)]">
                  {title}
                </h2>
                <p className="text-[clamp(0.7rem,0.95vw,0.9rem)] tracking-label text-ink-subtle mb-[clamp(1rem,2vw,2rem)] leading-relaxed">{body}</p>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-[clamp(0.375rem,0.6vw,0.625rem)] self-end">
                <input ref={inputRef} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ENTER EMAIL" className="font-mono w-full bg-white px-4 py-2 text-[16px] md:px-[clamp(1rem,1.5vw,1.75rem)] md:py-[clamp(0.6rem,0.9vw,1rem)] md:text-[clamp(0.7rem,0.85vw,0.875rem)] tracking-label uppercase placeholder:text-ink-faint outline-none border border-ink/10" />
                <button type="submit" disabled={state.kind === "loading"} className="bg-ink text-fg px-7 py-2 text-[16px] md:px-[clamp(1.5rem,2.5vw,2.75rem)] md:py-[clamp(0.6rem,0.9vw,1rem)] md:text-[clamp(0.7rem,0.85vw,0.875rem)] tracking-label uppercase font-semibold hover:bg-ink/80 transition-colors duration-fast w-full text-center">
                  {NEWSLETTER_BUTTON_LABEL[state.kind]}
                </button>
              </form>
              {state.kind === "error" && <p className="mt-[clamp(0.5rem,1vw,1rem)] text-[clamp(0.6rem,0.8vw,0.75rem)] tracking-label uppercase text-red-700">{state.message}</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
