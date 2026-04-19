"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import CirclesAnimation from "../CirclesAnimation";

const STORAGE_KEY = "loadScreenSeen";

export default function LoadScreen() {
  const [mounted, setMounted] = useState(true);
  const [active, setActive] = useState(false);
  const [slideUp, setSlideUp] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setMounted(false);
      return;
    }
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => setActive(true));
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = "";
    };
  }, []);

  const handleCirclesDone = () => {
    setTimeout(() => setSlideUp(true), 150);
  };

  const handleSlideDone = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    document.body.style.overflow = "";
    setMounted(false);
  };

  return (
    <AnimatePresence>
      {mounted && (
        <motion.div
          data-load-screen
          className="fixed inset-0 z-100 flex items-center justify-center bg-white"
          initial={{ y: 0 }}
          animate={{ y: slideUp ? "-100%" : 0 }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          onAnimationComplete={() => {
            if (slideUp) handleSlideDone();
          }}
        >
          <CirclesAnimation active={active} onComplete={handleCirclesDone} className="relative w-64 md:w-80 lg:w-96" stepDelay={0.12} dotDuration={0.25} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
