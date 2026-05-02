"use server";

import { NEWSLETTER_SUBSCRIBE_MUTATION, type NewsletterSubscribeResponse } from "@/app/lib/queries/newletter";

const TOKEN_REFRESH_BUFFER_MS = 60_000;

export type SubscribeResult =
  | { ok: true; alreadySubscribed?: boolean }
  | { ok: false; error: string };

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

function readShopifyEnv(): { domain: string; clientId: string; clientSecret: string } {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!domain || !clientId || !clientSecret) {
    throw new Error("Missing Shopify env variables");
  }
  return { domain, clientId, clientSecret };
}

async function getAdminToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS) {
    return tokenCache.token;
  }

  const { domain, clientId, clientSecret } = readShopifyEnv();

  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopify token exchange failed: ${response.status}`);
  }

  const json = (await response.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return json.access_token;
}

export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  const trimmed = email.trim().toLowerCase();
  const { domain } = readShopifyEnv();
  const token = await getAdminToken();

  const response = await fetch(`https://${domain}/admin/api/2026-04/graphql.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: NEWSLETTER_SUBSCRIBE_MUTATION,
      variables: {
        input: {
          email: trimmed,
          emailMarketingConsent: {
            marketingState: "SUBSCRIBED",
            marketingOptInLevel: "SINGLE_OPT_IN",
          },
        },
      },
    }),
  });

  if (response.status === 401) {
    tokenCache = null;
    return { ok: false, error: "Could not sign up — please try again" };
  }

  if (!response.ok) {
    return { ok: false, error: "Could not sign up — please try again later" };
  }

  const json = (await response.json()) as NewsletterSubscribeResponse;
  const userErrors = json.data?.customerCreate.userErrors ?? [];

  if (userErrors.length > 0) {
    const message = userErrors[0].message;
    if (/taken|already/i.test(message)) {
      return { ok: true, alreadySubscribed: true };
    }
    return { ok: false, error: message };
  }

  return { ok: true };
}
