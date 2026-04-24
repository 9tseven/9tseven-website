"use client";

import { useState } from "react";
import AccordionItem from "@/app/components/Accordion/AccordionItem";
import type { FaqItem } from "./types";

interface FaqListProps {
  items: FaqItem[];
}

export default function FaqList({ items }: FaqListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="border-t border-black/8">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.question}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
        >
          <p>{item.answer}</p>
        </AccordionItem>
      ))}
    </div>
  );
}
