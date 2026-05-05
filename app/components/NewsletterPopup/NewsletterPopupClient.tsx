"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import Image from "next/image";
import type { BannerImage } from "@/app/lib/banner";

interface NewsletterPopupClientProps {
  title: string;
  body: string;
  image: BannerImage;
}

const SEEN_KEY = "newsletterPopupSeen";
const LOAD_KEY = "loadScreenSeen";
const LOAD_POLL_MS = 100;
const LOAD_POLL_TIMEOUT_MS = 8000;

type State = { kind: "idle" | "loading" | "success" | "already" } | { kind: "error"; message: string };

const BUTTON_LABEL = {
  idle: "Sign up",
  loading: "Signing up",
  success: "Subscribed",
  already: "Already signed up",
  error: "Error signing up",
} as const;

export default function NewsletterPopupClient({ title, body, image }: NewsletterPopupClientProps) {
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
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

  useEffect(() => {
    if (state.kind !== "error") return;
    const id = setTimeout(() => setState({ kind: "idle" }), 5000);
    return () => clearTimeout(id);
  }, [state.kind]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState({ kind: "loading" });
    const result = await subscribeToNewsletter(email);
    if (result.ok) {
      setState({ kind: result.alreadySubscribed ? "already" : "success" });
      setEmail("");
    } else {
      setState({ kind: "error", message: result.error });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-modal="true" aria-labelledby="newsletter-popup-title" className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-6" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
          <motion.div ref={dialogRef} onClick={(e) => e.stopPropagation()} className="relative w-[min(92vw,56rem)] bg-white text-black shadow-2xl grid grid-cols-2 gap-[clamp(0.25rem,0.5vw,0.5rem)]" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25, ease: "easeOut" }}>
            <Image src={image.url} alt={image.alt} width={image.width} height={image.height} className="w-full h-full object-cover" />
            <div className="px-[clamp(1.25rem,3vw,3rem)] py-[clamp(1.75rem,3.5vw,3.5rem)] grid">
              <div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="absolute top-[clamp(0.5rem,1vw,1rem)] right-[clamp(0.5rem,1vw,1rem)] w-[clamp(1.75rem,2.5vw,2.5rem)] h-[clamp(1.75rem,2.5vw,2.5rem)] flex items-center justify-center text-black/60 hover:text-black transition-colors duration-150 text-[clamp(1rem,1.5vw,1.5rem)] leading-none">
                  ×
                </button>
                <h2 id="newsletter-popup-title" className="text-[clamp(0.75rem,1.1vw,1rem)] font-bold tracking-[0.14em] uppercase mb-[clamp(0.5rem,1vw,1rem)]">
                  {title}
                </h2>
                <p className="text-[clamp(0.7rem,0.95vw,0.9rem)] tracking-[0.08em] text-black/60 mb-[clamp(1rem,2vw,2rem)] leading-relaxed">{body}</p>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-[clamp(0.375rem,0.6vw,0.625rem)] self-end">
                <input ref={inputRef} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ENTER EMAIL" className="font-mono w-full bg-white px-4 py-2 text-[16px] md:px-[clamp(1rem,1.5vw,1.75rem)] md:py-[clamp(0.6rem,0.9vw,1rem)] md:text-[clamp(0.7rem,0.85vw,0.875rem)] tracking-[0.14em] uppercase placeholder:text-black/30 outline-none border border-black/8" />
                <button type="submit" disabled={state.kind === "loading"} className="bg-black text-white px-7 py-2 text-[16px] md:px-[clamp(1.5rem,2.5vw,2.75rem)] md:py-[clamp(0.6rem,0.9vw,1rem)] md:text-[clamp(0.7rem,0.85vw,0.875rem)] tracking-[0.14em] uppercase font-semibold hover:bg-black/80 transition-colors duration-150 w-full text-center">
                  {BUTTON_LABEL[state.kind]}
                </button>
              </form>
              {state.kind === "error" && <p className="mt-[clamp(0.5rem,1vw,1rem)] text-[clamp(0.6rem,0.8vw,0.75rem)] tracking-[0.14em] uppercase text-red-700">{state.message}</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
