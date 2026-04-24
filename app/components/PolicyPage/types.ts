export const POLICY_SLUGS = ["faq", "privacy", "returns", "shipping", "terms"] as const;

export type PolicySlug = (typeof POLICY_SLUGS)[number];

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ShippingRate {
  region: string;
  estimatedDelivery: string;
  standardShipping: string;
}

export interface PolicySection {
  heading: string;
  paragraphs?: string[];
  note?: string;
  rates?: ShippingRate[];
  contact?: Record<string, string>;
}

export interface PolicyPageData {
  title: string;
  accordion: boolean;
  lastUpdated?: string;
  intro?: string[];
  items?: FaqItem[];
  sections?: PolicySection[];
}
