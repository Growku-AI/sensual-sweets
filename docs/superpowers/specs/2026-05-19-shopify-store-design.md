# Sensual Sweets — Headless Shopify Store Design Spec

**Date:** 2026-05-19
**Branch:** `feat/shopify-store-build` (cut from `dev`)
**Status:** Draft — awaiting Michael's review before invoking `writing-plans`
**Spec scope:** Full MVP buildout of a headless Shopify storefront on Next.js 16.2.1 — covering design-system alignment, Shopify provisioning, Storefront API integration, shop UI, content + i18n + compliance, and launch ops. Phase 2 work (paid acquisition, A/B infra, CRM, abandoned-cart, marketing email) is deliberately excluded.

---

## 1. Project context

- **Product:** Sensual Sweets — an adult-confectionery brand (3 SKUs: HIS / HERS / DUO) launching in the Netherlands first, EUR-only, Dutch as primary locale with English as a secondary published locale.
- **Repository:** `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/`
- **Design source-of-truth:** sibling symlink `sensual-sweets-design/` → iCloud Cowork folder. The design owner ("design-side Claude") iterates there; this repo mirrors.
- **Stack:** Next.js 16.2.1 App Router, React 19.2.4, Tailwind v4 (`@tailwindcss/postcss`), Framer Motion 12.38, lucide-react, Radix Slot (will add Radix Dialog for cart drawer). **AGENTS.md flags this explicitly: "this is not the Next.js you know" — implementer agents MUST consult `node_modules/next/dist/docs/` before writing caching, fetch, config, or middleware code.**
- **MVP timeline:** 2–3 week soft launch.

### Compliance constraint — HARD GATE
NL Warenwet + EU Reg. 1924/2006 forbid aphrodisiac, health, medicinal, or physiological-effect claims on food supplements (the regulatory category these gummies fall into). All customer-facing copy must use **mood / ritual / intimacy / connection** framing only. This constraint shapes SP-1 (metafield schema), SP-3 (PDP layout & badges), SP-4 (entire content layer + automated compliance lint), and SP-5 (pre-launch counsel sign-off gate).

The current `Hero.tsx`, `Products.tsx`, and `Benefits.tsx` contain banned phrases (`erotic gummies`, `ignite desire`, `deepen sensation`, `drive and endurance`, `Sensation & Mood`). SP-4 owns rewriting them before any production deploy.

---

## 2. Decided architecture

These items were settled during brainstorming and are not relitigated below.

- **Headless model:** Next.js App Router storefront + `@shopify/hydrogen-react` for `ShopifyProvider` / `CartProvider` / `useCart` / `<Money>` / `<Image>` utilities + `@shopify/storefront-api-client` for typed Storefront API access.
- **Checkout:** Shopify-hosted, reached via plain `window.location.assign(cart.checkoutUrl)` redirect. No custom checkout, no Buy SDK.
- **Server/client split:** PLP and PDP are Server Components; cart UI (drawer, icon, add-to-cart button) is Client Components consuming `useCart()`.
- **Caching:** Next.js 16 Cache Components model (`'use cache'` directive + `cacheLife` / `cacheTag`). Older `unstable_cache` and `fetch`-level `revalidate` are superseded — verify against `node_modules/next/dist/docs/` before writing.
- **No WebGL / R3F.** Decision recorded in `docs/decisions/2026-05-18-landing-visual-direction.md`. Keep Framer Motion + CSS for neon effects.
- **i18n:** `next-intl` with always-prefixed locale routing (`/nl/...`, `/en/...`).
- **Age disclosure:** soft footer-only "18+" line. No modal gate. (Reversible if Shopify Payments / processor objects — see SP-4 risks.)

### Sub-project decomposition (MVP)

| # | Sub-project | Goal in one line |
|---|---|---|
| SP-0 | Design-system alignment | Make `globals.css` byte-mirror the canonical CSS; lock divergences. |
| SP-1 | Shopify store provisioning | Stand up shop, products, metafields, payments, shipping, Storefront token. |
| SP-2 | Storefront integration | Wire Next.js to Storefront API (server fetch + client cart + cookie). |
| SP-3 | Shop UI | PLP, PDP, cart drawer, checkout handoff — themed by family. |
| SP-4 | Content + i18n + compliance | All copy in NL+EN, legal pages, automated banned-terms lint. |
| SP-5 | Launch ops | Vercel deploy, analytics, e2e + Lighthouse CI, fulfillment, rollback. |

Phase 2 (out of scope, deferred): paid acquisition, A/B infra, abandoned-cart recovery, CRM, multi-lang SEO polish, GA4, Sentry (if budget-deferred at MVP).

---

## SP-0 — Design-system alignment

### Goal
Bring the project's CSS layer to byte-level parity with the canonical design source in `sensual-sweets-design/`, so that any future design iteration can be pulled in with a single diff-and-mirror pass. Eliminate the `--ss-*` token-prefix drift, port the canonical component-class layer that components will lean on for SP-3, and lock in a documented divergence for the smoother `@property`-based neon border.

### Scope
**In:** token rename across `src/app/globals.css`; port of canonical component classes; addition of `[data-theme="light"]` token block; documentation of intentional divergences; drift-detection workflow.
**Out:** theme-toggle UI (deferred post-MVP); any change to component markup beyond mechanical class/token renames; redesign of existing animations; Tailwind v4 `@theme` restructuring.

### Files to create or modify
| Path | Change |
|---|---|
| `src/app/globals.css` | Drop `--ss-` prefix on all custom properties; port canonical component classes; add light-theme block; preserve `@property --neon-angle` border |
| `src/components/sections/*.tsx` | Mechanical rewrite of any `var(--ss-*)` references and stale class names (inventory below) |
| `docs/design/drift-check.md` (new) | One-page runbook for the manual diff workflow |

### Component-class inventory to port
Source: canonical `sensual-sweets-design/sensual-sweets.css` (standalone file confirmed) plus the brainstorm-confirmed catalog. Port these classes verbatim into `globals.css`:

- Buttons: `.btn-ss`, `.btn-ss-duo`, `.btn-ss-his`, `.btn-ss-hers`, `.btn-ss-ghost`, `.btn-ss-sm`, `.btn-ss-lg`
- Cards: `.card-ss`, `.card-ss-his`, `.card-ss-hers`, `.neon-card-outer-ss`, `.neon-card-inner-ss`
- Badges: `.badge-ss`, `.badge-ss-duo`, `.badge-ss-his`, `.badge-ss-hers`, `.badge-ss-warn`, `.badge-ss-neutral`
- Layout/chrome: `.ss-nav`, `.ss-nav-brand`, `.ss-orb`, `.ss-orb-his`, `.ss-orb-hers`
- Typography: `.text-duo-gradient`, `.text-his`, `.text-hers`, `.text-duo`
- Already present and KEEP: `.gradient-text`, `.gradient-text-animate`, `.gradient-button`, `.glow-sm/md/lg`, `.bg-grid`, `.section-divider`, `.step-connector`, `.star`, `.text-glow`, `.font-playfair`

Current component usage (grep against `src/components/`): `font-playfair` (22), `star` (13), `gradient-text` (12), `gradient-button` (8), `section-divider` (5), `text-glow` (3), `neon-card-outer` (3), `gradient-text-animate` (3), `glow-md` (3), `glow-lg` (2), `bg-grid` (2), `step-connector` (1), `glow-sm` (1). **No `--ss-*` token references in component TSX — rename is CSS-internal.**

### Token-rename map
All occurrences are inside `globals.css` only. Mechanical replacement:

| Before | After |
|---|---|
| `--ss-bg` | `--bg` |
| `--ss-surface` | `--surface-1` (canonical uses `--surface-1` / `-2` / `-3` for layered surfaces — preserve scale) |
| `--ss-text` | `--text-1` |
| `--ss-muted` | `--text-2` |
| `--ss-dim` | `--text-3` |
| `--ss-border` | `--border-visible` |
| `--ss-his` / `--ss-his-deep` | `--his` / `--his-deep` |
| `--ss-hers` / `--ss-hers-deep` | `--hers` / `--hers-deep` |
| `--ss-duo` | `--duo` |
| `--ss-duo-gradient` | `--duo-gradient` |

### Light-theme strategy
Add a `[data-theme="light"]` selector block (per canonical CSS). Override neutrals only — brand colors (`--his`, `--hers`, `--duo`, `--duo-gradient`) stay constant. No toggle UI, no `prefers-color-scheme` auto-switch yet; the block exists so future SP work can flip it via `data-theme` on `<html>`.

### Source-of-truth & drift policy
- **SoT:** `sensual-sweets-design/sensual-sweets.css`. (Also referenced: `sensual-sweets-design/sensual-sweets-DESIGN.md` frontmatter as the design-system spec narrative.)
- **Mirror direction:** SoT → project, never reverse.
- **Drift detection:** before every design pull, manually diff against SoT. Document any intentional divergence in a `/* DIVERGENCE: ... */` comment block at the top of `globals.css`. Codified in `docs/design/drift-check.md`.
- **Intentional divergences (locked):**
  1. `@property --neon-angle` smooth conic-gradient rotation (project) vs. canonical keyframe `background-image` swap — project version is smoother on GPU; **do not "fix" on pull**.
  2. Tailwind v4 `@theme inline` font/animation registrations — project-only (canonical is plain CSS).

### Acceptance criteria
- [ ] Zero `--ss-` substrings in `src/app/globals.css` and `src/components/**`.
- [ ] All canonical component classes listed above resolve in DevTools on the running page.
- [ ] `[data-theme="light"]` block present; manually setting `<html data-theme="light">` visibly changes neutrals without breaking brand colors.
- [ ] `npm run build` passes; no Tailwind v4 warnings about unknown utilities.
- [ ] Visual regression (eyeball): Hero, Products, Testimonials sections render identically to pre-rename baseline.
- [ ] `docs/design/drift-check.md` exists and documents the two locked divergences.

### Risks & mitigations
- **Token rename misses a reference** → grep both `src/` and `public/` for `--ss-` before merging; optional CI lint rule (SP-5).
- **Light-theme tokens go stale** before the toggle ships → keep the block minimal (neutrals only) so maintenance cost is near zero.
- **Future design pull silently overwrites the `@property` divergence** → divergence comment block + `drift-check.md` checklist gate.

---

## SP-1 — Shopify store provisioning

### Goal
Stand up a production-ready Shopify backend that the headless Next.js storefront can consume via Storefront API on day one: 3 SKUs live, EUR/NL market configured, Shopify Payments approved, Sendcloud connected, Storefront token issued. No customer-facing storefront yet (that's SP-2+); this section makes the data and commerce primitives real.

### Scope
**In:** store claim/create decision, plan tier, Shopify Payments KYC kickoff, NL market + NL/EN locales, 3 products with metafield schema, packshot upload, collections, custom app + Storefront token, NL shipping zone (flat rate), BTW config, policy URL stubs, Sendcloud install.

**Out:** copy (SP-4), domain DNS/Vercel attach (SP-5), discount campaigns (post-launch), age-gate UI (SP-3/4), checkout customisation (Shopify-hosted, no changes), customer accounts UX, email templates beyond Shopify defaults.

### Pre-requisites from Michael
1. Decision: **claim existing shop** (provide `*.myshopify.com` admin URL + invite) **or create new** (provide desired shop name; register fresh).
2. KVK number + business address + IBAN in Michael's name or registered entity (for Shopify Payments).
3. Confirmation of legal entity for tax/invoicing (sole prop vs. BV).
4. Go/no-go on Basic plan (€36/mo) for MVP; upgrade only when transaction-rate savings, staff-account, or reporting needs justify it.
5. 1Password vault access for shared secrets.

### Runbook
1. **[Manual]** Claim existing or create new Shopify store; set store name, contact email, address, timezone (Europe/Amsterdam), weight unit (g), currency **EUR**.
2. **[Manual]** Select **Basic Shopify** plan.
3. **[Manual — CRITICAL PATH]** Start **Shopify Payments** activation: submit KVK, BTW number, IBAN, ID verification. Begin day 1; approval can take 2–7 business days. **Block:** cannot capture live orders without it.
4. **[Manual]** **Shopify Markets** → create NL primary market (EUR, ships-to NL). Add languages: Dutch (primary), English (secondary). Keep EN **unpublished on storefront** until SP-4 translations merge.
5. **[Mixed]** Define metafield schema (see below) via Admin → Settings → Custom data → Products. Pin to product detail view for editor UX. MCP `graphql_mutation` (`metafieldDefinitionCreate`) acceptable if faster.
6. **[Programmatic via MCP]** Create 3 products (HIS, HERS, DUO) using `create-product`. Single variant each, inventory tracked, requires shipping. Vendor "Sensual Sweets", product type "Confectionery". Populate metafields per schema.
7. **[Manual]** Upload packshots from `public/packshots/`: `hero.jpg` as first/primary on DUO, `tall.jpg` + `angle-a..e.jpg` as gallery; assign HIS/HERS variants their respective colour-coded angles. Wordmark logo → store theme + brand assets (not on PDP).
8. **[Programmatic]** Create collection `all` (auto, include all products) and `couples` (manual, DUO only initially) via `create-collection` + `add-to-collection`.
9. **[Manual]** Create **custom app** "Sensual Sweets Storefront": enable Storefront API scopes (`unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`, `unauthenticated_write_customers`, `unauthenticated_read_customers`, `unauthenticated_read_content`). Generate Storefront access token.
10. **[Manual]** Store token + shop domain in 1Password ("Sensual Sweets — Shopify Storefront"). Add to local `.env.local` only: `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_STOREFRONT_API_VERSION` (pin: **`2025-10`** — see Open Questions).
11. **[Manual]** Shipping → NL zone → flat rate "Standard NL" (placeholder €4.95, confirm with Michael). Document: switch to carrier-calculated via Sendcloud post-launch once volume justifies.
12. **[Manual]** Install **Sendcloud** Shopify app from App Store, authorise, connect carrier contracts and 3PL pickup location. Verify a test order syncs to Sendcloud dashboard.
13. **[Manual]** Taxes → NL → tax-inclusive prices ON. Set BTW rate per Michael's accountant guidance (likely 21% standard; **flag — confectionery sometimes 9%, must confirm before launch**).
14. **[Manual]** Create empty policy pages: Algemene Voorwaarden, Privacybeleid, Verzendbeleid, Retourbeleid, Cookiebeleid, Leeftijdsbeleid (18+). Publish with placeholder copy "Coming soon" so URLs resolve; SP-4 fills content.
15. **[Programmatic]** Verify via `get-shop-info` + `search_products` + `get-inventory-levels` that all three SKUs return with expected metafields, images, and stock > 0.

### Metafield schema
| Namespace.key | Type | Purpose | User-facing? |
|---|---|---|---|
| `custom.product_family` | single_line_text (enum: `his`\|`hers`\|`duo`) | Drives storefront theming (blue/red/gradient) | No (logic only) |
| `custom.intent_keywords` | list.single_line_text | Internal merchandising tags | **NEVER** — compliance review required before surfacing |
| `custom.ritual_description_nl` | rich_text | Compliant NL PDP copy | Yes (owned by SP-4) |
| `custom.ritual_description_en` | rich_text | Compliant EN PDP copy | Yes (owned by SP-4) |

All `ritual_description_*` content MUST pass the compliance gate. **SP-2 must explicitly exclude `custom.intent_keywords` from Storefront API fragments** to prevent accidental surfacing.

### Acceptance criteria
- [ ] Shop loads at `*.myshopify.com`, plan = Basic, currency = EUR, timezone = Europe/Amsterdam.
- [ ] Shopify Payments status = **Active** (or blocker logged with ETA).
- [ ] NL market live with NL + EN locales configured (EN unpublished until SP-4).
- [ ] 3 products (HIS, HERS, DUO) published, each with ≥3 images, inventory > 0, all 4 metafields populated.
- [ ] `all` and `couples` collections return correct membership.
- [ ] Storefront token authenticates a sample `products` GraphQL query from `.env.local`.
- [ ] NL flat-rate shipping selectable at checkout; Sendcloud receives a synthetic test order.
- [ ] Tax-inclusive pricing confirmed; BTW rate signed off by accountant.
- [ ] All 6 policy URLs return 200.

### Risks & mitigations
- **CRITICAL PATH — Shopify Payments approval (2–7 days):** kick off Day 1, before any code work. Have KVK + IBAN + ID ready.
- **BTW rate ambiguity for confectionery** (9% vs 21%) → written confirmation from accountant before go-live; set 21% as safe default.
- **Compliance leak via metafields** (`intent_keywords` surfacing) → explicit exclusion in SP-2 fragments; comment in schema.
- **Sendcloud carrier contract not yet signed** → confirm before step 12; flat-rate + manual fulfilment acceptable Day 1 fallback.
- **Storefront token leakage** → 1Password + `.env.local`-only, never committed; rotate immediately if `git status` ever shows it staged.
- **Locale fallback gaps** (EN published without translations = empty PDPs) → keep EN unpublished on storefront until SP-4 merges.

---

## SP-2 — Storefront integration

### Goal
Wire the Sensual Sweets Next.js application to the Shopify Storefront API so that product data is fetched server-side and the cart lifecycle (create, modify, checkout redirect) is owned client-side, with no custom checkout surface.

### Scope (in / out)
**In scope**
- Storefront API client factory and typed helpers
- GraphQL documents for products and cart mutations
- Minimal hand-typed domain types (Product, Variant, Cart, CartLine, Money, Image)
- Reusable GraphQL fragments
- Server-side cart ID cookie helpers
- Provider wiring in `src/app/layout.tsx` (and `src/app/[locale]/layout.tsx` once SP-4 routing lands)
- Server/client boundary definition for PLP, PDP, and cart components

**Out of scope**
- GraphQL codegen (deferred to Phase 2 — see Risks)
- Webhooks or Admin API access
- Custom checkout UI
- Multi-currency (EUR only)
- Locale routing segment — owned by SP-4; SP-2 only notes the language handoff point

### Dependencies & versions

| Package | Version | Notes |
|---|---|---|
| `@shopify/hydrogen-react` | latest stable | Provides `ShopifyProvider`, `CartProvider`, `useCart`, `<Money>`, `<Image>`. **React 19 peer-dep risk** — see Risks. If published peer-dep range caps at React 18, mitigate via `overrides` in `package.json` and document explicitly; do not silently rely on `--legacy-peer-deps` at build time. |
| `@shopify/storefront-api-client` | latest stable | `createStorefrontApiClient`; ships its own fetch wrapper. |
| `graphql` | `^16` | Required by hydrogen-react for fragment parsing; verify hydrogen-react does not bundle its own copy to avoid duplicate runtime. |

### Env vars

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | public | e.g. `sensual-sweets.myshopify.com` — no protocol prefix |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | public | Storefront API delegate access token. Public-safe by design; Shopify rate-limits per token. **Do not confuse with Admin API token** (never `NEXT_PUBLIC_`). |
| `SHOPIFY_STOREFRONT_API_VERSION` | server-only | Pinned to **`2025-10`**. Update deliberately. |

A `.env.example` file committed with placeholder values and a comment noting the rate-limit caveat.

### File-by-file blueprint

| Path | Purpose | Exports / shape |
|---|---|---|
| `src/lib/shopify/client.ts` | Singleton Storefront API client; typed `query<T>()` and `mutate<T>()` wrappers that throw structured errors on non-2xx or GraphQL `errors[]` responses | `storefrontClient`, `query<T>(doc, vars?)`, `mutate<T>(doc, vars?)` |
| `src/lib/shopify/fragments.ts` | Reusable GraphQL fragments: `PRODUCT_FIELDS`, `VARIANT_FIELDS`, `IMAGE_FIELDS`, `MONEY_FIELDS`, `CART_FIELDS`, `CART_LINE_FIELDS`. **Explicitly excludes `custom.intent_keywords`.** | Named string constants |
| `src/lib/shopify/queries.ts` | GraphQL document strings composed from fragments: `GET_PRODUCTS`, `GET_PRODUCT_BY_HANDLE`, `CART_CREATE`, `CART_LINES_ADD`, `CART_LINES_UPDATE`, `CART_LINES_REMOVE`, `CART_GET` | Named string constants |
| `src/lib/shopify/types.ts` | Hand-typed interfaces: `ShopifyImage`, `Money`, `ProductVariant`, `Product`, `CartLine`, `Cart`, `ProductFamily` (`'his' \| 'hers' \| 'duo'`). No `any` in accessors. | Exported TS interfaces |
| `src/lib/shopify/cart-cookie.ts` | Server-side helpers using `next/headers` `cookies()`. `ss_cart` cookie: `HttpOnly`, `SameSite=Lax`, `Secure` in production, `Path=/`, `MaxAge` 30 days | `getCartId()`, `setCartId(id)`, `clearCartId()` async functions |

### Server/client boundary diagram
```
Browser request
  └─ RSC render (server)
       ├─ reads ss_cart cookie via cart-cookie.ts
       ├─ if cart ID present → CART_GET via query() → hydration payload
       ├─ GET_PRODUCTS / GET_PRODUCT_BY_HANDLE via query() → product props
       └─ renders HTML shell with ShopifyProvider + CartProvider
            └─ CartProvider receives initialCartId from cookie read
                 └─ client JS boots
                      ├─ CartProvider hydrates live cart state via useCart()
                      ├─ AddToCartButton ('use client') calls linesAdd()
                      │    └─ if no cart yet → CartProvider creates cart → ss_cart cookie set
                      ├─ CartDrawer ('use client') reads useCart().lines, totals
                      └─ "Checkout" button reads cart.checkoutUrl → window.location redirect
```
Product data never re-fetches on the client. Cart mutations are client-only. Checkout is a plain redirect.

### Caching & revalidation
**Next.js 16 uses the `use cache` directive + `cacheLife` / `cacheTag` APIs (Cache Components model).** The older `fetch`-level `revalidate` and `unstable_cache` are superseded. **Verify against `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` before writing any caching code.**

- **Product fetches** (`GET_PRODUCTS`, `GET_PRODUCT_BY_HANDLE`): wrap with `'use cache'` + `cacheLife('hours')`. Tag with `cacheTag('products')` for on-demand invalidation via future webhook.
- **Cart fetches**: never cached. Wrap any cart-reading RSC in `<Suspense>`. Cart streams at request time.
- Enable `cacheComponents: true` in `next.config.ts` to activate Cache Components model + PPR static shell behavior.

### Acceptance criteria
- [ ] `npm run build` completes with no TypeScript errors and no `any` in Shopify files.
- [ ] PLP renders three products with correct names, prices (EUR), and `custom.product_family` values without a client-side fetch waterfall.
- [ ] Adding a line item creates a cart, sets the `ss_cart` cookie, and reflects the new line count in CartIcon without a page reload.
- [ ] Clicking "Checkout" redirects to a `*.myshopify.com/checkouts/` URL.
- [ ] Removing all lines does not crash; cart remains in an empty (not null) state.
- [ ] A fresh request with a stale or missing `ss_cart` cookie does not throw — it creates a new cart lazily on first add.

### Risks & open questions
- **hydrogen-react React 19 peer dep** — if published peer-dep caps at React 18, use `package.json` `overrides`; test `useCart()` thoroughly (React 19 concurrent features can surface subtle hook-order issues).
- **Next.js 16 cache API drift** — only authoritative reference is `node_modules/next/dist/docs/`. Do not write caching code from memory.
- **Storefront token rate limiting** — server-side product caching via `'use cache'` is primary mitigation.
- **GraphQL type drift** — hand-typed interfaces will drift; Phase 2 task to introduce `@graphql-codegen/cli` before catalog expands.
- **`ss_cart` cookie on locale switch** — once SP-4 introduces `/nl/` and `/en/`, verify `Path=/` covers both prefixes.

---

## SP-3 — Shop UI (catalog, PDP, cart drawer, checkout handoff)

### Goal
Wire the three Shopify SKUs into a purchasable storefront: server-rendered PLP, per-product PDP, client-side cart drawer backed by `useCart()`, and a checkout handoff to Shopify-hosted checkout. The landing-page sections already built (Hero, Products, Benefits, etc.) remain untouched — this sprint adds transactional routes and cart infrastructure alongside them.

### Scope
**In:** `/[locale]/shop` PLP; `/[locale]/shop/[handle]` PDP; Radix Dialog cart drawer; CartIcon in header; checkout redirect; "Shop now" CTA wired into existing landing sections; skeleton loaders, error boundaries, empty cart, sold-out, error toast states; full i18n via `next-intl` `shop` and `cart` namespaces; a11y hardening.

**Out:** age gate (decided as soft footer only — SP-4); accounts/login/order history; wishlist; subscription flow; promotional discount entry in drawer; WebGL/R3F.

### Route map

| Route | File | Rendering | Notes |
|---|---|---|---|
| `/[locale]/shop` | `src/app/[locale]/shop/page.tsx` | Server Component | Fetches all 3 products; renders `<ProductCard>` grid |
| `/[locale]/shop/[handle]` | `src/app/[locale]/shop/[handle]/page.tsx` | Server Component | Fetches single product by handle; renders gallery + copy + `<AddToCartButton>` |
| `/[locale]/` | `src/app/[locale]/page.tsx` _(modified)_ | Server Component | Existing Hero/Products CTAs wired to `/[locale]/shop` |

Both shop routes export `generateStaticParams` for the 3 known handles (`his`, `hers`, `duo`) — pre-render at build. Revalidation via Cache Components (`cacheLife('hours')`).

### Component blueprint

| Path | Role | Key props / state |
|---|---|---|
| `src/components/shop/ProductCard.tsx` | PLP card — Server Component | `product: Product`, `family: ProductFamily`; applies `card-ss-{family}`; links to PDP |
| `src/components/shop/ProductGallery.tsx` | PDP image display — Server Component (MVP: static stack) | `images: string[]`, `family`; up to 3 packshots, `next/image` `priority` on first |
| `src/components/shop/PriceTag.tsx` | Formatted price — Server Component | wraps hydrogen-react `<Money>` |
| `src/components/shop/AddToCartButton.tsx` | Add-to-cart CTA — **Client** | `variantId`, `family`, `available`; calls `useCart().linesAdd`; spinner during mutation; disabled + `<SoldOutBadge>` when `!available` |
| `src/components/shop/SoldOutBadge.tsx` | Availability indicator | renders `badge-ss-warn` |
| `src/components/cart/CartIcon.tsx` | Header cart trigger — **Client** | `useCart().lines.length`; lucide `ShoppingBag` + numeric badge; opens drawer via context |
| `src/components/cart/CartDrawer.tsx` | Full drawer shell — **Client** | Radix Dialog slide-in from right; dynamically imported on first CartIcon interaction |
| `src/components/cart/CartLineItem.tsx` | Single cart line — **Client** | `line: CartLine`; thumbnail, name, qty `+/-` (aria-labeled), remove |
| `src/components/cart/CartFooter.tsx` | Subtotal + checkout CTA — **Client** | reads `cart.cost.subtotalAmount`; "Afrekenen" → `window.location.assign(cart.checkoutUrl)`; `btn-ss-duo` |
| `src/components/cart/EmptyCart.tsx` | Empty-state | copy from `t('cart.empty')`, link → `/[locale]/shop` |

**Cart state provider:** `CartProvider` from `@shopify/hydrogen-react` wraps `src/app/[locale]/layout.tsx`. **CartDrawer open-state:** shared via a small `CartDrawerContext` defined in the locale layout, consumed by both `CartIcon` and `CartDrawer`.

**Header nav update:** existing nav currently inside `Hero.tsx` (confirmed `"use client"`) gets a `<CartIcon>` slot. When SP-4 creates `src/app/[locale]/layout.tsx`, the nav (and `CartIcon`) move there permanently.

### UX golden path
1. User lands on `/[locale]/` → "Shop now" CTA (`btn-ss-duo`) → `/[locale]/shop`.
2. PLP renders three cards (HIS blue, HERS red, DUO gradient) with packshot, name, price, "Bekijk" CTA.
3. User clicks HIS card → `/[locale]/shop/his`. Gallery displays `angle-a.jpg` (priority), `angle-b/d.jpg` secondary. Copy, `PriceTag`, `AddToCartButton` (blue `btn-ss-his`).
4. User clicks "In winkelmand" → `linesAdd` fires; drawer slides in (spring 300ms; opacity fade under `prefers-reduced-motion`).
5. `CartFooter` shows subtotal; "Afrekenen" → `window.location.assign(cart.checkoutUrl)` → Shopify-hosted checkout.

### Empty / error / sold-out states

| Condition | Component | Behaviour |
|---|---|---|
| PLP loading | Suspense boundary | Three `card-ss` shimmer skeletons |
| PDP loading | Suspense boundary | Gallery placeholder + text-line skeletons |
| Route error | `src/app/[locale]/shop/error.tsx` | Copy from `t('shop.error')`; "Terug" link |
| Variant unavailable | `AddToCartButton` + `SoldOutBadge` | Button disabled, `aria-disabled="true"`, `badge-ss-warn` "Uitverkocht" inline |
| Cart mutation failure | `AddToCartButton` | Inline `role="alert"` toast (no external library), auto-dismiss 4s |
| Empty cart | `EmptyCart` | Shown when `lines.length === 0`; CTA back to `/[locale]/shop` |

### Accessibility & motion
- Radix Dialog provides focus trap + ESC + `aria-labelledby`; verify `aria-describedby` if subtitle present.
- Qty `+/-`: `aria-label={t('cart.increaseQty'|'decreaseQty')}`.
- Remove: `aria-label={t('cart.removeLine', { name })}`.
- All text on coloured surfaces meets WCAG AA (4.5:1). `text-white` on saturated brand backgrounds (established in `Products.tsx`).
- `prefers-reduced-motion`: wrap orb breath + neon-chase in `@media (prefers-reduced-motion: no-preference)` block in `globals.css` (single edit). Drawer spring replaced with `transition: opacity 150ms ease` via Framer Motion `useReducedMotion()` branch.
- Floating hero image in `Hero.tsx`: gate `animate` prop behind `useReducedMotion()`.

### Performance budget

| Target | Metric | Approach |
|---|---|---|
| LCP < 2.5s | PDP hero packshot | `next/image priority` + `sizes` matched to gallery columns |
| Cart drawer payload | Code-split | `next/dynamic(() => import('../cart/CartDrawer'), { ssr: false })` |
| PLP images | Lazy | `loading="lazy"` on below-fold packshots |
| Lighthouse a11y | ≥ 95 | Semantic landmarks, labelled controls, no colour-only meaning |
| Lighthouse perf mobile | ≥ 80 | Static pre-render, minimal JS, drawer code-split |
| CLS | 0 | Playfair + Raleway pre-loaded via `next/font` |

### Acceptance criteria
- [ ] `/nl/shop` renders 3 cards with correct family theming.
- [ ] `/nl/shop/his` renders HIS PDP with `angle-a.jpg` priority.
- [ ] "In winkelmand" on HIS PDP → `linesAdd` → drawer opens with HIS line.
- [ ] Drawer closes on ESC, overlay click, explicit close button without JS errors.
- [ ] "Afrekenen" navigates to `cart.checkoutUrl` with items intact.
- [ ] `prefers-reduced-motion: reduce`: no orb, no drawer spring, no floating hero drift.
- [ ] Sold-out: button disabled, `badge-ss-warn` shown, no mutation on click.
- [ ] Cart mutation failure surfaces dismissible `role="alert"` toast.
- [ ] Lighthouse mobile a11y ≥ 95, perf ≥ 80 on `/nl/shop/his`.
- [ ] Zero hardcoded NL/EN copy in component files — all via `next-intl`.

### Risks & open questions

| Risk | Severity | Mitigation |
|---|---|---|
| `CartProvider` needs `countryIsoCode` + `languageIsoCode` aligned with active locale | Med | Derive from `useParams()` in locale layout; default `NL`/`NL` until SP-4 |
| `cart.checkoutUrl` empty if cart fetched from stale session | Med | Gate "Afrekenen" on `!!cart.checkoutUrl`; disabled-with-tooltip if null |
| **DUO SKU bundle model** — single variant vs composite affects `variantId` for `linesAdd` | **High** | **Confirm with Shopify store admin before PDP build** (open question) |
| `next/dynamic` SSR-false drawer missing at initial paint for screen readers | Low | Radix manages focus post-mount; VoiceOver smoke test |
| Prop-drilling drawer open-state | Low | `CartDrawerContext` in locale layout |

---

## SP-4 — Content, i18n, and compliance

### Goal
Stand up a bilingual (NL/EN) content layer for the storefront with all UI strings, product copy, and long-form legal content externalized from components, served via locale-prefixed routes, and gated by an automated compliance check that blocks banned regulated-claim language before it can ship.

### Compliance constraint — HARD GATE
**No copy with aphrodisiac / health / medicinal / physiological-effect claims may merge to `main` (or the integration branch) or deploy to a customer-facing Vercel preview.** Enforced two ways:
1. `pnpm check:compliance` runs in pre-commit + CI; non-zero exit blocks the build.
2. NL-licensed counsel sign-off on all `/messages/legal/**` content is a pre-launch checklist item owned by SP-5; launch is blocked until signed off.

### Scope
**In:** i18n stack + routing, message file structure, all UI/product/legal copy in NL + EN, compliance lint, age disclosure copy, language switcher.
**Out:** third locales (DE/FR), blog/content marketing (SP-6), marketing email copy beyond Shopify defaults (SP-6), translated SEO meta beyond per-page `title`/`description`.

### i18n stack & routing
- **Library:** `next-intl` (latest 4.x line, App Router native, RSC + client message access, locale routing + middleware built in). Rejected `next-i18next` (pages-router era); rejected hand-rolled JSON loader (no typed access, no middleware).
- **URL pattern:** `/[locale]/...` where `locale ∈ {nl, en}`. NL is default and **always prefixed** — clearer SEO `hreflang`, no ambiguous canonical URLs. Matches `next-intl`'s `always` strategy.
- **Middleware:** `src/middleware.ts` uses `createMiddleware`. Negotiation: existing locale segment → `NEXT_LOCALE` cookie → `Accept-Language` → fallback `nl`. Sets cookie on first resolved request.
- **Language switcher:** server-rendered next-intl `<Link>` from `routing.ts`.

### File structure
```
src/
  i18n/
    config.ts          # locales = ['nl','en'], defaultLocale = 'nl'
    routing.ts         # defineRouting() + typed Pathnames
    request.ts         # getRequestConfig
  middleware.ts        # next-intl middleware (matcher excludes /api, /_next, static)
  messages/
    nl.json            # nav, hero, benefits, shop, cart, footer, errors
    en.json
    products/
      his.{nl,en}.json
      hers.{nl,en}.json
      duo.{nl,en}.json
    legal/
      nl/{terms,privacy,shipping,returns,cookies,age}.mdx
      en/{terms,privacy,shipping,returns,cookies,age}.mdx
  lib/compliance/
    banned-terms.ts    # NL + EN forbidden strings + regex patterns
scripts/
  check-compliance.ts  # scans .json/.mdx/.tsx; fails on hit
```
Product copy is **also mirrored to Shopify metafields** (`custom.ritual_description_nl/en`) so the Storefront API can serve the same text. **Single editorial source remains the repo JSON; sync is one-way push from CI.**

### Content inventory (both NL + EN required)
Nav · language switcher · footer (incl. age disclosure) · hero · benefits · products section landing · HIS/HERS/DUO PDP (tagline, long description, ritual cue, ingredients — factual only) · how-it-works · testimonials (NL-native, EN-translated) · shop grid · cart drawer · empty cart · sold-out · checkout entry messaging · 404/500 · cookie banner · age disclosure · transactional email subjects (mirrored from Shopify for reference).

### Compliance workflow & lint
1. Author draft in `/messages/...`.
2. `pnpm check:compliance` — walks `src/messages/**`, `src/components/**/*.tsx`, `src/app/**/*.tsx`; matches against `banned-terms.ts`:
   - **NL:** `afrodisiacum`, `lust`, `opwinding`, `libido`, `prikkel`, `verlangen aanwakkeren`, `erotisch(e)`
   - **EN:** `erotic`, `aphrodisiac`, `desire`, `arousal`, `libido`, `sensation`, `ignite`, `deepen`, `stamina`, `endurance`, `performance`
3. Prints `file:line`; exits 1 on hit.
4. Hooked into `lint-staged` pre-commit + CI `verify` job.
5. NL counsel reviews `/messages/legal/**` before launch (tracked in SP-5).

### Example rewrites (banned → compliant)
1. **Hero sub** — _"Crafted to ignite desire, deepen sensation, and turn the night yours."_ → **EN:** _"Crafted for shared rituals — a sweet pause made for two."_ **NL:** _"Gemaakt voor gedeelde momenten — een zoete pauze, samen."_
2. **HERS card title** — _"Sensation & Mood"_ → **EN:** _"Her Ritual"_ **NL:** _"Haar Ritueel"_. Body: _"Plant-powered support for mood, sensation…"_ → _"A botanical confection crafted for her side of the shared moment."_
3. **Benefits intro** — _"HIS for drive and endurance, HERS for sensation and mood"_ → **EN:** _"Two confections, one ritual — made to be enjoyed together."_ **NL:** _"Twee lekkernijen, één ritueel — gemaakt om samen te delen."_

### Age disclosure
Footer band, every page, both locales, no modal:
> **NL:** "Voor volwassenen 18+ · Geniet met mate."
> **EN:** "Made for adults 18+ · Enjoy mindfully."

Rendered server-side inside `<Footer />`, not behind any JS gate. Decision recorded in `docs/decisions/2026-05-19-age-gate-soft-footer.md` (to be created alongside SP-4 PR).

### Acceptance criteria
- [ ] `pnpm check:compliance` exits 0 across the entire repo.
- [ ] Visiting `/` 302-redirects to `/nl` (or `/en` per `Accept-Language`); deep links to `/en/...` render English.
- [ ] All strings in `src/components/sections/*.tsx` resolved via `useTranslations()` / `getTranslations()` — zero hardcoded user-visible English.
- [ ] Three SKUs each have `*.nl.json` + `*.en.json` with tagline, long description, ritual cue, ingredients.
- [ ] All six legal pages exist as MDX in both locales (draft state acceptable, flagged TODO for counsel).
- [ ] Language switcher visible, persists choice via `NEXT_LOCALE` cookie.
- [ ] Footer age disclosure renders on every route, both locales.
- [ ] Lighthouse `hreflang` audit passes for `nl` ↔ `en`.
- [ ] CI key-parity check: `nl.json` keys === `en.json` keys (no missing translations).

### Risks & mitigations
- **Counsel turnaround slips launch** → draft legal MDX in week 1; track as named blocker in SP-5.
- **Banned terms reintroduced via Shopify metafield edits** → SP-5 adds a webhook-triggered CI job that re-runs `check-compliance` against fetched metafield values.
- **Translator drift NL↔EN** → CI key-parity check (above).
- **Legitimate `sensation`/`desire` uses blocked** → `banned-terms.ts` supports per-file allowlist comments; reviewer must justify any allowlist in PR description.
- **Soft 18+ insufficient for payment processor** → reversible; spec for hard modal parked in `docs/decisions/`, can be lifted into SP-5 within a day if Shopify Payments flags merchant category.

---

## SP-5 — Launch ops (deploy, analytics, testing, monitoring, fulfillment, rollback)

### Goal
Ship Sensual Sweets to production on Vercel with a predictable, observable, and reversible launch. Every deploy must be reviewable (PR Preview), measurable (analytics + Web Vitals), testable (Playwright + Lighthouse + compliance lint in CI), and rollback-able in under 5 minutes. Fulfillment wired end-to-end (Shopify → Sendcloud → 3PL) on day one even where manual.

### Scope (in / out)
**In:** Vercel hosting, env management, Vercel + Shopify analytics, CI checks (type/lint/compliance/build/e2e/Lighthouse), Playwright golden path, uptime probe, Sendcloud auto-push, rollback runbook, pre-launch checklist.
**Out (Phase 2):** paid acquisition, A/B infra, abandoned-cart, CRM, GA4, multi-language SEO sitemap polish, Sendcloud→Shopify webhook tracking sync. Structured-data product schema flagged **nice-to-have** for MVP if time allows.

### Deployment topology
- **Vercel** project. Production + Preview deployments per PR.
- **Production branch:** decision needed — see Open Questions. Current repo default is `main`/`dev`; Michael's global rule is `master`. **Pinning this is a pre-execution decision.**
- **Custom domain:** apex + `www` attached to Production (Michael provides). SSL via Vercel-managed certs.
- **Runtime:** Next.js 16 on Vercel Functions / Fluid Compute (Node runtime, 300s default timeout). Edge runtime avoided — no clear win.
- **`vercel.ts`** (TS config, preferred over `vercel.json`): `framework: 'nextjs'`, `headers` for long-cache on `/static/*` + immutable assets, `redirects` (`/` → `/nl`, legacy paths as discovered).

### Environment matrix
`.env.example` committed with placeholders; `.env.local` git-ignored.

| Key | Prod | Preview | Local |
|---|---|---|---|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | live store | live (read-only) | dev store |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | prod token | prod token | dev token |
| `SHOPIFY_STOREFRONT_API_VERSION` | `2025-10` | `2025-10` | `2025-10` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `nl` | `nl` | `nl` |
| `NEXT_PUBLIC_SUPPORTED_LOCALES` | `nl,en` | `nl,en` | `nl,en` |

Install Vercel CLI (`npm i -g vercel`) for `vercel env pull`, `vercel deploy`, `vercel logs`, `vercel rollback`.

### Analytics
- **Shopify Analytics (primary):** native commerce funnel.
- **Vercel Analytics:** page views + Core Web Vitals. Zero-config, no PII, EU-friendly (DPA included) — bypasses cookie-banner cost at MVP.
- **Custom e-commerce events** via `src/lib/analytics.ts` wrapper on `useCart()` effects: `cart_add`, `cart_remove`, `begin_checkout`.
- **GA4 deferred** to Phase 2. Document the deferral.

### Monitoring
- Vercel built-in logs + Speed Insights.
- **Sentry (`@sentry/nextjs`) deferred** if time-constrained — explicitly logged in `/docs/decisions/` so not silently forgotten.
- **Synthetic uptime:** Vercel Monitor or UptimeRobot probing `/`, `/nl/shop`, `/nl/shop/his` at 5-min cadence. Alert channel confirmed with Michael at execution time.

### Testing
- **Playwright e2e** — `tests/e2e/golden-path.spec.ts`: land → shop → PDP → add → cart drawer → checkout redirect lands on `*.shopify.com` host (asserts host suffix, not full URL).
- Smoke run on every Preview deploy via CI.
- **Lighthouse CI** (`treosh/lighthouse-ci-action`) with budgets: **a11y ≥ 95, perf ≥ 80 mobile, SEO ≥ 90**. Soft-fail first, hard-fail second to reduce noise.
- **Compliance lint** (SP-4) **blocks merge** on banned-term hit.

### Fulfillment integration
- Shopify Order Created → Sendcloud Shopify app auto-pushes.
- Sendcloud → 3PL: **manual handoff** initially (label batch exported). Acceptable for MVP volumes.
- **Tracking webhook sync deferred to Phase 2.**
- Order confirmation emails: Shopify defaults at launch; bilingual polish in SP-4 if time allows.

### CI/CD pipeline
GitHub Actions (preferred) or Vercel-native PR checks. Parallel where possible:
1. `type-check` (`tsc --noEmit`)
2. `lint` (ESLint flat config)
3. `compliance-check` (banned-terms — blocks merge)
4. `build` (`next build`)
5. `e2e-smoke` (Playwright against Preview URL)
6. `lighthouse` (LHCI against Preview URL)

All six must pass before merge to the production branch.

### Pre-launch checklist
- [ ] All SP-0..SP-4 acceptance criteria met
- [ ] Banned-terms lint green in CI
- [ ] NL counsel sign-off on legal pages logged in `/docs/decisions/`
- [ ] Shopify Payments verified + first test charge processed (then refunded)
- [ ] End-to-end test order: cart → checkout → paid → Shopify shows order → Sendcloud receives → label generated
- [ ] Custom domain live with valid SSL (apex + www)
- [ ] All env vars set in Production (matrix above)
- [ ] Analytics events visible in Shopify + Vercel Analytics
- [ ] Lighthouse budgets met on `/` and `/nl/shop`
- [ ] Rollback procedure documented + tested (dry run completed)
- [ ] Uptime monitor configured and tested (forced failure → alert received)

### Rollback procedure
- **Primary:** Vercel instant promote-previous-deploy (`vercel rollback` or UI). Target: **< 5 minutes**.
- **Catastrophic (data/PII/legal):** rotate / disable Shopify Storefront access token — instant kill switch, then revert deploy.
- **Runbook** lives in `/docs/runbooks/rollback.md`: who-can-rollback (Michael + one designated dev), how-fast (< 5 min target / < 15 min worst), comms template.
- Rehearsed once before launch (dry run on Preview promotion).

### Acceptance criteria
1. Production deploy live on custom domain, valid SSL.
2. All CI jobs green on production branch HEAD.
3. Playwright golden path passes against Production.
4. One real end-to-end paid order completes Shopify → Sendcloud → label.
5. Pre-launch checklist 100% ticked, evidence in `/docs/decisions/launch-YYYY-MM-DD.md`.
6. Rollback drill executed and timed.

### Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| NL counsel sign-off slips past soft-launch | Med | Hard gate in checklist; no DNS flip until logged |
| Sendcloud manual handoff bottlenecks first orders | Med | Low MVP volume; batch daily; Phase 2 automates |
| Lighthouse perf budget fails on mobile | Med | Image optimization in SP-3; soft-fail first |
| Shopify checkout domain change breaks e2e assertion | Low | Assert on `*.shopify.com` suffix, not exact host |
| Sentry deferred → blind to runtime errors | Med | Vercel logs as fallback; revisit week 2 post-launch |
| Cookie-banner-free analytics challenged by DPO | Low | Vercel Analytics is cookieless + no PII; documented |

---

## 3. Cross-cutting risks (roll-up)

| # | Risk | Owner SP | Type | Mitigation |
|---|---|---|---|---|
| R1 | Shopify Payments approval 2–7 days | SP-1 | Critical-path schedule | Day-1 kickoff |
| R2 | Banned-claim copy leaks to production | SP-4 | Legal/regulatory | Automated lint + counsel sign-off + Shopify metafield webhook re-check |
| R3 | hydrogen-react React 19 peer-dep cap | SP-2 | Technical | `package.json` `overrides`; thorough `useCart()` testing |
| R4 | Next.js 16 cache API drift from training data | SP-2 / SP-3 | Technical | Implementer agents MUST read `node_modules/next/dist/docs/` before writing |
| R5 | DUO SKU bundle modelling unknown | SP-3 | Product | Resolve in SP-1 (open question) |
| R6 | NL counsel turnaround blocks launch | SP-4 / SP-5 | Schedule | Draft week 1; track as named blocker |
| R7 | Storefront token leakage | SP-1 / SP-2 | Security | 1Password + `.env.local`; never committed; rotate on exposure |
| R8 | BTW rate ambiguity (9% vs 21%) | SP-1 | Tax/legal | Accountant sign-off; 21% safe default |

---

## 4. Open questions (resolve before / during SP-1)

1. **Shopify shop:** claim existing or create new? Domain string?
2. **Production branch policy:** repo default is `main`/`dev`; global rule says `master`. Pick one for this project and rename if needed.
3. **DUO SKU structure:** single variant or composite bundle in Shopify?
4. **BTW rate** for adult confectionery: 21% standard or 9% reduced? Needs accountant.
5. **Custom domain:** apex string + DNS provider for Vercel attach.
6. **Alert channel** for uptime monitor: email / Slack / etc.?
7. **Sentry MVP or defer?** Budget call.
8. **Plan tier:** Basic (€36/mo) confirmed for MVP?
9. **Counsel** for NL legal-page review: identified yet?

---

## 5. Out-of-scope / explicit Phase 2 deferrals

- SP-6 (deferred): paid acquisition, A/B testing infra, marketing email beyond Shopify defaults, abandoned-cart recovery, CRM integration, blog/content marketing, structured-data product schema (if not done in MVP), Sentry (if deferred), GA4.
- SP-7 (deferred): ops scaling — Sendcloud→Shopify tracking webhook sync, carrier-calculated shipping, multi-country expansion (DE/BE), additional locales (DE/FR), theme toggle UI, GraphQL codegen, third-party reviews/UGC.

---

## 6. Next step

After Michael reviews and approves this spec, invoke `superpowers:writing-plans` to produce the implementation plan (task-level breakdown) for SP-0..SP-5. Implementation begins via `subagent-driven-development` once the plan is approved.
