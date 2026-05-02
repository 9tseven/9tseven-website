import type { Metadata } from "next";
import PolicyPage from "@/app/components/PolicyPage";
import { POLICY_SLUGS, type PolicySlug } from "@/app/components/PolicyPage/types";
import { getPolicies } from "@/app/lib/policies";

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
  const policies = await getPolicies();
  return { title: `${policies[slug].title} – 9TSEVEN` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: PolicySlug }>;
}) {
  const { slug } = await params;
  const policies = await getPolicies();
  return <PolicyPage data={policies[slug]} />;
}
