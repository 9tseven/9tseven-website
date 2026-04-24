import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_TOKEN;

if (!domain || !token) {
  throw new Error("Missing Shopify env variables");
}

export const shopifyClient = createStorefrontApiClient({
  storeDomain: domain,
  apiVersion: "2026-04",
  publicAccessToken: token,
});
