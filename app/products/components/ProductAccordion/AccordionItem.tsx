"use client";

import type { ReactNode } from "react";
import { useId } from "react";

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export default function AccordionItem({ title, isOpen, onToggle, children }: AccordionItemProps) {
  const bodyId = useId();
  const headerId = useId();

  return (
    <div className="border-b border-black/8 last:border-b-0">
      <button
        id={headerId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-black/60">{title}</span>
        <span className="text-[10px] text-black/60" aria-hidden="true">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      <div
        id={bodyId}
        role="region"
        aria-labelledby={headerId}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="text-xs text-black/70 leading-relaxed pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
