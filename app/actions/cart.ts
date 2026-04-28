"use server";

import { cookies } from "next/headers";
import { shopifyClient } from "@/app/lib/shopify";
import { CART_QUERY, CART_CREATE_MUTATION, CART_LINES_ADD_MUTATION, CART_LINES_REMOVE_MUTATION, CART_LINES_UPDATE_MUTATION, type RawCart } from "@/app/lib/queries/cart";
import type { Cart } from "@/app/lib/cart-types";

const CART_COOKIE_NAME = "shopify_cart_id";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

type ShopifyUserError = { field: string[] | null; message: string };

function flattenCart(raw: RawCart): Cart {
  return {
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    cost: raw.cost,
    lines: raw.lines.edges.map((edge) => edge.node),
  };
}

async function readCartIdCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE_NAME)?.value ?? null;
}

async function writeCartIdCookie(id: string): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE_NAME, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

async function deleteCartIdCookie(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE_NAME);
}

function assertNoUserErrors(errors: ShopifyUserError[] | undefined, op: string): void {
  if (errors && errors.length > 0) {
    throw new Error(`Shopify ${op} userErrors: ${JSON.stringify(errors)}`);
  }
}

export async function getCart(): Promise<Cart | null> {
  const cartId = await readCartIdCookie();
  if (!cartId) return null;

  console.log("Getting cart");

  const { data, errors } = await shopifyClient.request(CART_QUERY, {
    variables: { id: cartId },
  });
  if (errors) {
    throw new Error(`Shopify CART_QUERY failed: ${JSON.stringify(errors)}`);
  }

  const raw = (data as { cart: RawCart | null } | undefined)?.cart ?? null;
  if (!raw) {
    await deleteCartIdCookie();
    return null;
  }

  return flattenCart(raw);
}

export async function addToCart(merchandiseId: string, quantity: number): Promise<Cart> {
  const existingCartId = await readCartIdCookie();

  if (!existingCartId) {
    const { data, errors } = await shopifyClient.request(CART_CREATE_MUTATION, {
      variables: { input: { lines: [{ merchandiseId, quantity }] } },
    });
    if (errors) {
      throw new Error(`Shopify CART_CREATE failed: ${JSON.stringify(errors)}`);
    }
    const payload = (data as { cartCreate: { cart: RawCart; userErrors: ShopifyUserError[] } } | undefined)?.cartCreate;
    assertNoUserErrors(payload?.userErrors, "cartCreate");
    if (!payload?.cart) throw new Error("Shopify cartCreate returned no cart");

    await writeCartIdCookie(payload.cart.id);
    return flattenCart(payload.cart);
  }

  const { data, errors } = await shopifyClient.request(CART_LINES_ADD_MUTATION, {
    variables: { cartId: existingCartId, lines: [{ merchandiseId, quantity }] },
  });
  if (errors) {
    throw new Error(`Shopify CART_LINES_ADD failed: ${JSON.stringify(errors)}`);
  }
  const payload = (data as { cartLinesAdd: { cart: RawCart; userErrors: ShopifyUserError[] } } | undefined)?.cartLinesAdd;
  assertNoUserErrors(payload?.userErrors, "cartLinesAdd");
  if (!payload?.cart) throw new Error("Shopify cartLinesAdd returned no cart");

  return flattenCart(payload.cart);
}

export async function removeFromCart(lineId: string): Promise<Cart> {
  const cartId = await readCartIdCookie();
  if (!cartId) throw new Error("No cart to remove from");

  const { data, errors } = await shopifyClient.request(CART_LINES_REMOVE_MUTATION, {
    variables: { cartId, lineIds: [lineId] },
  });
  if (errors) {
    throw new Error(`Shopify CART_LINES_REMOVE failed: ${JSON.stringify(errors)}`);
  }
  const payload = (data as { cartLinesRemove: { cart: RawCart; userErrors: ShopifyUserError[] } } | undefined)?.cartLinesRemove;
  assertNoUserErrors(payload?.userErrors, "cartLinesRemove");
  if (!payload?.cart) throw new Error("Shopify cartLinesRemove returned no cart");

  return flattenCart(payload.cart);
}

export async function updateCartLine(lineId: string, quantity: number): Promise<Cart> {
  if (quantity < 1) {
    return removeFromCart(lineId);
  }

  const cartId = await readCartIdCookie();
  if (!cartId) throw new Error("No cart to update");

  const { data, errors } = await shopifyClient.request(CART_LINES_UPDATE_MUTATION, {
    variables: { cartId, lines: [{ id: lineId, quantity }] },
  });
  if (errors) {
    throw new Error(`Shopify CART_LINES_UPDATE failed: ${JSON.stringify(errors)}`);
  }
  const payload = (data as { cartLinesUpdate: { cart: RawCart; userErrors: ShopifyUserError[] } } | undefined)?.cartLinesUpdate;
  assertNoUserErrors(payload?.userErrors, "cartLinesUpdate");
  if (!payload?.cart) throw new Error("Shopify cartLinesUpdate returned no cart");

  return flattenCart(payload.cart);
}
