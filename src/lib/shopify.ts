/**
 * Sensual Sweets — Shopify Storefront API client.
 *
 * Minimal fetch wrapper around the Storefront GraphQL API plus the four cart
 * mutations the launch site needs. Keeps zero hard deps on `@shopify/*` so we
 * don't ship a heavier SDK for what is, at the end of the day, four POSTs.
 *
 * Maps `CartProductId` (the launch-site product slugs) to Shopify product
 * handles. The real product/variant/selling-plan IDs are resolved at runtime
 * the first time we need them — Shopify auto-generates handles from titles,
 * so as long as the products in the admin keep the launch-spec titles, the
 * mapping holds without code changes.
 */
import type { CartProductId } from "./cart-types";

export const STOREFRONT_API_VERSION = "2026-04";
const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN ?? "";
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? "";

export function isShopifyConfigured(): boolean {
  return Boolean(SHOPIFY_DOMAIN && STOREFRONT_TOKEN);
}

/**
 * Map launch-site product IDs to Shopify product handles. The handles are the
 * URL-slug Shopify derives from the product title; if a product is renamed in
 * the admin, update the handle here.
 *
 * `subscribe` is the same merchandise as `duo` plus a monthly selling plan —
 * resolved at runtime from the DUO product's `sellingPlanGroups`.
 */
export const PRODUCT_HANDLES: Record<
  Exclude<CartProductId, "subscribe">,
  string
> = {
  his: "his-drive-and-endurance",
  hers: "hers-sensation-and-mood",
  duo: "duo-bundle-his-hers",
  starter: "starter-set-trial-pack",
};

/** Heuristics for picking the right selling plan on the DUO product. */
const SUBSCRIBE_PLAN_NAME_HINTS = ["monthly", "month"];

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

class StorefrontError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "StorefrontError";
  }
}

async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!isShopifyConfigured()) {
    throw new StorefrontError(
      "Shopify Storefront API not configured (set NEXT_PUBLIC_SHOPIFY_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN).",
    );
  }
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/api/${STOREFRONT_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  if (!res.ok) {
    throw new StorefrontError(
      `Storefront API HTTP ${res.status}`,
      res.status,
    );
  }
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new StorefrontError(json.errors[0].message);
  }
  if (!json.data) {
    throw new StorefrontError("Storefront API returned no data");
  }
  return json.data;
}

// ---------------------------------------------------------------------------
// Catalog resolution
// ---------------------------------------------------------------------------

export interface ResolvedMerchandise {
  /** Shopify product variant GID (`gid://shopify/ProductVariant/...`). */
  variantId: string;
  /** Optional selling plan GID for subscriptions. */
  sellingPlanId?: string;
}

interface ProductByHandleResponse {
  product: {
    id: string;
    handle: string;
    variants: {
      edges: { node: { id: string } }[];
    };
    sellingPlanGroups: {
      edges: {
        node: {
          name: string;
          sellingPlans: {
            edges: { node: { id: string; name: string } }[];
          };
        };
      }[];
    };
  } | null;
}

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      variants(first: 1) {
        edges {
          node {
            id
          }
        }
      }
      sellingPlanGroups(first: 5) {
        edges {
          node {
            name
            sellingPlans(first: 5) {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Look up the variant ID (and, for `subscribe`, the matching selling plan ID)
 * for a given launch-site product ID. Returns `null` if the product hasn't
 * been published to the Headless channel yet — callers should handle this
 * gracefully (the cart falls back to a "not configured" state).
 */
export async function resolveMerchandise(
  id: CartProductId,
): Promise<ResolvedMerchandise | null> {
  // `subscribe` uses the DUO product with a monthly selling plan attached.
  const handle =
    id === "subscribe" ? PRODUCT_HANDLES.duo : PRODUCT_HANDLES[id];
  const data = await storefrontFetch<ProductByHandleResponse>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
  );
  const product = data.product;
  if (!product) return null;
  const variantId = product.variants.edges[0]?.node.id;
  if (!variantId) return null;

  if (id !== "subscribe") {
    return { variantId };
  }

  // Pick the most plausible monthly plan: matches a "monthly"/"month" hint in
  // either the group name or the plan name. Falls back to the first plan we
  // see — better to subscribe to *something* than fail silently.
  const groups = product.sellingPlanGroups.edges;
  for (const group of groups) {
    const plans = group.node.sellingPlans.edges;
    const named = plans.find((p) =>
      SUBSCRIBE_PLAN_NAME_HINTS.some(
        (hint) =>
          group.node.name.toLowerCase().includes(hint) ||
          p.node.name.toLowerCase().includes(hint),
      ),
    );
    if (named) return { variantId, sellingPlanId: named.node.id };
  }
  const fallback = groups[0]?.node.sellingPlans.edges[0]?.node.id;
  if (fallback) return { variantId, sellingPlanId: fallback };

  // No selling plan attached yet — caller will decide what to do.
  return { variantId };
}

// ---------------------------------------------------------------------------
// Cart mutations
// ---------------------------------------------------------------------------

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    subtotalAmount: { amount: string; currencyCode: string };
  };
  lines: ShopifyCartLine[];
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandiseId: string;
  sellingPlanId?: string;
}

interface RawCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    subtotalAmount: { amount: string; currencyCode: string };
  };
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        merchandise: { id: string };
        sellingPlanAllocation?: { sellingPlan: { id: string } } | null;
      };
    }[];
  };
}

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
            }
          }
          sellingPlanAllocation {
            sellingPlan {
              id
            }
          }
        }
      }
    }
  }
`;

function normalizeCart(raw: RawCart): ShopifyCart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    cost: raw.cost,
    lines: raw.lines.edges.map((edge) => ({
      id: edge.node.id,
      quantity: edge.node.quantity,
      merchandiseId: edge.node.merchandise.id,
      sellingPlanId: edge.node.sellingPlanAllocation?.sellingPlan.id,
    })),
  };
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
  sellingPlanId?: string;
}

export async function cartCreate(line: CartLineInput): Promise<ShopifyCart> {
  const data = await storefrontFetch<{
    cartCreate: { cart: RawCart | null; userErrors: { message: string }[] };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            ...CartFields
          }
          userErrors {
            message
          }
        }
      }
    `,
    {
      input: {
        lines: [
          {
            merchandiseId: line.merchandiseId,
            quantity: line.quantity,
            ...(line.sellingPlanId
              ? { sellingPlanId: line.sellingPlanId }
              : {}),
          },
        ],
      },
    },
  );
  const errs = data.cartCreate.userErrors;
  if (errs.length) throw new StorefrontError(errs[0].message);
  if (!data.cartCreate.cart) {
    throw new StorefrontError("cartCreate returned no cart");
  }
  return normalizeCart(data.cartCreate.cart);
}

export async function cartLinesAdd(
  cartId: string,
  line: CartLineInput,
): Promise<ShopifyCart> {
  const data = await storefrontFetch<{
    cartLinesAdd: { cart: RawCart | null; userErrors: { message: string }[] };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
          userErrors {
            message
          }
        }
      }
    `,
    {
      cartId,
      lines: [
        {
          merchandiseId: line.merchandiseId,
          quantity: line.quantity,
          ...(line.sellingPlanId ? { sellingPlanId: line.sellingPlanId } : {}),
        },
      ],
    },
  );
  const errs = data.cartLinesAdd.userErrors;
  if (errs.length) throw new StorefrontError(errs[0].message);
  if (!data.cartLinesAdd.cart) {
    throw new StorefrontError("cartLinesAdd returned no cart");
  }
  return normalizeCart(data.cartLinesAdd.cart);
}

export async function cartLinesUpdate(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<ShopifyCart> {
  const data = await storefrontFetch<{
    cartLinesUpdate: {
      cart: RawCart | null;
      userErrors: { message: string }[];
    };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesUpdate(
        $cartId: ID!
        $lines: [CartLineUpdateInput!]!
      ) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
          userErrors {
            message
          }
        }
      }
    `,
    { cartId, lines: [{ id: lineId, quantity }] },
  );
  const errs = data.cartLinesUpdate.userErrors;
  if (errs.length) throw new StorefrontError(errs[0].message);
  if (!data.cartLinesUpdate.cart) {
    throw new StorefrontError("cartLinesUpdate returned no cart");
  }
  return normalizeCart(data.cartLinesUpdate.cart);
}

export async function cartLinesRemove(
  cartId: string,
  lineIds: string[],
): Promise<ShopifyCart> {
  const data = await storefrontFetch<{
    cartLinesRemove: {
      cart: RawCart | null;
      userErrors: { message: string }[];
    };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ...CartFields
          }
          userErrors {
            message
          }
        }
      }
    `,
    { cartId, lineIds },
  );
  const errs = data.cartLinesRemove.userErrors;
  if (errs.length) throw new StorefrontError(errs[0].message);
  if (!data.cartLinesRemove.cart) {
    throw new StorefrontError("cartLinesRemove returned no cart");
  }
  return normalizeCart(data.cartLinesRemove.cart);
}

export async function cartGet(cartId: string): Promise<ShopifyCart | null> {
  const data = await storefrontFetch<{ cart: RawCart | null }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      query CartGet($cartId: ID!) {
        cart(id: $cartId) {
          ...CartFields
        }
      }
    `,
    { cartId },
  );
  if (!data.cart) return null;
  return normalizeCart(data.cart);
}

export { StorefrontError };
