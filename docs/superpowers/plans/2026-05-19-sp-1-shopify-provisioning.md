# SP-1 — Shopify Store Provisioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a production-ready Shopify backend (Basic plan, EUR, NL market, 3 SKUs with metafields, packshots, collections, Storefront API token, NL shipping + BTW, Sendcloud, policy stubs) so the Next.js storefront can consume it on day one.
**Architecture:** Headless Shopify backend; this plan touches Shopify only (no Next.js code beyond a single `.env.example` placeholder commit).
**Tech Stack:** Shopify Admin (manual), Shopify MCP tools (programmatic), Storefront API for verification.

---

## Pre-requisites (Michael must provide at execution time)

These inputs gate Task 1. The executor must obtain explicit answers before touching any Shopify surface.

1. **Shopify shop decision** — claim an existing `*.myshopify.com` (admin URL + collaborator invite) **or** create a new shop (desired shop name + domain string).
2. **KVK number, registered business address, and IBAN** in Michael's name or registered entity — required for Shopify Payments KYC.
3. **Legal entity confirmation** — sole proprietorship vs. BV (affects invoicing + Shopify Payments form).
4. **Plan tier confirmation** — Basic Shopify (€36/mo) recommended for MVP; explicit go-ahead required before billing activates.
5. **1Password vault access** — shared vault for "Sensual Sweets — Shopify Storefront" entry (token + shop domain + Admin contact).
6. **Production branch policy for downstream SPs** — Michael's global rule is `master`; repo currently uses `main`/`dev`. Capture the decision in the choices document (Task 1). SP-1 itself is unaffected; SP-5 will enforce it.

If any item is missing, halt at Task 1 and request it before proceeding. Do not guess values for legal/tax fields.

---

## Tasks

- [ ] **Task 1: Pre-flight — confirm pre-requisites and record decisions**
  - **Where:** Local repo `/docs/decisions/`
  - **What:** Collect the 6 pre-requisite answers from Michael verbatim. Create `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/docs/decisions/2026-05-19-shopify-provisioning-choices.md` recording:
    - Shop decision (claim vs. create) + final `*.myshopify.com` handle
    - KVK number, business address, IBAN (last 4 only in the doc; full values stay in 1Password)
    - Legal entity (sole prop / BV) + invoicing entity name
    - Plan tier (Basic / Shopify / Advanced) + confirmed monthly cost
    - 1Password vault name confirmed accessible
    - Production branch policy (`main` vs `master`) — flag forwarded to SP-5
    - Plus: BTW rate decision pending accountant (placeholder 21%, flagged)
    - Plus: DUO SKU model — single variant for MVP unless Michael overrides
  - **Verify:** File exists at the path above and contains all 6+ items, each with a non-empty answer or explicit `BLOCKED: <reason>` line.
  - **Commit:** Yes — `git add docs/decisions/2026-05-19-shopify-provisioning-choices.md && git commit -m "docs: record SP-1 Shopify provisioning pre-flight decisions"`

- [ ] **Task 2: Claim or create the Shopify store**
  - **Where:** Shopify Admin → store creation flow at `https://www.shopify.com/` (new) **or** accept the collaborator invite to the existing `*.myshopify.com` admin (claim path).
  - **What:**
    - Store name: `Sensual Sweets`
    - Contact email: Michael's address (from Task 1)
    - Plan: **Basic Shopify** (€36/mo) — select during onboarding, do NOT skip to "Choose later" if Shopify Payments KYC depends on it.
    - Settings → General:
      - Address: business address from Task 1
      - Timezone: `(GMT+01:00) Amsterdam`
      - Default weight unit: `Grams (g)`
      - Store currency: `Euro (EUR)` — **WARNING:** currency is locked after first paid order; double-check before saving.
    - Settings → Store details: legal business name + VAT/BTW number placeholder (final BTW set in Task 14).
  - **Verify:** MCP `get-shop-info` returns `currencyCode: "EUR"`, `ianaTimezone: "Europe/Amsterdam"`, `weightUnit: "GRAMS"`, `plan.displayName` contains `Basic`.
  - **Commit:** Skip (Shopify-side only).

- [ ] **Task 3: Begin Shopify Payments KYC — CRITICAL PATH (Day 1)**
  - **Where:** Shopify Admin → Settings → Payments → Activate Shopify Payments
  - **What:** Submit the KYC form using values from Task 1:
    - Business type (sole prop / BV) per legal entity decision
    - KVK number, registered address, contact phone
    - BTW (VAT) number (placeholder if not yet issued — flag in Task 1 doc)
    - IBAN for payouts (in business or owner's name matching the entity)
    - Identity document upload for the principal (passport or NL ID)
    - Customer billing statement descriptor: `SENSUALSWEETS`
  - **Verify:** Admin → Settings → Payments shows Shopify Payments status of `Pending review` or `Active`. Capture screenshot to `/docs/decisions/2026-05-19-shopify-payments-kyc-submitted.png`. **Approval can take 2–7 business days** — proceed with remaining tasks while waiting; do NOT block on this.
  - **Commit:** Skip (no repo artifact yet — screenshot can be committed if Michael wants it tracked; default skip).

- [ ] **Task 4: Configure Shopify Markets (NL primary, EUR, NL + EN locales)**
  - **Where:** Shopify Admin → Settings → Markets
  - **What:**
    - Confirm the auto-created Primary Market is `Netherlands`. If not, rename and set country to `Netherlands` only. Currency: `EUR`. Pricing: tax-inclusive (final tax config in Task 14).
    - Settings → Languages: add `Dutch (Nederlands)` as the default published language. Add `English` as a secondary language but leave it **Unpublished** on the storefront (toggle to `Unpublished` after creation). SP-4 will publish EN once translations land.
  - **Verify:** MCP `graphql_query` — `{ shop { primaryDomain { url } } shopLocales { locale primary published } markets(first:5){ edges { node { name primary currencySettings { baseCurrency { currencyCode } } } } } }`. Assert: one market with `primary: true` and `currencyCode: "EUR"`; `shopLocales` contains `{ locale: "nl", primary: true, published: true }` and `{ locale: "en", primary: false, published: false }`.
  - **Commit:** Skip.

- [ ] **Task 5: Define metafield schema (4 product metafields)**
  - **Where:** Shopify Admin → Settings → Custom data → Products → Add definition (UI path) **or** MCP `graphql_mutation` using `metafieldDefinitionCreate` (faster, scriptable).
  - **What:** Create exactly these 4 definitions, pinned to the product detail editor:

    | Namespace.key | Type | Validation | Pinned | Storefront access |
    |---|---|---|---|---|
    | `custom.product_family` | `single_line_text_field` | enum-style: one of `his`, `hers`, `duo` (enforce via "choices" validation) | Yes | Readable |
    | `custom.intent_keywords` | `list.single_line_text_field` | none | Yes | **Disabled** — never exposed via Storefront API (compliance) |
    | `custom.ritual_description_nl` | `multi_line_text_field` (rich text not required for MVP — keep simple) | none | Yes | Readable |
    | `custom.ritual_description_en` | `multi_line_text_field` | none | Yes | Readable |

    Example MCP call for `product_family`:
    ```graphql
    mutation {
      metafieldDefinitionCreate(definition: {
        name: "Product family"
        namespace: "custom"
        key: "product_family"
        type: "single_line_text_field"
        ownerType: PRODUCT
        pin: true
        validations: [{ name: "choices", value: "[\"his\",\"hers\",\"duo\"]" }]
        access: { storefront: PUBLIC_READ }
      }) { createdDefinition { id name } userErrors { field message } }
    }
    ```
    Repeat for the other three. For `intent_keywords`, set `access: { storefront: NONE }` (no Storefront read) — this is the hard compliance gate.
  - **Verify:** MCP `graphql_query` — `{ metafieldDefinitions(ownerType: PRODUCT, first: 20){ edges { node { namespace key type { name } pinnedPosition access { storefront } } } } }`. Assert 4 definitions present; `custom.intent_keywords` has `access.storefront == NONE`.
  - **Commit:** Skip.

- [ ] **Task 6: Create HIS product via MCP**
  - **Where:** MCP tool `create-product`
  - **What:** Submit the following payload (Michael sets prices at execution):
    ```json
    {
      "title": "HIS",
      "handle": "his",
      "vendor": "Sensual Sweets",
      "productType": "Confectionery",
      "status": "ACTIVE",
      "tags": ["his", "sensual-sweets"],
      "variants": [
        {
          "sku": "SS-HIS-01",
          "price": "<price set by Michael at execution>",
          "weight": 60,
          "weightUnit": "GRAMS",
          "requiresShipping": true,
          "inventoryManagement": "SHOPIFY",
          "inventoryQuantity": 50,
          "taxable": true
        }
      ],
      "metafields": [
        { "namespace": "custom", "key": "product_family", "type": "single_line_text_field", "value": "his" },
        { "namespace": "custom", "key": "intent_keywords", "type": "list.single_line_text_field", "value": "[]" },
        { "namespace": "custom", "key": "ritual_description_nl", "type": "multi_line_text_field", "value": "Placeholder NL ritual copy — SP-4 will replace." },
        { "namespace": "custom", "key": "ritual_description_en", "type": "multi_line_text_field", "value": "Placeholder EN ritual copy — SP-4 will replace." }
      ]
    }
    ```
  - **Verify:** MCP `get-product` with handle `his` returns `status: "ACTIVE"`, exactly 1 variant, `metafield(namespace: "custom", key: "product_family").value == "his"`, and `totalInventory > 0`.
  - **Commit:** Skip.

- [ ] **Task 7: Create HERS product via MCP**
  - **Where:** MCP tool `create-product`
  - **What:**
    ```json
    {
      "title": "HERS",
      "handle": "hers",
      "vendor": "Sensual Sweets",
      "productType": "Confectionery",
      "status": "ACTIVE",
      "tags": ["hers", "sensual-sweets"],
      "variants": [
        {
          "sku": "SS-HERS-01",
          "price": "<price set by Michael at execution>",
          "weight": 60,
          "weightUnit": "GRAMS",
          "requiresShipping": true,
          "inventoryManagement": "SHOPIFY",
          "inventoryQuantity": 50,
          "taxable": true
        }
      ],
      "metafields": [
        { "namespace": "custom", "key": "product_family", "type": "single_line_text_field", "value": "hers" },
        { "namespace": "custom", "key": "intent_keywords", "type": "list.single_line_text_field", "value": "[]" },
        { "namespace": "custom", "key": "ritual_description_nl", "type": "multi_line_text_field", "value": "Placeholder NL ritual copy — SP-4 will replace." },
        { "namespace": "custom", "key": "ritual_description_en", "type": "multi_line_text_field", "value": "Placeholder EN ritual copy — SP-4 will replace." }
      ]
    }
    ```
  - **Verify:** MCP `get-product` with handle `hers` returns `status: "ACTIVE"`, `metafield(namespace: "custom", key: "product_family").value == "hers"`, `totalInventory > 0`.
  - **Commit:** Skip.

- [ ] **Task 8: Create DUO product via MCP**
  - **Where:** MCP tool `create-product`
  - **What:** DUO is modelled as a single variant for MVP (per Task 1 decision; revisit composite bundle in Phase 2).
    ```json
    {
      "title": "DUO",
      "handle": "duo",
      "vendor": "Sensual Sweets",
      "productType": "Confectionery",
      "status": "ACTIVE",
      "tags": ["duo", "couples", "sensual-sweets"],
      "variants": [
        {
          "sku": "SS-DUO-01",
          "price": "<price set by Michael at execution>",
          "weight": 120,
          "weightUnit": "GRAMS",
          "requiresShipping": true,
          "inventoryManagement": "SHOPIFY",
          "inventoryQuantity": 50,
          "taxable": true
        }
      ],
      "metafields": [
        { "namespace": "custom", "key": "product_family", "type": "single_line_text_field", "value": "duo" },
        { "namespace": "custom", "key": "intent_keywords", "type": "list.single_line_text_field", "value": "[]" },
        { "namespace": "custom", "key": "ritual_description_nl", "type": "multi_line_text_field", "value": "Placeholder NL ritual copy — SP-4 will replace." },
        { "namespace": "custom", "key": "ritual_description_en", "type": "multi_line_text_field", "value": "Placeholder EN ritual copy — SP-4 will replace." }
      ]
    }
    ```
  - **Verify:** MCP `get-product` with handle `duo` returns `status: "ACTIVE"`, `metafield(namespace: "custom", key: "product_family").value == "duo"`, `totalInventory > 0`. Also `search_products` query `tag:duo` returns exactly 1 product.
  - **Commit:** Skip.

- [ ] **Task 9: Upload packshots and assign to products**
  - **Where:** Shopify Admin → Products → (each product) → Media → Add files (UI is faster for multi-asset uploads with positioning). Source assets live in `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/public/packshots/`.
  - **What:** Assign images per family:
    - **DUO** → primary: `hero.jpg`; gallery: `tall.jpg`, then any `angle-*.jpg` that feature both products together.
    - **HIS** → primary: the blue-coded `angle-a.jpg` (verify with Michael which file is blue-coded); gallery: 2 additional HIS angles.
    - **HERS** → primary: the red-coded `angle-*.jpg`; gallery: 2 additional HERS angles.
    - Set alt text per image: `Sensual Sweets <family> — <angle short description>`. Alt text must be **compliance-safe** (no banned terms — see SP-4 banned-terms list).
    - Wordmark logo (if present in `public/`) → Online Store → Themes → Customize → Brand assets (not on PDP).
  - **Verify:** MCP `get-product` for each handle returns `images.edges.length >= 3`. MCP `graphql_query` — `{ product(handle: "his") { images(first: 5) { edges { node { url altText } } } } }` (and same for `hers`, `duo`); assert each `altText` is non-empty and does not match any banned-term in SP-4's regex list (visual check is acceptable for SP-1).
  - **Commit:** Skip (images live on Shopify CDN).

- [ ] **Task 10: Create `all` and `couples` collections via MCP**
  - **Where:** MCP tools `create-collection` + `add-to-collection`
  - **What:**
    - **`all` collection** (smart/automatic): all products tagged `sensual-sweets`.
      ```graphql
      mutation {
        collectionCreate(input: {
          title: "All Products"
          handle: "all"
          ruleSet: {
            appliedDisjunctively: false
            rules: [{ column: TAG, relation: EQUALS, condition: "sensual-sweets" }]
          }
        }) { collection { id handle } userErrors { field message } }
      }
      ```
      (Use `create-collection` MCP tool; fall through to `graphql_mutation` if the tool does not expose rule sets.)
    - **`couples` collection** (manual): create empty, then `add-to-collection` with the DUO product GID.
  - **Verify:** MCP `get-collection` with handle `all` returns `productsCount >= 3`. MCP `get-collection` with handle `couples` returns `productsCount == 1` and `products.edges[0].node.handle == "duo"`. MCP `search_collections` query `couples` returns the collection.
  - **Commit:** Skip.

- [ ] **Task 11: Create custom app + Storefront API access token**
  - **Where:** Shopify Admin → Settings → Apps and sales channels → Develop apps → Create an app → name `Sensual Sweets Storefront`.
  - **What:**
    - Configuration → Storefront API integration → Configure → enable scopes:
      - `unauthenticated_read_product_listings`
      - `unauthenticated_read_product_inventory`
      - `unauthenticated_write_checkouts`
      - `unauthenticated_read_checkouts`
      - `unauthenticated_write_customers`
      - `unauthenticated_read_customers`
      - `unauthenticated_read_content`
    - Save → Install app → reveal Storefront access token (single-show; copy immediately).
    - Store in 1Password under entry `Sensual Sweets — Shopify Storefront`:
      - `SHOPIFY_STORE_DOMAIN`: `<shop>.myshopify.com`
      - `SHOPIFY_STOREFRONT_TOKEN`: `<token>`
      - `SHOPIFY_STOREFRONT_API_VERSION`: `2025-10`
      - Admin contact email
    - Write the token to `.env.local` locally (gitignored): `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=...`, `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=...`, `SHOPIFY_STOREFRONT_API_VERSION=2025-10`.
    - Update (or create) `.env.example` in repo with **placeholders only** — never the real token:
      ```
      NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-shop.myshopify.com
      NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      SHOPIFY_STOREFRONT_API_VERSION=2025-10
      ```
    - Run `git status` and confirm `.env.local` does NOT appear (must be gitignored). If it does, add to `.gitignore` immediately before continuing.
  - **Verify:** Issue a sample Storefront query from the terminal:
    ```bash
    curl -s -X POST "https://<shop>.myshopify.com/api/2025-10/graphql.json" \
      -H "X-Shopify-Storefront-Access-Token: $NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"query":"{ products(first:3){ edges { node { handle title } } } }"}'
    ```
    Assert HTTP 200 + JSON contains the 3 product handles (`his`, `hers`, `duo`). If the token is rejected, regenerate via the custom app UI.
  - **Commit:** Yes — `.env.example` only. `git add .env.example` (and `.gitignore` if updated) → commit message in Task 16.

- [ ] **Task 12: Configure NL shipping zone (flat rate placeholder €4.95)**
  - **Where:** Shopify Admin → Settings → Shipping and delivery → General shipping rates → Manage rates.
  - **What:**
    - Confirm a shipping profile named `General` exists. Inside, the default zone should be empty or contain the home country only.
    - Add zone `Netherlands` (if not present), containing only `Netherlands`.
    - Add a rate: name `Standaard NL`, type `Flat rate`, price `€4.95` (tax-inclusive per Task 14 setting), conditions: none.
    - Document in Task 1 choices doc: "Switch to carrier-calculated via Sendcloud post-launch once volume justifies — Phase 2."
  - **Verify:** MCP `graphql_query` — `{ deliveryProfiles(first:5){ edges { node { name profileLocationGroups { locationGroupZones(first:5){ edges { node { zone { name countries { code { countryCode } } } methodDefinitions(first:5){ edges { node { name rateProvider { ... on DeliveryRateDefinition { price { amount currencyCode } } } } } } } } } } } } } }`. Assert one zone `Netherlands` with `countryCode: NL` and one method `Standaard NL` priced `4.95 EUR`.
  - **Commit:** Skip.

- [ ] **Task 13: Install Sendcloud Shopify app + connect carriers**
  - **Where:** Shopify Admin → Apps → Shopify App Store → search `Sendcloud` → Install.
  - **What:**
    - Authorise the app (requires Sendcloud account credentials — confirm Michael has them ready before starting this task).
    - In Sendcloud dashboard: Settings → Carriers → enable contracted carriers (PostNL minimum for NL).
    - Pickup location: configure 3PL pickup address (or Michael's address as Day-1 fallback).
    - Sendcloud → Integrations → Shopify → verify connection status is `Connected`.
    - **Smoke test:** create a synthetic test order in Shopify Admin (Draft order → mark as paid with test payment). Confirm it appears in the Sendcloud `Incoming Orders` tab within 2 minutes.
  - **Verify:** MCP `list-orders` returns the synthetic order. In Sendcloud dashboard, the same order appears in `Incoming Orders` with status `Ready to ship`. Document the test-order ID in `/docs/decisions/2026-05-19-shopify-provisioning-choices.md` (append a `Sendcloud smoke test` line). If Sendcloud carrier contract is not yet signed, mark `BLOCKED — manual fulfillment Day 1 fallback acceptable` and continue.
  - **Commit:** Skip (Sendcloud setup is platform-side).

- [ ] **Task 14: Configure NL tax (BTW) — flag for accountant sign-off**
  - **Where:** Shopify Admin → Settings → Taxes and duties → European Union (or Netherlands directly).
  - **What:**
    - Enable `Include tax in prices` (storefront shows tax-inclusive pricing per spec).
    - Set Netherlands BTW rate: default to `21%` as the safe placeholder.
    - **Flag in `/docs/decisions/2026-05-19-shopify-provisioning-choices.md`:** "BTW rate for adult confectionery may be 9% reduced — requires written accountant confirmation before launch. Current setting: 21%. Owner: Michael."
    - Settings → Taxes and duties → Tax registrations → add NL BTW registration with BTW number from Task 1 (if issued; otherwise leave pending and flag).
  - **Verify:** MCP `graphql_query` — `{ shop { taxesIncluded taxShipping } }`. Assert `taxesIncluded: true`. Admin UI screenshot of the NL rate at 21% attached to the choices doc.
  - **Commit:** Skip (will fold into Task 16 final commit).

- [ ] **Task 15: Create policy URL stubs (6 pages, placeholder copy)**
  - **Where:** Shopify Admin → Online Store → Pages → Add page (×6). Use `graphql_mutation` `pageCreate` if scripting is preferred.
  - **What:** Create 6 pages, each with title + handle + minimal "Coming soon — final content lands in SP-4." body. All must be published so the URLs resolve 200.

    | Title (NL) | Handle |
    |---|---|
    | Algemene Voorwaarden | `algemene-voorwaarden` |
    | Privacybeleid | `privacybeleid` |
    | Verzendbeleid | `verzendbeleid` |
    | Retourbeleid | `retourbeleid` |
    | Cookiebeleid | `cookiebeleid` |
    | Leeftijdsbeleid (18+) | `leeftijdsbeleid` |

    Example mutation:
    ```graphql
    mutation {
      pageCreate(page: {
        title: "Algemene Voorwaarden"
        handle: "algemene-voorwaarden"
        body: "<p>Coming soon — content owned by SP-4.</p>"
        published: true
      }) { page { id handle onlineStoreUrl } userErrors { field message } }
    }
    ```
    Then Settings → Policies → link each page to the corresponding Shopify policy slot where the slot exists (Refund, Privacy, Terms of service, Shipping). Cookies and Age policies have no native slot — leave as standalone pages.
  - **Verify:** For each handle, `curl -s -o /dev/null -w "%{http_code}" https://<shop>.myshopify.com/pages/<handle>` returns `200`. MCP `graphql_query` — `{ pages(first: 10) { edges { node { handle title isPublished } } } }` returns all 6, each `isPublished: true`.
  - **Commit:** Skip.

- [ ] **Task 16: End-to-end verification + completion record + final commit**
  - **Where:** MCP tools + repo `/docs/decisions/`
  - **What:** Run the full verification battery and record results:
    1. `get-shop-info` → capture plan, currency, timezone, weight unit, Shopify Payments status.
    2. `search_products` (query empty / `*`) → assert 3 products returned, all `status: ACTIVE`.
    3. `get-product` for each of `his`, `hers`, `duo` → assert: 1 variant, `totalInventory > 0`, all 4 metafields present and populated, `images.edges.length >= 3`.
    4. `get-inventory-levels` for each variant → assert quantity matches the values seeded in Tasks 6–8 (allow drift if Michael adjusted manually).
    5. `get-collection` for `all` (≥3 products) and `couples` (1 product, DUO).
    6. Storefront API curl probe from Task 11 — re-run, assert 200 + product handles returned.
    7. Run `run-analytics-query` with a smoke `SELECT 1` equivalent (e.g., `SHOW orders SINCE -1d`) to confirm analytics access works.
    8. Create `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/docs/decisions/2026-05-19-shopify-provisioning-complete.md` documenting:
       - Shop URL, plan, currency, timezone, weight unit
       - Shopify Payments status (Active / Pending review with submission date)
       - Markets + locales configured (NL primary published, EN unpublished)
       - 3 SKUs with handles, variant IDs (GIDs), inventory, metafield coverage
       - Collections (`all`, `couples`) with member counts
       - Storefront API: token issued (last 4 chars only), API version pinned `2025-10`, sample query verified
       - Shipping: NL zone with `Standaard NL` flat €4.95
       - Sendcloud: connected + smoke test order ID (or `BLOCKED` if carrier contract pending)
       - Tax: NL 21% set, BTW number registered, accountant sign-off pending (named blocker)
       - Policy pages: 6 stubs published with handles + URLs
       - Outstanding items handed to SP-2 (token in `.env.local`, fragments must exclude `intent_keywords`)
       - Outstanding items handed to SP-4 (replace placeholder ritual descriptions, fill policy pages, counsel review)
       - Outstanding items handed to SP-5 (BTW rate confirmation, Sendcloud carrier contract if blocked, production branch policy)
  - **Verify:** All 7 MCP checks above return expected values OR the failing check is logged as a named blocker in the completion doc with owner + ETA. Completion doc exists at the declared path and lists all 11+ bullets.
  - **Commit:** Yes — final commit folding in `.env.example` from Task 11 and both decision docs from Tasks 1 and 16:
    ```bash
    git add docs/decisions/2026-05-19-shopify-provisioning-choices.md \
            docs/decisions/2026-05-19-shopify-provisioning-complete.md \
            .env.example
    # add .gitignore if it was modified in Task 11
    git commit -m "feat(sp-1): provision Shopify backend — store, products, metafields, Storefront token, NL shipping, Sendcloud, policy stubs"
    ```
    **No `Co-Authored-By` trailer.**

---

## Done-when

SP-1 is complete when every task checkbox above is ticked, the completion document at `/docs/decisions/2026-05-19-shopify-provisioning-complete.md` is committed, and the Storefront API curl probe in Task 16 step 6 returns the 3 product handles. Any unresolved items (Shopify Payments still in `Pending review`, BTW accountant sign-off, Sendcloud carrier contract) must be logged as named blockers with owners in the completion document — they do not prevent SP-2 from starting, but they block SP-5 (launch).
