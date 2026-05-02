import { cache } from "react";
import { shopifyClient } from "@/app/lib/shopify";
import { GET_POLICIES } from "@/app/lib/queries/policies";
import { POLICY_SLUGS, type PolicyPageData, type PolicySlug } from "@/app/components/PolicyPage/types";

type FieldNode = { key: string; value: string };
type PoliciesResponse = {
  metaobjects: { edges: { node: { fields: FieldNode[] } }[] };
};

const SLUG_SET = new Set<string>(POLICY_SLUGS);

function fieldMap(fields: FieldNode[]): Record<string, string> {
  return Object.fromEntries(fields.map((f) => [f.key, f.value]));
}

function toPolicyPageData(fields: Record<string, string>): PolicyPageData {
  const content = JSON.parse(fields.content);
  return { title: fields.title, accordion: fields.accordion === "true", ...content };
}

export const getPolicies = cache(async (): Promise<Record<PolicySlug, PolicyPageData>> => {
  const { data, errors } = await shopifyClient.request(GET_POLICIES);
  if (errors || !data) {
    throw new Error(`Failed to fetch policies from Shopify: ${JSON.stringify(errors)}`);
  }

  const result = Object.fromEntries(
    (data as PoliciesResponse).metaobjects.edges
      .map(({ node }) => fieldMap(node.fields))
      .filter((f) => SLUG_SET.has(f.policy_type))
      .map((f) => [f.policy_type as PolicySlug, toPolicyPageData(f)]),
  ) as Record<PolicySlug, PolicyPageData>;

  for (const slug of POLICY_SLUGS) {
    if (!result[slug]) throw new Error(`Missing Shopify policy metaobject for slug "${slug}"`);
  }
  return result;
});
