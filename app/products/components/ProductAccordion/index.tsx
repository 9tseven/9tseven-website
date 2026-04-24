"use client";

import { useState } from "react";
import type { Product } from "../../../components/FeaturedProductsSection/types";
import AccordionItem from "@/app/components/Accordion/AccordionItem";
import { SHIPPING_CONTENT } from "./shippingContent";
import { MISSING_CONTENT } from "./fallbackContent";

type Section = "description" | "material" | "sizing" | "shipping";

interface ProductAccordionProps {
  product: Product;
}

export default function ProductAccordion({ product }: ProductAccordionProps) {
  const [open, setOpen] = useState<Section | null>(null);

  const toggle = (section: Section) => {
    setOpen((current) => (current === section ? null : section));
  };

  return (
    <div className="border-t border-black/8">
      <AccordionItem
        title="Description"
        isOpen={open === "description"}
        onToggle={() => toggle("description")}
      >
        {product.descriptionHtml ? (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        ) : (
          <p>{MISSING_CONTENT}</p>
        )}
      </AccordionItem>

      <AccordionItem
        title="Material"
        isOpen={open === "material"}
        onToggle={() => toggle("material")}
      >
        <p>{MISSING_CONTENT}</p>
      </AccordionItem>

      <AccordionItem
        title="Sizing"
        isOpen={open === "sizing"}
        onToggle={() => toggle("sizing")}
      >
        <p>{MISSING_CONTENT}</p>
      </AccordionItem>

      <AccordionItem
        title="Shipping"
        isOpen={open === "shipping"}
        onToggle={() => toggle("shipping")}
      >
        {SHIPPING_CONTENT}
      </AccordionItem>
    </div>
  );
}
