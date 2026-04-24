import type { Metadata } from "next";
import PolicyPage from "@/app/components/PolicyPage";
import { POLICY_SLUGS, type PolicyPageData, type PolicySlug } from "@/app/components/PolicyPage/types";
import faq from "@/policies/faq.json";
import privacy from "@/policies/privacy.json";
import returns from "@/policies/returns.json";
import shipping from "@/policies/shipping.json";
import terms from "@/policies/terms.json";

const POLICIES: Record<PolicySlug, PolicyPageData> = {
  faq: faq as PolicyPageData,
  privacy: privacy as PolicyPageData,
  returns: returns as PolicyPageData,
  shipping: shipping as PolicyPageData,
  terms: terms as PolicyPageData,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: PolicySlug }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${POLICIES[slug].title} – 9TSEVEN` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: PolicySlug }>;
}) {
  const { slug } = await params;
  return <PolicyPage data={POLICIES[slug]} />;
}
