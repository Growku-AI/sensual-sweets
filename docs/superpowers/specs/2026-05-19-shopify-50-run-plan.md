# Sensual Sweets — 50-Run Scheduled Agent Plan

**Date:** 2026-05-19
**Branch base:** `feat/shopify-store-build` (already cut from `dev`)
**Plan owner:** Michael (growku.nl)
**Plan runtime model:** **One run per scheduled tick.** A scheduled task wakes Claude, Claude reads `docs/superpowers/state/run-state.json`, picks the next `status: "pending"` run whose dependencies are all `status: "done"`, executes it end-to-end, commits, updates state, exits. No human in the loop unless `requires_human: true`.
**Source spec:** `docs/superpowers/specs/2026-05-19-shopify-store-design.md` (SP-0..SP-5)
**Goal:** Fully functioning Sensual Sweets webshop on the web, live transactions, compliant copy, NL + EN, observable, rollback-able.

---

## 0. How a scheduled run works

Each run in this plan is **self-contained** and **idempotent**:

1. **Wake.** Scheduled task fires (cadence: see §1). Cowork session opens this repo.
2. **Bootstrap.** Read `CLAUDE.md`, `AGENTS.md`, this file, and `docs/superpowers/state/run-state.json`.
3. **Select.** Pick the first run where `status == "pending"` and every `depends_on` is `"done"`. If none, exit clean (heartbeat-only).
4. **Skill warm-up.** Invoke listed skills in order. For Next.js work the agent MUST read `node_modules/next/dist/docs/` before writing any Next.js feature code (per `AGENTS.md`).
5. **Execute.** Follow the run's checklist. Use `superpowers:test-driven-development` for any code-producing run.
6. **Verify.** Run the listed acceptance checks. If any fail → `status: "blocked"`, write `notes`, exit. **Never mark `done` without evidence.**
7. **Commit & PR.** Conventional Commit on the run's branch (`feat/run-NN-slug`). Open or update PR `Run NN: <title>` into `feat/shopify-store-build`. CI runs.
8. **Update state.** Patch `run-state.json` with `status`, `pr_url`, `commit_sha`, `evidence` paths, `next_recommended`.
9. **Memory hook.** If the run produced a non-obvious decision (e.g. headless-vs-Liquid, hosting choice, agent definition), write a feedback or project memory under `~/.../memory/` per the auto-memory protocol.

**State file shape** (created in Run 01):

```jsonc
{
  "plan_version": "2026-05-19",
  "runs": [
    {
      "id": "01",
      "slug": "bootstrap-state",
      "status": "pending",          // pending | running | done | blocked | skipped
      "depends_on": [],
      "branch": "feat/run-01-bootstrap-state",
      "pr_url": null,
      "commit_sha": null,
      "evidence": [],
      "notes": "",
      "started_at": null,
      "finished_at": null
    }
    // ...50 entries
  ]
}
```

---

## 1. Schedule cadence (proposal)

- **Cadence:** every 4 hours, Mon–Sat, 08:00–20:00 Europe/Amsterdam — six ticks/day.
- **Pace:** with parallel-eligible runs and human-gated runs, expect ~6–10 effective runs/day → MVP launch in **8–10 working days** from kickoff.
- **Pause conditions:** any run that flips `status: "blocked"` halts the queue until Michael resolves it; the next tick will see the block and exit clean.
- **Heartbeat:** a tick with no eligible run posts a one-liner to chat: "No runs eligible — last completed: Run NN" and exits.

> Concrete `mcp__scheduled-tasks__create_scheduled_task` call lives in **Run 01**.

---

## 2. Run roadmap (visual)

```
PHASE A — Foundation & decisions (Runs 01–08)
  01 Bootstrap state  ─┐
  02 [HUMAN] Headless vs Liquid vs Hybrid decision gate ─┐
  03 [HUMAN] Hosting decision (Vercel / Cloudflare / Netlify) ─┐
  04 SP-0 token rename + canonical component-class port ─┘
  05 SP-0 drift-check runbook + light-theme block
  06 SP-0 compliance scan of existing copy → ticket list
  07 Higgsfield illustration brief & shotlist
  08 [HUMAN] Shopify provisioning kickoff (KVK/IBAN/Payments)

PHASE B — Shopify backend (Runs 09–16)
  09 SP-1 Custom app + Storefront token (after 08)
  10 SP-1 Metafield schema via MCP graphql_mutation
  11 SP-1 Create 3 products (HIS/HERS/DUO) via MCP create-product
  12 SP-1 Upload packshots + assign per-family imagery
  13 SP-1 Collections (all, couples) + sanity verify
  14 SP-1 NL shipping zone + BTW + policy URL stubs
  15 SP-1 Sendcloud install + synthetic test order
  16 SP-1 Acceptance gate + evidence dump

PHASE C — Storefront integration (Runs 17–22)
  17 SP-2 Install hydrogen-react + storefront-api-client (verify R19 peer dep)
  18 SP-2 client.ts + fragments + queries + types
  19 SP-2 cart-cookie + CartProvider wiring
  20 SP-2 Cache Components — read Next 16 docs FIRST, then implement
  21 SP-2 Smoke: PLP fetch from RSC; cart create from client
  22 SP-2 Acceptance gate + evidence dump

PHASE D — Shop UI + illustrations (Runs 23–32)
  23 SP-3 Route scaffold /[locale]/shop + /[locale]/shop/[handle]
  24 SP-3 ProductCard + ProductGallery + PriceTag
  25 SP-3 AddToCartButton (client) + SoldOutBadge
  26 SP-3 Cart drawer (Radix Dialog) + dynamic import
  27 SP-3 CartIcon + CartDrawerContext in locale layout
  28 SP-3 Wire landing CTAs to /[locale]/shop
  29 Higgsfield batch 1 — ritual / lifestyle scenes (compliant)
  30 Higgsfield batch 2 — abstract texture / ambient backgrounds
  31 SP-3 Integrate new illustrations across PLP + PDP
  32 SP-3 Acceptance gate (Lighthouse, a11y, reduced-motion)

PHASE E — Content, i18n, compliance (Runs 33–39)
  33 SP-4 next-intl install + middleware + routing
  34 SP-4 Externalize all UI copy (NL+EN) — Hero/Benefits/etc.
  35 SP-4 Product copy (his/hers/duo).{nl,en}.json
  36 SP-4 Legal MDX stubs both locales
  37 SP-4 banned-terms lint + scripts/check-compliance.ts + pre-commit
  38 SP-4 Language switcher + footer age disclosure
  39 SP-4 Sync product copy → Shopify metafields (one-way)

PHASE F — Custom agents + ops (Runs 40–46)
  40 Build "compliance-watchdog" subagent via /plugin-dev:agent-development
  41 Build "metafield-sync" subagent
  42 Build "ritual-translator" subagent
  43 SP-5 Hosting provisioning (per Run 03 decision) — domain, env matrix
  44 SP-5 Playwright golden path + Lighthouse CI
  45 SP-5 Analytics + uptime probe + rollback runbook
  46 SP-5 Pre-launch checklist dry run

PHASE G — Liquid surface area + launch (Runs 47–50)
  47 [conditional on Run 02] Liquid: theme app extension or hybrid shell
  48 SP-5 End-to-end real paid test order + Sendcloud handoff
  49 SP-5 Launch: DNS flip, production env, smoke
  50 Post-launch: memory consolidation, retro, Phase 2 ticket seed
```

---

## 3. Run specifications

> Convention: every run lists **Skills to invoke**, **Inputs**, **Deliverables**, **Acceptance**, **Branch**, **Depends-on**, and **Human-gated?** Skill names are slash-prefixed where they're slash-commands (`/shopify-plugin:shopify-dev`), bare names where they're skill identifiers.

---

### Run 01 — Bootstrap plan state & scheduled task

- **Skills:** `superpowers:using-superpowers`, `superpowers:writing-plans`, `schedule`
- **Inputs:** this file
- **Deliverables:**
  - `docs/superpowers/state/run-state.json` populated with all 50 runs as `pending`.
  - `docs/superpowers/state/RUN-PROTOCOL.md` — the boot/select/execute/commit/update loop, copy-pasted from §0 for agent self-reference.
  - One `mcp__scheduled-tasks__create_scheduled_task` call: cron `0 8,12,16,20 * * 1-6`, prompt = "Open /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets, read docs/superpowers/specs/2026-05-19-shopify-50-run-plan.md and docs/superpowers/state/RUN-PROTOCOL.md, pick the next eligible run, execute it."
- **Acceptance:** `run-state.json` parses; scheduled task ID returned and saved to state.
- **Branch:** `feat/run-01-bootstrap-state`
- **Depends-on:** —
- **Human-gated?** No

---

### Run 02 — Decision gate: Headless vs Liquid vs Hybrid

- **Skills:** `/superpowers:brainstorming`, `/shopify-plugin:shopify-dev`, `/shopify-plugin:shopify-liquid`, `/shopify-plugin:shopify-hydrogen`, `/engineering:architecture`
- **Inputs:** existing spec, current Next.js codebase, brand requirements
- **Deliverables:** `docs/decisions/2026-05-19-storefront-architecture.md` — three options scored on **time-to-launch, brand fidelity, checkout extensibility, compliance lint feasibility, future Liquid app/email needs, hosting cost**:
  - **A. Pure headless (current spec)** — Next.js + Storefront API + Shopify-hosted checkout. Highest fidelity, highest build cost.
  - **B. Pure Liquid theme** — Dawn-derived theme, Liquid sections matching the dark-violet design. Lowest build cost, highest checkout extensibility, hardest to match the current Framer-Motion fidelity.
  - **C. Hybrid (recommended starting position)** — Liquid theme owns admin surface (checkout extensions, transactional email, order status page, cart polish) + Next.js owns marketing site (`/`, `/nl`, `/en`, blog later). PDP can live in either; recommend Liquid PDP backed by metafields for compliance + edit-in-admin ergonomics. Storefront API still wired for any future custom touches.
- **Acceptance:** Decision logged with rationale + explicit reversal cost; Michael's signoff captured in PR description. Subsequent runs branch on the decision: if A, Runs 47 collapses to "skip"; if B, Runs 17–22 + 23–32 collapse to a Liquid theme equivalent; if C, both tracks run but trimmed.
- **Branch:** `feat/run-02-storefront-architecture-decision`
- **Depends-on:** 01
- **Human-gated?** **Yes** — Michael selects A/B/C in the PR.

---

### Run 03 — Decision gate: Hosting

- **Skills:** `/superpowers:brainstorming`, `/netlify-skills:netlify-frameworks`, `cloudflare:workers-best-practices`, `cloudflare:cloudflare`, `/engineering:architecture`
- **Inputs:** Run 02 outcome (only matters for the Next.js portion)
- **Deliverables:** `docs/decisions/2026-05-19-hosting.md` — three options scored on **Next 16 Cache Components support, EU residency, edge cost, cold start, build-time, ENV management ergonomics, Sentry/observability fit, rollback speed**:
  - **A. Vercel (spec default)** — first-party Next.js, Cache Components GA-tested, EU regions, DPA included, `vercel rollback` < 5min. Cost climbs on bandwidth.
  - **B. Cloudflare Workers + Next on Pages / Workers Assets** — cheapest egress, global edge, but Cache Components support lags Vercel by ~1 minor; some Node APIs missing.
  - **C. Netlify** — solid Next.js adapter, decent EU edge, Netlify Database + Blobs available if we ever need a side DB; less Next-16-first-day than Vercel.
- **Acceptance:** Decision logged, env-matrix updated, Run 43 picks the chosen provider.
- **Branch:** `feat/run-03-hosting-decision`
- **Depends-on:** 01
- **Human-gated?** **Yes** — Michael picks A/B/C.

---

### Run 04 — SP-0 token rename + canonical class port

- **Skills:** `/web-design-system-v2:design-brief` (only for reference), `/superpowers:test-driven-development`, `/superpowers:verification-before-completion`
- **Inputs:** `src/app/globals.css`, `sensual-sweets-design/sensual-sweets.css`
- **Deliverables:** `globals.css` byte-mirrors the canonical CSS with the locked divergences from SP-0; all component classes listed in spec exist; no `--ss-` substrings remain.
- **Acceptance:** SP-0 checklist (spec lines 107–113) green; `npm run build` clean.
- **Branch:** `feat/run-04-sp0-token-rename`
- **Depends-on:** 01

---

### Run 05 — SP-0 drift-check runbook + light-theme block

- **Skills:** `/engineering:documentation`
- **Deliverables:** `docs/design/drift-check.md`; `[data-theme="light"]` block added to globals.
- **Acceptance:** SP-0 acceptance remaining items green.
- **Branch:** `feat/run-05-sp0-drift-check`
- **Depends-on:** 04

---

### Run 06 — SP-0 → SP-4 prep: compliance scan of existing copy

- **Skills:** `/marketing:brand-review`
- **Deliverables:** `docs/decisions/2026-05-19-compliance-debt.md` — file:line list of every banned NL/EN term currently in `src/components/sections/*.tsx`, grouped by file. **No rewrites yet** (that's SP-4). This output seeds Run 37's banned-terms list and gives Michael a clear scope.
- **Acceptance:** Every banned phrase identified in spec §SP-4 has an entry with a proposed compliant replacement.
- **Branch:** `feat/run-06-compliance-debt-scan`
- **Depends-on:** 04

---

### Run 07 — Higgsfield illustration brief & shotlist

- **Skills:** `/web-design-system-v2:archetype-photo-landing`, `/marketing:campaign-plan`
- **Notes on Higgsfield connector:** Higgsfield isn't in the registry today, so this run runs `mcp__mcp-registry__search_mcp_registry(["higgsfield"])` first. If unavailable, fall back to: (a) `mcp__53e4a96b-...__generate_image` via the marketing-studio connector, or (b) Adobe Firefly via `adobe-for-creativity:adobe-design-from-template`. Decision logged in the run's PR.
- **Deliverables:** `docs/design/illustration-shotlist.md` — 20 prompts spread across **ritual scenes** (couples sharing a moment, candlelit table close-ups, hands meeting over a plate — no nudity, no overt sexual content; brand-compliant), **abstract textures** (silk folds, melted-sugar swirls, neon-edged gradients) and **packshot complements** (HIS blue glow, HERS red glow, DUO magenta gradient). Each prompt tagged with target use site (Hero, PLP card, PDP gallery slot 2/3, Benefits, Footer band) and aspect ratio.
- **Acceptance:** Shotlist reviewed by Michael in PR; first 5 prompts marked "ready to render in Run 29".
- **Branch:** `feat/run-07-illustration-shotlist`
- **Depends-on:** 01
- **Human-gated?** **Yes** — Michael approves the prompt set (compliance + tone).

---

### Run 08 — Shopify provisioning kickoff (KVK / IBAN / Payments)

- **Skills:** `/shopify-plugin:shopify-onboarding-merchant`
- **Inputs:** Michael provides KVK, BTW, IBAN, ID, shop-name decision (claim vs new)
- **Deliverables:** `docs/decisions/2026-05-19-shopify-account.md` capturing shop URL, plan tier (Basic confirmed), Payments KYC submission date, expected approval window.
- **Acceptance:** Shop exists at `*.myshopify.com`, Payments application submitted (status visible in admin), MCP `mcp__221ab681-...__switch-shop` confirms agent can reach the shop.
- **Branch:** `feat/run-08-shopify-account`
- **Depends-on:** 02
- **Human-gated?** **Yes** — Michael does the KYC manually inside Shopify admin; the agent only logs the outcome.

---

### Run 09 — Custom app + Storefront token

- **Skills:** `/shopify-plugin:shopify-dev`, `/shopify-plugin:shopify-admin`
- **Deliverables:** Custom app created with the Storefront scopes listed in spec §SP-1 step 9; token issued; saved to 1Password + `.env.local` (never committed); `.env.example` updated with placeholder + comment.
- **Acceptance:** A direct `curl` to the Storefront API with the new token returns a 200 against `products` query. Token never appears in git history.
- **Branch:** `feat/run-09-storefront-token`
- **Depends-on:** 08

---

### Run 10 — Metafield schema

- **Skills:** `/shopify-plugin:shopify-custom-data`, `/shopify-plugin:shopify-admin`
- **Deliverables:** Four metafield definitions (spec §SP-1 table) created via `mcp__221ab681-...__graphql_mutation` calling `metafieldDefinitionCreate`. Pinned to product detail view. **`custom.intent_keywords` MUST be created with admin-only visibility / no storefront API access** — verify by attempting to fetch it via Storefront and confirming a 401/empty response.
- **Acceptance:** All four definitions visible in Admin; storefront fetch of `intent_keywords` confirmed blocked.
- **Branch:** `feat/run-10-metafields`
- **Depends-on:** 09

---

### Run 11 — Create 3 products (HIS / HERS / DUO)

- **Skills:** `/shopify-plugin:shopify-admin`, `/shopify-plugin:shopify-custom-data`
- **Deliverables:** Three products via `mcp__221ab681-...__create-product`. Each: single variant, inventory tracked, `requires_shipping: true`, vendor "Sensual Sweets", product type "Confectionery", placeholder price (€-confirmed-by-Michael-in-PR), metafields populated from a stub bilingual snippet pending Run 34.
- **Acceptance:** `search_products` returns all three with metafields and `product_family ∈ {his, hers, duo}`.
- **Branch:** `feat/run-11-products`
- **Depends-on:** 10

---

### Run 12 — Upload packshots + per-family imagery

- **Skills:** `/shopify-plugin:shopify-admin`
- **Deliverables:** Hero/angle/tall packshots uploaded; DUO gets `hero.jpg` as primary; HIS gets `angle-a/b.jpg`; HERS gets `angle-d/e.jpg`; `tall.jpg` shared as secondary. Wordmarks added to brand assets, not PDP.
- **Acceptance:** Each PDP shows ≥3 images, primary correct, alt text bilingual stub set.
- **Branch:** `feat/run-12-packshots`
- **Depends-on:** 11

---

### Run 13 — Collections + sanity verify

- **Skills:** `/shopify-plugin:shopify-admin`
- **Deliverables:** `all` (smart, all products) + `couples` (manual, DUO only) via `create-collection` + `add-to-collection`.
- **Acceptance:** `mcp__221ab681-...__get-collection` returns expected membership; `mcp__221ab681-...__get-shop-info` shows correct currency/timezone.
- **Branch:** `feat/run-13-collections`
- **Depends-on:** 12

---

### Run 14 — NL shipping zone + BTW + policy URL stubs

- **Skills:** `/shopify-plugin:shopify-admin`
- **Deliverables:** NL flat-rate "Standard NL" (€4.95 placeholder, flagged for Michael); BTW set per Michael's accountant (default 21%, ticket if 9%); six policy pages published as "Coming soon" stubs (Algemene Voorwaarden, Privacybeleid, Verzendbeleid, Retourbeleid, Cookiebeleid, Leeftijdsbeleid).
- **Acceptance:** All six URLs 200; checkout in admin preview shows shipping option.
- **Branch:** `feat/run-14-shipping-policies`
- **Depends-on:** 13

---

### Run 15 — Sendcloud install + synthetic test order

- **Skills:** `/shopify-plugin:shopify-admin`, `/engineering:incident-response` (just to template a smoke-test report)
- **Deliverables:** Sendcloud Shopify app installed by Michael; agent fires a synthetic Shopify draft order, marks it paid, observes it land in Sendcloud dashboard.
- **Acceptance:** Sendcloud dashboard shows the test order; label generation works on a dummy.
- **Branch:** `feat/run-15-sendcloud`
- **Depends-on:** 14
- **Human-gated?** **Partial** — Michael authorises the Sendcloud OAuth step; agent does the rest.

---

### Run 16 — SP-1 acceptance gate + evidence dump

- **Skills:** `/superpowers:verification-before-completion`
- **Deliverables:** `docs/superpowers/state/evidence/sp-1.md` — screenshots / API responses ticking every SP-1 acceptance line.
- **Acceptance:** Every SP-1 checkbox green; otherwise this run is `blocked` and Michael fixes upstream.
- **Branch:** `feat/run-16-sp1-gate`
- **Depends-on:** 15

---

### Run 17 — Install hydrogen-react + storefront-api-client

- **Skills:** `/shopify-plugin:shopify-hydrogen`, `/superpowers:test-driven-development`
- **Pre-flight:** Read `node_modules/next/dist/docs/` for Next 16 cache + RSC sections. Verify hydrogen-react published peer-dep range vs. React 19.2.4. If capped at 18.x, add `package.json` `overrides` (per spec R3) and document in PR.
- **Deliverables:** Dependencies installed, lockfile updated, build clean.
- **Acceptance:** `npm run build` clean; no duplicate `react`/`graphql` runtimes.
- **Branch:** `feat/run-17-hydrogen-install`
- **Depends-on:** 09 (token exists for smoke), 04 (CSS layer settled)

---

### Run 18 — client.ts + fragments + queries + types

- **Skills:** `/shopify-plugin:shopify-storefront-graphql`, `/superpowers:test-driven-development`
- **Deliverables:** Files per spec §SP-2 file-by-file blueprint. Fragments **must exclude `custom.intent_keywords`** (compliance leak prevention).
- **Acceptance:** Unit tests for `query<T>()` error handling (4xx, GraphQL `errors[]`, network throw) green; TS strict, no `any`.
- **Branch:** `feat/run-18-shopify-client`
- **Depends-on:** 17

---

### Run 19 — cart-cookie + CartProvider wiring

- **Skills:** `/shopify-plugin:shopify-hydrogen`
- **Deliverables:** `src/lib/shopify/cart-cookie.ts` (HttpOnly, SameSite=Lax, Secure-in-prod, Path=/, 30-day Max-Age); `ShopifyProvider` + `CartProvider` wrapped in `src/app/layout.tsx` (or locale layout once SP-4 lands — annotate TODO).
- **Acceptance:** Setting/clearing the cookie works in a smoke test; `useCart()` boots in a client component.
- **Branch:** `feat/run-19-cart-cookie`
- **Depends-on:** 18

---

### Run 20 — Cache Components for product fetches

- **Skills:** **Read `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` FIRST**, then `/shopify-plugin:shopify-storefront-graphql`
- **Deliverables:** `'use cache'` + `cacheLife('hours')` + `cacheTag('products')` on product fetches; `cacheComponents: true` set in `next.config.ts`; cart-reading RSCs wrapped in `<Suspense>`.
- **Acceptance:** Cache headers correct in a Vercel/Cloudflare preview; cache tag invalidation tested via a future webhook stub.
- **Branch:** `feat/run-20-cache-components`
- **Depends-on:** 19

---

### Run 21 — Smoke: PLP fetch RSC + client cart create

- **Skills:** `/superpowers:test-driven-development`, `/superpowers:verification-before-completion`
- **Deliverables:** Temporary `src/app/_smoke/page.tsx` that renders the 3 products and a single AddToCart button; deleted at end of run; Playwright assertion against the smoke route.
- **Acceptance:** End-to-end works on local + preview; cart cookie set after add.
- **Branch:** `feat/run-21-storefront-smoke`
- **Depends-on:** 20

---

### Run 22 — SP-2 acceptance gate

- **Skills:** `/superpowers:verification-before-completion`
- **Deliverables:** Evidence file per SP-2 acceptance criteria.
- **Acceptance:** All SP-2 boxes green.
- **Branch:** `feat/run-22-sp2-gate`
- **Depends-on:** 21

---

### Run 23 — Route scaffold `/[locale]/shop` + `/[locale]/shop/[handle]`

- **Skills:** `/feature-dev:feature-dev`
- **Deliverables:** Route files per spec §SP-3 route map; `generateStaticParams` for `his|hers|duo`.
- **Acceptance:** Routes render placeholder content from real Shopify data.
- **Branch:** `feat/run-23-shop-routes`
- **Depends-on:** 22

---

### Run 24 — ProductCard + ProductGallery + PriceTag

- **Skills:** `/frontend-design:frontend-design`
- **Deliverables:** Three Server Components per spec §SP-3 component blueprint, styled via canonical classes (`card-ss-his`, `card-ss-hers`, `card-ss-duo`).
- **Acceptance:** PLP cards visually match the design's family theming.
- **Branch:** `feat/run-24-product-card`
- **Depends-on:** 23

---

### Run 25 — AddToCartButton + SoldOutBadge

- **Skills:** `/frontend-design:frontend-design`, `/superpowers:test-driven-development`
- **Deliverables:** Client components; `aria-disabled` + `badge-ss-warn` when unavailable; inline `role="alert"` toast on mutation failure.
- **Acceptance:** Sold-out and error paths tested.
- **Branch:** `feat/run-25-add-to-cart`
- **Depends-on:** 24

---

### Run 26 — Cart drawer (Radix Dialog) + dynamic import

- **Skills:** `/frontend-design:frontend-design`
- **Deliverables:** `CartDrawer` with focus trap, ESC close, dynamic-imported (`ssr: false`); `useReducedMotion()` branch.
- **Acceptance:** Drawer opens, closes, qty +/- works, checkout button reads `cart.checkoutUrl`.
- **Branch:** `feat/run-26-cart-drawer`
- **Depends-on:** 25

---

### Run 27 — CartIcon + CartDrawerContext

- **Skills:** `/frontend-design:frontend-design`
- **Deliverables:** Header CartIcon + shared `CartDrawerContext` defined in locale layout (or pre-locale layout until Run 33 lands).
- **Acceptance:** Click icon → drawer opens; cart count badge live-updates.
- **Branch:** `feat/run-27-cart-icon`
- **Depends-on:** 26

---

### Run 28 — Wire landing CTAs to `/[locale]/shop`

- **Skills:** `/feature-dev:feature-dev`
- **Deliverables:** Hero "Shop now" CTA, Products card CTAs, Footer CTAs → `/[locale]/shop` (or `/[locale]/shop/<family>`).
- **Acceptance:** No dead links; Lighthouse SEO links audit clean.
- **Branch:** `feat/run-28-landing-ctas`
- **Depends-on:** 27

---

### Run 29 — Higgsfield batch 1: ritual / lifestyle (5 images)

- **Skills:** `adobe-for-creativity:adobe-design-from-template` (fallback), or Higgsfield via dynamic connector (per Run 07)
- **Deliverables:** 5 illustrations stored under `public/illustrations/ritual/` (`ritual-01..05.{webp,jpg}`); license + provenance recorded in `docs/design/illustration-license.md`.
- **Acceptance:** Compliance review (no banned visual semantics — nothing reads as overt sexual content; ritual/intimacy framing only); Michael approves in PR.
- **Branch:** `feat/run-29-illustrations-ritual`
- **Depends-on:** 07, 28
- **Human-gated?** **Yes** — Michael approves the visual set.

---

### Run 30 — Higgsfield batch 2: abstract / ambient (5 images)

- **Skills:** same connector path as Run 29
- **Deliverables:** 5 abstract / texture illustrations (`public/illustrations/ambient/`).
- **Acceptance:** PR review by Michael; assets optimised (`webp`, < 200KB each).
- **Branch:** `feat/run-30-illustrations-ambient`
- **Depends-on:** 29

---

### Run 31 — Integrate illustrations into PLP + PDP

- **Skills:** `/frontend-design:frontend-design`, `/web-design-system-v2:archetype-photo-landing`
- **Deliverables:** Ritual scenes used as background bands behind Hero/Benefits/HowItWorks; abstract textures used in PLP card overlays + PDP secondary gallery slots; `next/image` with correct `sizes`.
- **Acceptance:** LCP still < 2.5s on PDP; CLS stays 0.
- **Branch:** `feat/run-31-integrate-illustrations`
- **Depends-on:** 30

---

### Run 32 — SP-3 acceptance gate

- **Skills:** `/superpowers:verification-before-completion`, `/design:accessibility-review`
- **Deliverables:** Lighthouse runs on `/nl/shop` and `/nl/shop/his` (a11y ≥ 95, perf ≥ 80 mobile); reduced-motion verification; evidence file.
- **Acceptance:** All SP-3 boxes green.
- **Branch:** `feat/run-32-sp3-gate`
- **Depends-on:** 31

---

### Run 33 — next-intl install + middleware + routing

- **Skills:** `/feature-dev:feature-dev`
- **Deliverables:** `next-intl` installed (4.x line); `src/i18n/{config,routing,request}.ts`; `src/middleware.ts` with `createMiddleware`; default locale `nl`, always-prefix; matcher excludes `/api`, `/_next`, static; `NEXT_LOCALE` cookie set on first resolved request; existing routes moved under `/[locale]/`.
- **Acceptance:** `/` 302→`/nl`; `/en/...` renders English placeholder strings.
- **Branch:** `feat/run-33-next-intl`
- **Depends-on:** 32

---

### Run 34 — Externalize UI copy (NL + EN)

- **Skills:** `/design:ux-copy`, `/marketing:brand-review`
- **Deliverables:** `src/messages/nl.json` + `src/messages/en.json` covering nav, language switcher, footer + age disclosure, hero, benefits, products section landing, how-it-works, testimonials, shop grid, cart drawer, empty cart, sold-out, checkout entry, 404/500, cookie banner. **Replaces every banned phrase from Run 06** with the compliant rewrites in spec §SP-4 (and any new ones invented in this run, reviewed by Michael).
- **Acceptance:** `grep -rn "erotic\\|aphrodisiac\\|desire\\|libido"` etc. against `src/` returns zero; CI key-parity check passes.
- **Branch:** `feat/run-34-ui-copy`
- **Depends-on:** 33, 06

---

### Run 35 — Product copy (his/hers/duo).{nl,en}.json

- **Skills:** `/design:ux-copy`
- **Deliverables:** Three product JSON pairs with tagline, long description, ritual cue, ingredients (factual only).
- **Acceptance:** Compliance lint (Run 37) green when run early as smoke; Michael reviews tone in PR.
- **Branch:** `feat/run-35-product-copy`
- **Depends-on:** 34

---

### Run 36 — Legal MDX stubs both locales

- **Skills:** `/engineering:documentation`
- **Deliverables:** `src/messages/legal/{nl,en}/{terms,privacy,shipping,returns,cookies,age}.mdx` — drafts (clearly marked `<!-- DRAFT — pending NL counsel sign-off -->`).
- **Acceptance:** Files render through MDX pipeline; counsel ticket logged in `docs/decisions/`.
- **Branch:** `feat/run-36-legal-mdx`
- **Depends-on:** 33

---

### Run 37 — banned-terms lint + pre-commit + CI

- **Skills:** `/superpowers:test-driven-development`, `/marketing:brand-review`
- **Deliverables:** `src/lib/compliance/banned-terms.ts` (NL + EN regex list, per spec); `scripts/check-compliance.ts` walking `src/messages/**`, `src/components/**/*.tsx`, `src/app/**/*.tsx`; lint-staged hook + CI `verify` job; per-file allowlist comment grammar.
- **Acceptance:** `pnpm check:compliance` (or npm equivalent) exits 0; deliberately re-introducing "erotic" makes it exit 1; PR blocked.
- **Branch:** `feat/run-37-compliance-lint`
- **Depends-on:** 34

---

### Run 38 — Language switcher + footer age disclosure

- **Skills:** `/frontend-design:frontend-design`
- **Deliverables:** Switcher component using next-intl `<Link>`; footer band age disclosure in both locales (rendered server-side, no JS gate).
- **Acceptance:** Switcher visible on every page; cookie persists; footer line shows on `/nl/...` and `/en/...`.
- **Branch:** `feat/run-38-language-age`
- **Depends-on:** 33

---

### Run 39 — Sync product copy → Shopify metafields (one-way push)

- **Skills:** `/shopify-plugin:shopify-admin`, `/shopify-plugin:shopify-custom-data`
- **Deliverables:** `scripts/sync-copy-to-metafields.ts` using `mcp__221ab681-...__graphql_mutation` `metafieldsSet`. Reads `src/messages/products/*.json`, writes to `custom.ritual_description_nl` / `_en`. **CI runs this on merge to `feat/shopify-store-build`.**
- **Acceptance:** Shopify admin shows the rich-text copy; storefront API returns it through the `PRODUCT_FIELDS` fragment.
- **Branch:** `feat/run-39-copy-sync`
- **Depends-on:** 35, 37, 16

---

### Run 40 — Build "compliance-watchdog" subagent

- **Skills:** `/plugin-dev:agent-development`, `/plugin-dev:plugin-structure`
- **Deliverables:** `.claude/agents/compliance-watchdog.md` (or in a local plugin) — subagent that takes a file glob, runs `check-compliance.ts`, classifies failures into "banned term", "allowlist drift", "metafield mismatch with repo source", produces a Markdown report. **Hooks:** auto-invoke on `PostToolUse` for `Edit|Write` against `src/messages/**`, `src/components/**`, `src/app/**`.
- **Acceptance:** Forcing a banned-term edit triggers the watchdog in a test session; report file appears.
- **Branch:** `feat/run-40-compliance-watchdog`
- **Depends-on:** 37

---

### Run 41 — Build "metafield-sync" subagent

- **Skills:** `/plugin-dev:agent-development`
- **Deliverables:** Subagent invoked by the scheduled task (or by Run 39 CI) that diffs `src/messages/products/*.json` against Shopify metafields, pushes diffs, logs to `docs/superpowers/state/metafield-sync.log`.
- **Acceptance:** Edit a product JSON → run the agent → metafield updates; running again is a no-op.
- **Branch:** `feat/run-41-metafield-sync-agent`
- **Depends-on:** 39

---

### Run 42 — Build "ritual-translator" subagent

- **Skills:** `/plugin-dev:agent-development`, `/design:ux-copy`
- **Deliverables:** Subagent that, given an NL message file, drafts an EN counterpart (key-parity preserved) **and** runs it through `check-compliance` before writing the file. Adds `<!-- DRAFT — review -->` comments for any keys it had to invent rather than translate.
- **Acceptance:** Removing `en.json` keys and invoking the agent regenerates them with compliance lint green and matching key set.
- **Branch:** `feat/run-42-ritual-translator`
- **Depends-on:** 37

---

### Run 43 — Hosting provisioning (per Run 03)

- **Skills:** branch on Run 03 decision: `/netlify-skills:netlify-deploy` OR `cloudflare:wrangler` OR Vercel CLI (no plugin needed; `npx vercel`).
- **Deliverables:** Project linked, env vars uploaded from local `.env.local` (verify against the env matrix in spec §SP-5), preview URL live, custom-domain attached (pending DNS — see Run 49), `.env.example` committed.
- **Acceptance:** Preview deploy of `feat/shopify-store-build` renders PLP correctly.
- **Branch:** `feat/run-43-hosting`
- **Depends-on:** 32, 03

---

### Run 44 — Playwright golden path + Lighthouse CI

- **Skills:** `/engineering:testing-strategy`, `/superpowers:test-driven-development`
- **Deliverables:** `tests/e2e/golden-path.spec.ts` (land → shop → PDP → add → drawer → checkout host `*.shopify.com`); GitHub Action running on preview URLs; Lighthouse budgets a11y ≥ 95, perf ≥ 80 mobile, SEO ≥ 90.
- **Acceptance:** Both jobs green on a fresh preview.
- **Branch:** `feat/run-44-e2e-lighthouse`
- **Depends-on:** 43

---

### Run 45 — Analytics + uptime probe + rollback runbook

- **Skills:** `/engineering:incident-response`, `/engineering:documentation`
- **Deliverables:**
  - `src/lib/analytics.ts` wrapping `useCart()` effects (`cart_add`, `cart_remove`, `begin_checkout`).
  - Shopify Analytics + Vercel/Cloudflare/Netlify Analytics enabled per Run 03.
  - Synthetic monitor (Vercel Monitor / UptimeRobot) hitting `/`, `/nl/shop`, `/nl/shop/his` at 5-min cadence.
  - `docs/runbooks/rollback.md` — who, how, < 5min target.
- **Acceptance:** Synthetic failure (briefly take site offline on a preview) fires alert to confirmed channel.
- **Branch:** `feat/run-45-analytics-uptime-rollback`
- **Depends-on:** 44

---

### Run 46 — Pre-launch checklist dry run

- **Skills:** `/superpowers:verification-before-completion`, `/engineering:deploy-checklist`
- **Deliverables:** `docs/decisions/launch-pre-flight.md` — every box in spec §SP-5 pre-launch checklist ticked with evidence link (PR / screenshot / CI run).
- **Acceptance:** No `[ ]` left unchecked; counsel sign-off attached.
- **Branch:** `feat/run-46-pre-flight`
- **Depends-on:** 45, 36
- **Human-gated?** **Yes** — counsel sign-off and Michael's go/no-go.

---

### Run 47 — Liquid surface area (conditional on Run 02)

- **Skills:** `/shopify-plugin:shopify-liquid`, `/shopify-plugin:shopify-checkout-extensions` (i.e. `shopify-polaris-checkout-extensions`), `/shopify-plugin:shopify-custom-data`
- **Deliverables (only if Run 02 = B or C):**
  - **B (pure Liquid):** A minimal Dawn-derived theme matching the dark-violet design, three product pages, family theming via metafields, age disclosure footer, NL/EN locale files. Effectively a parallel build of SP-3 in Liquid.
  - **C (hybrid):** Customised checkout (delivery, payment, thank-you) via checkout UI extensions; bilingual transactional email templates; order-status page styling; Shop app theming.
  - **A (pure headless):** skip — set `status: "skipped"`, note "decided headless in Run 02".
- **Acceptance:** Matches the Run 02 acceptance line; deployed via `shopify` CLI to the dev store theme slot.
- **Branch:** `feat/run-47-liquid-surface`
- **Depends-on:** 32, 02

---

### Run 48 — End-to-end real paid test order

- **Skills:** `/shopify-plugin:shopify-admin`, `/engineering:incident-response`
- **Deliverables:** One genuine paid order placed against production (then refunded). Verify Shopify → Sendcloud → label.
- **Acceptance:** Order appears in Shopify, Sendcloud, refund processed clean.
- **Branch:** `feat/run-48-real-test-order`
- **Depends-on:** 46, 15
- **Human-gated?** **Yes** — Michael's card, Michael's address.

---

### Run 49 — Launch: DNS flip, production env, smoke

- **Skills:** `/superpowers:finishing-a-development-branch`, `/engineering:deploy-checklist`, hosting-provider skill per Run 03
- **Deliverables:** Custom domain DNS pointed at host; production env vars verified; production deploy promoted; smoke against production; status posted to Michael.
- **Acceptance:** `https://<domain>/nl/shop` returns 200 with valid SSL; Playwright golden path green against production.
- **Branch:** `feat/run-49-launch`
- **Depends-on:** 48
- **Human-gated?** **Yes** — DNS change.

---

### Run 50 — Post-launch: memory + retro + Phase 2 ticket seed

- **Skills:** `productivity:update`, `/superpowers:writing-plans`, `/engineering:documentation`
- **Deliverables:**
  - Memory writes: project memory ("Sensual Sweets launched YYYY-MM-DD on `<host>`"), feedback memories for any non-obvious calls (e.g. headless-vs-Liquid rationale, hosting choice, BTW rate decision).
  - `docs/decisions/launch-YYYY-MM-DD.md` retro: what went well, what slipped, where the 50-run cadence helped or hurt.
  - Seeds tickets for Phase 2 backlog (per spec §5): GA4, Sentry, GraphQL codegen, abandoned-cart, Sendcloud→Shopify tracking webhook, multi-country (DE/BE), DE/FR locales, structured data, paid acquisition, A/B infra, CRM.
  - Disable the scheduled task (or downshift cadence to weekly "health check").
- **Acceptance:** All three deliverables exist; scheduled task cadence updated.
- **Branch:** `feat/run-50-post-launch`
- **Depends-on:** 49

---

## 4. Parallelism map

Independent tracks that can run in the same tick if state-file allows:

```
Track 1 (backend):  08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16
Track 2 (CSS):      04 → 05
Track 3 (compliance prep): 06
Track 4 (illustrations): 07 → 29 → 30 → 31  (29 also depends on 28)
Track 5 (decisions): 02 ∥ 03   (both independent of each other)
```

Phase B (Runs 09–16) is strictly serial because each step builds Shopify state.
Phase D (Runs 23–32) is strictly serial because UI components stack.
Phase E (Runs 33–39) is mostly serial; 36 and 38 are independent of 35/37.
Phase F (Runs 40–42) can be parallelised once 37 and 39 are done.

---

## 5. Risks unique to this plan (over and above spec §3)

| # | Risk | Mitigation |
|---|---|---|
| P1 | Higgsfield connector unavailable today | Run 07 plans a fallback chain to existing image-gen connectors / Adobe Firefly. |
| P2 | Run 02 picks Liquid mid-execution → Phase C–D work wasted | Schedule Run 02 first; do not start Phase C until Run 02 PR merged. |
| P3 | 4-hourly cadence wakes Claude when nothing's eligible | Heartbeat-only exit (§0); de minimis cost. |
| P4 | Custom subagents (40–42) drift from latest plugin-dev best practice | Run 40 reads `/plugin-dev:agent-development` skill fresh each invocation; subagents stored in repo, version-controlled. |
| P5 | Scheduled task picks a run while Michael is mid-manual-step in the Shopify admin | Manual-gated runs flip `status: "blocked"` and exit; resume when Michael writes "unblock NN" in PR. |
| P6 | Liquid track (Run 47) only viable after Shopify CLI is wired locally | Run 47 first verifies `shopify --version`; if missing, blocks and emits install instructions. |

---

## 6. What this plan does NOT cover

- Marketing / paid acquisition / SEO content (Phase 2 ticket seed in Run 50).
- Customer accounts UX, wishlists, subscriptions.
- DE/BE/FR expansion.
- Replacing Shopify checkout with a custom one (deliberately excluded by spec).
- Anything in `/Users/mrb/Library/Mobile Documents/.../sensual-sweets-design/` other than mirroring CSS — design iteration there stays manual.

---

## 7. Approval

Plan ready for Michael's review. After approval:
1. Run 01 fires manually (or at the first scheduled tick).
2. Scheduled task created in Run 01 then drives Runs 02..50 unattended, with `requires_human` gates pausing for input.

> **Convention reminder for every implementer agent:** "This is NOT the Next.js you know" (AGENTS.md). Read `node_modules/next/dist/docs/` before any Next.js code edit. Confirm `cacheLife`/`cacheTag` semantics from there, not from training data.
