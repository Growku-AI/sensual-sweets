# SP-5 — Launch Ops Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Sensual Sweets to production on Vercel with reviewable PR previews, observable analytics + Web Vitals, automated CI gates (type/lint/compliance/build/e2e/Lighthouse), Sendcloud-wired fulfillment, and a rehearsed sub-5-minute rollback.

**Architecture:** Next.js 16.2.1 hosted on Vercel (Functions / Fluid Compute, Node runtime) with `vercel.ts` configuration, a custom apex + `www` domain, and Vercel Analytics for cookieless EU-friendly Web Vitals + custom commerce events. GitHub Actions runs the CI matrix (type-check, lint, compliance, build, Playwright e2e against Preview URL, Lighthouse CI). Sentry is **deferred** at MVP (decision recorded); synthetic uptime via Vercel Monitor or UptimeRobot probes the golden-path routes; Sendcloud auto-pushes Shopify orders into the fulfillment workflow.

**Tech Stack:** Vercel (`vercel.ts` + Vercel CLI + Fluid Compute), GitHub Actions (`actions/checkout@v4`, `actions/setup-node@v4`), Playwright `@playwright/test`, `@lhci/cli`, `@vercel/analytics`, `@vercel/analytics/next`, Vercel Monitor / UptimeRobot, Sendcloud Shopify app.

---

## Pre-flight context

- **Branch:** all commits land on `feat/shopify-store-build`.
- **Dependencies:** SP-0..SP-4 should be complete (or near-complete) before SP-5 ships to production. Tasks 1–10 (CI scaffolding, analytics wrapper, Vercel link, env matrix) can run in parallel with SP-3/SP-4 implementation. Tasks 11–16 (uptime, domain, dry run, checklist) require SP-3/SP-4 to be merged.
- **Decisions locked by this plan:**
  - CI provider: GitHub Actions.
  - Analytics provider at MVP: Vercel Analytics (cookieless, no GA4).
  - Sentry: **deferred** at MVP — revisit week 2 post-launch.
  - e2e framework: Playwright (verify SP-3 already installed it; install if not).
  - Vercel config: `vercel.ts` (TypeScript, preferred over `vercel.json`).
- **Open decision surfaced for Michael (Task 0):** production branch policy (`master` vs `main`).
- **No `Co-Authored-By` trailer on any commit. Ever.**
- **Paths with spaces stay double-quoted; never backslash-escape.**

---

## Task 0 — Decide and record production branch policy

**Files (Create):**
- `docs/decisions/2026-05-19-production-branch.md`

**Steps:**

- [ ] Read `~/.claude/CLAUDE.md` and confirm the global rule ("Always use `master` as the default branch name, never `main`").
- [ ] Inspect the current remote default branch:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets"
  git remote -v
  git branch -a
  gh repo view --json defaultBranchRef -q '.defaultBranchRef.name'
  ```
- [ ] Ask Michael (one short question) which branch should be production for this project: `master` (matches the global rule) or `main` (matches the current GitHub default). Default assumption if no answer: follow the global rule and rename to `master`.
- [ ] Create `docs/decisions/2026-05-19-production-branch.md` with the following content (substitute `<DECISION>` and `<RATIONALE>`):
  ```markdown
  # Decision: Production branch policy

  **Date:** 2026-05-19
  **Status:** Accepted
  **Owner:** Michael (mrb)

  ## Decision
  The production branch for `sensual-sweets` is **`<DECISION>`**.

  ## Rationale
  <RATIONALE — one paragraph. If `master`: follows the global git rule in
  `~/.claude/CLAUDE.md`. If `main`: project-specific exception, e.g. existing
  GitHub default + Vercel project wired to `main`; rename cost > consistency benefit.>

  ## Operational consequences
  - All PRs targeting production merge into `<DECISION>`.
  - Vercel project "Production branch" is set to `<DECISION>`.
  - GitHub repo default branch is `<DECISION>`.
  - The development branch `feat/shopify-store-build` will be merged into `<DECISION>` at launch.

  ## If rename was required
  Executed via:
  ```bash
  git branch -m main master
  git push -u origin master
  gh repo edit --default-branch master
  git push origin --delete main
  ```
  Vercel "Production branch" updated in dashboard → Project → Settings → Git.
  ```
- [ ] If the decision is to rename (`main` → `master`), execute the rename:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets"
  git checkout main
  git pull origin main
  git branch -m main master
  git push -u origin master
  gh repo edit --default-branch master
  git push origin --delete main
  ```
- [ ] If the decision is to rename, also update the Vercel project: Vercel dashboard → Project → Settings → Git → "Production branch" → set to `master` → Save. (If the project isn't linked yet — see Task 1 — defer this step until after `vercel link` and explicitly note it in Task 1's setup.)
- [ ] Verify on the GitHub side:
  ```bash
  gh repo view --json defaultBranchRef -q '.defaultBranchRef.name'
  ```
  Expected output: `<DECISION>`.
- [ ] Commit:
  ```bash
  git checkout feat/shopify-store-build
  git add docs/decisions/2026-05-19-production-branch.md
  git commit -m "docs(sp-5): record production branch decision"
  ```

**Acceptance:** `docs/decisions/2026-05-19-production-branch.md` exists; `gh repo view` reports the chosen default branch; if rename happened, `git ls-remote --heads origin` shows the new branch and not the old one.

---

## Task 1 — Install Vercel CLI and link the project

**Files (Create):**
- `docs/decisions/2026-05-19-vercel-link.md`

**Files (Modify):**
- `.gitignore` (verify only — `.vercel` already ignored; document it).

**Steps:**

- [ ] Install Vercel CLI globally:
  ```bash
  npm install -g vercel
  vercel --version
  ```
- [ ] Authenticate (interactive, one-time per machine):
  ```bash
  vercel login
  ```
- [ ] From the repo root, link the project:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets"
  vercel link
  ```
  Pick: org scope (Michael's personal team or the Growku team — confirm), project name `sensual-sweets`, link to existing if present else create new. This generates `.vercel/project.json`.
- [ ] Confirm `.vercel/` is git-ignored (it already is — verify):
  ```bash
  git check-ignore -v .vercel/project.json
  ```
  Expected: a line referencing the `.vercel` rule in `.gitignore`.
- [ ] Capture the linked org/project identifiers (do NOT commit `.vercel/project.json` itself):
  ```bash
  cat .vercel/project.json
  ```
  Note `projectId` and `orgId` for the decisions file.
- [ ] Create `docs/decisions/2026-05-19-vercel-link.md`:
  ```markdown
  # Decision: Vercel project link

  **Date:** 2026-05-19
  **Status:** Accepted
  **Owner:** Michael (mrb)

  ## Linked project
  - **Org / Team:** `<ORG_NAME>` (`<ORG_ID>`)
  - **Project:** `sensual-sweets` (`<PROJECT_ID>`)
  - **Production branch:** `<see 2026-05-19-production-branch.md>`
  - **Framework preset:** Next.js (auto-detected)
  - **Runtime:** Node.js / Fluid Compute (default)
  - **Custom domain:** to be attached in Task 15

  ## Local link
  - The linked identifiers live in `.vercel/project.json` (git-ignored).
  - Re-link on a fresh machine via `vercel link` from the repo root.

  ## CLI commands routinely used
  - `vercel env pull .env.local` — sync env vars to local
  - `vercel env ls` — list env vars per environment
  - `vercel deploy` / `vercel deploy --prod` — manual deploy
  - `vercel logs <deployment-url>` — tail logs
  - `vercel rollback <deployment-url>` — promote previous deployment
  - `vercel inspect <deployment-url>` — view deployment metadata
  ```
- [ ] Verify the link works:
  ```bash
  vercel project ls
  vercel env ls
  ```
  `vercel env ls` will show "no env vars" or existing ones — both are fine for this task.
- [ ] Commit:
  ```bash
  git add docs/decisions/2026-05-19-vercel-link.md
  git commit -m "docs(sp-5): record Vercel project link"
  ```

**Acceptance:** `.vercel/project.json` exists locally and is git-ignored; `vercel project ls` shows `sensual-sweets`; decision file committed.

---

## Task 2 — Create `vercel.ts` configuration

**Files (Create):**
- `vercel.ts`

**Files (Modify):**
- `package.json` (add `@vercel/config` to `devDependencies`).

**Steps:**

- [ ] Install `@vercel/config`:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets"
  npm install --save-dev @vercel/config
  ```
- [ ] Create `vercel.ts` at the repo root with the full content below:
  ```ts
  import type { Config } from '@vercel/config'

  const config: Config = {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    framework: 'nextjs',
    redirects: [
      {
        source: '/',
        destination: '/nl',
        permanent: false,
      },
    ],
    headers: [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.(jpg|jpeg|png|webp|avif|svg|ico|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ],
  }

  export default config
  ```
- [ ] Verify the config compiles cleanly:
  ```bash
  npx tsc --noEmit vercel.ts
  ```
  Expected: no errors.
- [ ] Trigger a Preview deploy to confirm Vercel picks up the TS config:
  ```bash
  vercel deploy
  ```
  In the build logs, look for "Detected vercel.ts" (or equivalent). Copy the resulting Preview URL.
- [ ] Verify the `/` → `/nl` redirect on the Preview:
  ```bash
  curl -sI <preview-url>/
  ```
  Expected: `HTTP/2 307` (or `308`) and `location: /nl` header.
- [ ] Verify static-asset caching on a built JS chunk:
  ```bash
  curl -sI <preview-url>/_next/static/chunks/<any-chunk>.js | grep -i cache-control
  ```
  Expected: `cache-control: public, max-age=31536000, immutable`.
- [ ] Commit:
  ```bash
  git add vercel.ts package.json package-lock.json
  git commit -m "feat(sp-5): add vercel.ts with /nl redirect and static-asset cache headers"
  ```

**Acceptance:** `vercel.ts` exists; Preview deploy honors the `/` → `/nl` redirect; static assets carry the immutable cache header.

---

## Task 3 — Create `.env.example` with full env matrix

**Files (Create or Modify):**
- `.env.example` (create if SP-2 hasn't already; otherwise extend).

**Steps:**

- [ ] Check whether SP-2 already created the file:
  ```bash
  ls -la "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/.env.example" 2>/dev/null
  ```
- [ ] Create or overwrite `.env.example` at the repo root with this content (preserve any SP-2 additions):
  ```bash
  # ============================================================================
  # Sensual Sweets — environment variables
  # ----------------------------------------------------------------------------
  # Copy to .env.local for local development. Never commit secrets.
  # All NEXT_PUBLIC_* vars are bundled into the client. Storefront tokens are
  # public-safe by Shopify's design (rate-limited per token). Admin tokens must
  # NEVER be NEXT_PUBLIC_.
  # ============================================================================

  # ---- Shopify Storefront API (SP-1 / SP-2) ----------------------------------
  # Domain of the Shopify store, no protocol. e.g. sensual-sweets.myshopify.com
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=

  # Storefront API delegate access token. Public-safe (rate-limited per token).
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=

  # Storefront API version. Pinned deliberately; bump only after testing.
  SHOPIFY_STOREFRONT_API_VERSION=2025-10

  # ---- i18n (SP-4) -----------------------------------------------------------
  NEXT_PUBLIC_DEFAULT_LOCALE=nl
  NEXT_PUBLIC_SUPPORTED_LOCALES=nl,en

  # ---- Playwright e2e (SP-5) -------------------------------------------------
  # Used by tests/e2e to know where to run. Local default is localhost:3000;
  # CI sets this to the Vercel Preview URL of the deployment under test.
  PLAYWRIGHT_BASE_URL=http://localhost:3000

  # ---- Vercel Analytics (SP-5) -----------------------------------------------
  # No env var required at runtime — @vercel/analytics auto-detects the Vercel
  # deployment. Listed here for visibility only.
  # VERCEL_ANALYTICS_ID=<auto-injected on Vercel>
  ```
- [ ] Commit:
  ```bash
  git add .env.example
  git commit -m "docs(sp-5): add .env.example with full env matrix"
  ```

**Acceptance:** `.env.example` exists with all keys from the spec matrix plus PLAYWRIGHT_BASE_URL; `.env.local` remains git-ignored.

---

## Task 4 — Configure env vars in Vercel (Production, Preview, Development)

**Steps (runbook, no commit):**

- [ ] Open the Vercel dashboard → `sensual-sweets` project → Settings → Environment Variables.
- [ ] Add each of the keys below for **Production**, **Preview**, and **Development** environments. Use the matrix from SP-5's spec — production-store tokens for Prod + Preview, dev-store tokens for Development.

  | Key | Production | Preview | Development |
  |---|---|---|---|
  | `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | live store domain | live store domain | dev store domain |
  | `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | prod token | prod token | dev token |
  | `SHOPIFY_STOREFRONT_API_VERSION` | `2025-10` | `2025-10` | `2025-10` |
  | `NEXT_PUBLIC_DEFAULT_LOCALE` | `nl` | `nl` | `nl` |
  | `NEXT_PUBLIC_SUPPORTED_LOCALES` | `nl,en` | `nl,en` | `nl,en` |

- [ ] Alternative — CLI-driven (faster for repeated edits):
  ```bash
  vercel env add NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN production
  vercel env add NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN production
  vercel env add SHOPIFY_STOREFRONT_API_VERSION production
  vercel env add NEXT_PUBLIC_DEFAULT_LOCALE production
  vercel env add NEXT_PUBLIC_SUPPORTED_LOCALES production
  # repeat for preview and development
  ```
- [ ] Verify each environment has all five keys:
  ```bash
  vercel env ls production
  vercel env ls preview
  vercel env ls development
  ```
  Expected: each `ls` lists all five keys above.
- [ ] Pull production env to a local file (verify the round-trip, then delete the file):
  ```bash
  vercel env pull .env.vercel.check --environment=production
  grep -c '^NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=' .env.vercel.check
  rm .env.vercel.check
  ```
  Expected: `1`.
- [ ] Trigger a fresh deploy to pick up new envs (Vercel won't re-deploy automatically on env changes):
  ```bash
  vercel deploy
  ```
- [ ] Visit the Preview URL and confirm the home redirect → `/nl` renders without "Shopify token missing" errors.

**Acceptance:** `vercel env ls` reports all five keys in all three environments; a fresh Preview deploy renders `/nl` without env-related runtime errors.

---

## Task 5 — TDD: `src/lib/analytics.ts` wrapper

**Files (Create):**
- `src/lib/analytics.ts`
- `src/lib/analytics.test.ts`

**Files (Modify):**
- `package.json` (add `@vercel/analytics`, `vitest`, `@vitest/ui` if not present from earlier SPs).

**Steps:**

- [ ] Check whether `vitest` is already installed (SP-2/SP-3 may have added it). If not, install:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets"
  npm install --save-dev vitest @vitest/ui
  ```
- [ ] Install `@vercel/analytics`:
  ```bash
  npm install @vercel/analytics
  ```
- [ ] Add a `test` script to `package.json` if absent:
  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
  }
  ```
- [ ] Create the failing test first at `src/lib/analytics.test.ts`:
  ```ts
  import { afterEach, describe, expect, it, vi } from 'vitest'

  const trackMock = vi.fn()

  vi.mock('@vercel/analytics', () => ({
    track: (...args: unknown[]) => trackMock(...args),
  }))

  import { trackCartAdd, trackCartRemove, trackBeginCheckout } from './analytics'

  afterEach(() => {
    trackMock.mockReset()
  })

  describe('analytics wrapper', () => {
    it('emits cart_add with the expected payload shape', () => {
      trackCartAdd({
        variantId: 'gid://shopify/ProductVariant/123',
        productHandle: 'his',
        family: 'his',
        quantity: 1,
        priceEur: 29.95,
      })

      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('cart_add', {
        variantId: 'gid://shopify/ProductVariant/123',
        productHandle: 'his',
        family: 'his',
        quantity: 1,
        priceEur: 29.95,
      })
    })

    it('emits cart_remove with the expected payload shape', () => {
      trackCartRemove({
        variantId: 'gid://shopify/ProductVariant/456',
        productHandle: 'hers',
        family: 'hers',
        quantity: 2,
      })

      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('cart_remove', {
        variantId: 'gid://shopify/ProductVariant/456',
        productHandle: 'hers',
        family: 'hers',
        quantity: 2,
      })
    })

    it('emits begin_checkout with the expected payload shape', () => {
      trackBeginCheckout({
        cartId: 'gid://shopify/Cart/abc',
        subtotalEur: 59.9,
        lineCount: 2,
      })

      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('begin_checkout', {
        cartId: 'gid://shopify/Cart/abc',
        subtotalEur: 59.9,
        lineCount: 2,
      })
    })

    it('coerces quantity to integer (no fractional cart_add)', () => {
      trackCartAdd({
        variantId: 'gid://shopify/ProductVariant/789',
        productHandle: 'duo',
        family: 'duo',
        quantity: 1.5,
        priceEur: 49.95,
      })

      expect(trackMock).toHaveBeenCalledWith(
        'cart_add',
        expect.objectContaining({ quantity: 1 }),
      )
    })
  })
  ```
- [ ] Run the tests — they should FAIL (module does not exist yet):
  ```bash
  npm test
  ```
- [ ] Create `src/lib/analytics.ts` with the wrapper:
  ```ts
  import { track } from '@vercel/analytics'

  export type ProductFamily = 'his' | 'hers' | 'duo'

  export interface CartAddPayload {
    variantId: string
    productHandle: string
    family: ProductFamily
    quantity: number
    priceEur: number
  }

  export interface CartRemovePayload {
    variantId: string
    productHandle: string
    family: ProductFamily
    quantity: number
  }

  export interface BeginCheckoutPayload {
    cartId: string
    subtotalEur: number
    lineCount: number
  }

  export function trackCartAdd(payload: CartAddPayload): void {
    track('cart_add', {
      variantId: payload.variantId,
      productHandle: payload.productHandle,
      family: payload.family,
      quantity: Math.trunc(payload.quantity),
      priceEur: payload.priceEur,
    })
  }

  export function trackCartRemove(payload: CartRemovePayload): void {
    track('cart_remove', {
      variantId: payload.variantId,
      productHandle: payload.productHandle,
      family: payload.family,
      quantity: Math.trunc(payload.quantity),
    })
  }

  export function trackBeginCheckout(payload: BeginCheckoutPayload): void {
    track('begin_checkout', {
      cartId: payload.cartId,
      subtotalEur: payload.subtotalEur,
      lineCount: Math.trunc(payload.lineCount),
    })
  }
  ```
- [ ] Run the tests — they should now PASS:
  ```bash
  npm test
  ```
  Expected: all four cases green.
- [ ] Type-check:
  ```bash
  npx tsc --noEmit
  ```
- [ ] Commit:
  ```bash
  git add src/lib/analytics.ts src/lib/analytics.test.ts package.json package-lock.json
  git commit -m "feat(sp-5): add analytics wrapper with cart_add/remove/begin_checkout"
  ```

**Acceptance:** `npm test` reports 4/4 passing; the wrapper does not import `@vercel/analytics` lazily (it can be tree-shaken); `track` is called with stable payload keys.

---

## Task 6 — Wire `<Analytics />` into the locale layout

**Files (Modify):**
- `src/app/[locale]/layout.tsx` (or `src/app/layout.tsx` if SP-4 hasn't migrated to locale layout yet — wire into whichever is the active root layout).
- Call sites of `useCart()` consumers (`AddToCartButton`, `CartLineItem`, `CartFooter`) created in SP-3.

**Steps:**

- [ ] Locate the active root layout:
  ```bash
  ls "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/[locale]/layout.tsx" 2>/dev/null \
    || ls "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/layout.tsx"
  ```
  Prefer the `[locale]/layout.tsx` if it exists (SP-4 owns it). Otherwise use the root.
- [ ] Add the `<Analytics />` component near the bottom of `<body>` in the chosen layout:
  ```tsx
  import { Analytics } from '@vercel/analytics/next'

  // inside the JSX return:
  // ...existing children...
  <Analytics />
  ```
  Full minimal example (merge into the existing layout — preserve everything around it):
  ```tsx
  import type { ReactNode } from 'react'
  import { Analytics } from '@vercel/analytics/next'

  export default function RootLayout({ children }: { children: ReactNode }) {
    return (
      <html lang="nl">
        <body>
          {children}
          <Analytics />
        </body>
      </html>
    )
  }
  ```
- [ ] Wire the analytics wrapper into SP-3 cart components — three integration points:
  - In `src/components/shop/AddToCartButton.tsx`, after a successful `linesAdd` resolution, call `trackCartAdd({ variantId, productHandle, family, quantity, priceEur })`.
  - In `src/components/cart/CartLineItem.tsx`, on the remove handler, call `trackCartRemove({ variantId, productHandle, family, quantity })`.
  - In `src/components/cart/CartFooter.tsx`, immediately before the `window.location.assign(cart.checkoutUrl)` call, call `trackBeginCheckout({ cartId, subtotalEur, lineCount })`.

  If the SP-3 components are not yet on disk, leave a `TODO(sp-5-task-6)` comment in this plan's tracker AND in any placeholder commit — but do NOT leave a `// TODO` in the analytics wrapper itself. Re-run this task once SP-3 lands.
- [ ] Verify locally in dev mode:
  ```bash
  npm run dev
  ```
  In another shell: open `http://localhost:3000/nl`, open browser DevTools → Network tab. Vercel Analytics in development mode logs events to the console (no network call hits production). Confirm a console message appears on page load.
- [ ] In a Preview deploy, exercise the golden path manually and confirm events appear in Vercel dashboard → Project → Analytics → Custom Events within ~30 seconds.
- [ ] Run the build to catch any RSC/CC issues:
  ```bash
  npm run build
  ```
- [ ] Commit:
  ```bash
  git add src/app
  git add src/components/shop/AddToCartButton.tsx src/components/cart/CartLineItem.tsx src/components/cart/CartFooter.tsx
  git commit -m "feat(sp-5): wire Vercel Analytics and custom commerce events"
  ```

**Acceptance:** `<Analytics />` mounted; dev console shows event emission; Preview deploy's Vercel dashboard shows `cart_add`, `cart_remove`, `begin_checkout` events after a manual run-through.

---

## Task 7 — Playwright golden-path e2e spec

**Files (Create):**
- `playwright.config.ts`
- `tests/e2e/golden-path.spec.ts`

**Files (Modify):**
- `package.json` (`@playwright/test`, `playwright` test scripts; add only if SP-3 didn't already).
- `.gitignore` (add `/playwright-report`, `/test-results`).

**Steps:**

- [ ] Check if SP-3 already installed Playwright:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets"
  npm ls @playwright/test 2>/dev/null
  ```
- [ ] If not installed, install and download browsers:
  ```bash
  npm install --save-dev @playwright/test
  npx playwright install --with-deps chromium
  ```
- [ ] Add scripts to `package.json` if absent:
  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:report": "playwright show-report"
  }
  ```
- [ ] Append to `.gitignore`:
  ```
  /playwright-report
  /test-results
  /playwright/.cache
  ```
- [ ] Create `playwright.config.ts` at the repo root:
  ```ts
  import { defineConfig, devices } from '@playwright/test'

  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

  export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: process.env.CI
      ? [['html', { open: 'never' }], ['github']]
      : [['list']],
    timeout: 60_000,
    expect: { timeout: 10_000 },
    use: {
      baseURL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
      actionTimeout: 10_000,
      navigationTimeout: 30_000,
    },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ],
    webServer: process.env.PLAYWRIGHT_BASE_URL
      ? undefined
      : {
          command: 'npm run dev',
          url: 'http://localhost:3000/nl',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
  })
  ```
- [ ] Create `tests/e2e/golden-path.spec.ts` with the FULL golden-path scenario. The selectors below assume SP-3 components expose `data-testid` attributes. If SP-3's components instead use semantic selectors (e.g., `<button>In winkelmand</button>`), adapt the selector layer in this task — the assertions remain valid.

  **Required `data-testid` attributes (add to SP-3 components if missing — this task includes patching them):**
  - `shop-now-cta` on the landing-page "Shop now" / "Shop nu" button (Hero or Products section).
  - `product-card-his` on the HIS `<ProductCard>`.
  - `add-to-cart-button` on `<AddToCartButton>`.
  - `cart-drawer` on the Radix Dialog content for `<CartDrawer>`.
  - `cart-checkout-button` on `<CartFooter>`'s "Afrekenen" button.
  - `cart-line-item` on each `<CartLineItem>` root element.

  ```ts
  import { expect, test } from '@playwright/test'

  test.describe('Golden path: land → shop → PDP → cart → checkout', () => {
    test('NL locale completes the buyer journey end-to-end', async ({ page }) => {
      // 1. Land on /nl (apex / redirects via vercel.ts in production; dev hits /nl directly)
      await page.goto('/nl', { waitUntil: 'domcontentloaded' })
      await expect(page).toHaveURL(/\/nl\/?$/)

      // 2. Click the primary "Shop now" CTA from the landing page
      const shopNow = page.getByTestId('shop-now-cta').first()
      await expect(shopNow).toBeVisible()
      await shopNow.click()

      // 3. PLP renders with 3 product cards
      await expect(page).toHaveURL(/\/nl\/shop\/?$/)
      await expect(page.getByTestId('product-card-his')).toBeVisible()

      // 4. Drill into HIS PDP
      await page.getByTestId('product-card-his').click()
      await expect(page).toHaveURL(/\/nl\/shop\/his$/)

      // 5. Add HIS to cart
      const addToCart = page.getByTestId('add-to-cart-button')
      await expect(addToCart).toBeEnabled()
      await addToCart.click()

      // 6. Cart drawer opens with the HIS line item
      const drawer = page.getByTestId('cart-drawer')
      await expect(drawer).toBeVisible({ timeout: 5_000 })
      await expect(drawer.getByTestId('cart-line-item')).toHaveCount(1)

      // 7. Begin checkout — listen for the navigation off-domain to Shopify
      // We can't follow the cross-origin redirect inside Playwright's default
      // page, so we intercept the navigation and assert the target URL.
      const checkoutButton = drawer.getByTestId('cart-checkout-button')
      await expect(checkoutButton).toBeEnabled()

      const navigationPromise = page.waitForRequest(
        (request) =>
          request.isNavigationRequest() &&
          /\.shopify\.com\//.test(request.url()),
        { timeout: 15_000 },
      )
      await checkoutButton.click()

      const navRequest = await navigationPromise
      expect(navRequest.url()).toMatch(/\.shopify\.com\//)
    })

    test('drawer closes via ESC without errors', async ({ page }) => {
      await page.goto('/nl/shop/his', { waitUntil: 'domcontentloaded' })
      await page.getByTestId('add-to-cart-button').click()
      const drawer = page.getByTestId('cart-drawer')
      await expect(drawer).toBeVisible()

      await page.keyboard.press('Escape')
      await expect(drawer).not.toBeVisible({ timeout: 3_000 })

      // No console errors during the close
      // (validated by Playwright's default failOnPageError config — explicit assert below)
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))
      expect(errors).toEqual([])
    })
  })
  ```
- [ ] Run the spec locally against a dev server (Playwright will spawn `npm run dev`):
  ```bash
  npm run e2e
  ```
  Expected: both tests pass. If a selector fails because SP-3 used a different attribute, update the SP-3 component to expose the listed `data-testid` (smallest possible patch).
- [ ] Commit:
  ```bash
  git add playwright.config.ts tests/e2e/golden-path.spec.ts package.json package-lock.json .gitignore
  git commit -m "test(sp-5): add Playwright golden-path e2e spec"
  ```

**Acceptance:** `npm run e2e` passes locally; the spec exercises the full /nl golden path; cross-origin checkout redirect is asserted via `waitForRequest` matching `.shopify.com/`.

---

## Task 8 — Lighthouse CI configuration

**Files (Create):**
- `lighthouserc.json`

**Files (Modify):**
- `package.json` (add `@lhci/cli`, add `lhci` script).

**Steps:**

- [ ] Install Lighthouse CI:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets"
  npm install --save-dev @lhci/cli
  ```
- [ ] Add a script to `package.json`:
  ```json
  "scripts": {
    "lhci": "lhci autorun"
  }
  ```
- [ ] Create `lighthouserc.json` at the repo root:
  ```json
  {
    "ci": {
      "collect": {
        "url": [
          "http://localhost:3000/nl",
          "http://localhost:3000/nl/shop"
        ],
        "numberOfRuns": 3,
        "startServerCommand": "npm run start",
        "startServerReadyPattern": "ready in|Ready in|started server on",
        "startServerReadyTimeout": 120000,
        "settings": {
          "preset": "desktop",
          "throttlingMethod": "simulate"
        }
      },
      "assert": {
        "preset": "lighthouse:no-pwa",
        "assertions": {
          "categories:performance": ["error", { "minScore": 0.8 }],
          "categories:accessibility": ["error", { "minScore": 0.95 }],
          "categories:best-practices": ["warn", { "minScore": 0.9 }],
          "categories:seo": ["error", { "minScore": 0.9 }],
          "uses-long-cache-ttl": "off",
          "csp-xss": "off"
        }
      },
      "upload": {
        "target": "temporary-public-storage"
      }
    }
  }
  ```
- [ ] Test the LHCI run locally:
  ```bash
  npm run build
  npm run lhci
  ```
  Expected: a report URL is printed; all assertion thresholds pass. If perf < 0.8 on mobile-throttled run, adjust the throttling preset to `desktop` for MVP (already set above — production must hit the same budget on mobile in Task 16's dry run).
- [ ] Commit:
  ```bash
  git add lighthouserc.json package.json package-lock.json
  git commit -m "test(sp-5): add Lighthouse CI config with a11y/perf/SEO budgets"
  ```

**Acceptance:** `npm run lhci` runs locally and either passes or surfaces clear assertion failures with the budget rationale.

---

## Task 9 — GitHub Actions CI workflow

**Files (Create):**
- `.github/workflows/ci.yml`

**Steps:**

- [ ] Create the directory structure:
  ```bash
  mkdir -p "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/.github/workflows"
  ```
- [ ] Write `.github/workflows/ci.yml` with the FULL workflow content:
  ```yaml
  name: CI

  on:
    pull_request:
      branches:
        - master
        - main
        - feat/shopify-store-build
    push:
      branches:
        - master
        - main
        - feat/shopify-store-build

  concurrency:
    group: ci-${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true

  env:
    NODE_VERSION: '20'

  jobs:
    type-check:
      name: Type check
      runs-on: ubuntu-latest
      steps:
        - name: Checkout
          uses: actions/checkout@v4
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: ${{ env.NODE_VERSION }}
            cache: 'npm'
        - name: Install dependencies
          run: npm ci
        - name: Type check
          run: npx tsc --noEmit

    lint:
      name: Lint
      runs-on: ubuntu-latest
      steps:
        - name: Checkout
          uses: actions/checkout@v4
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: ${{ env.NODE_VERSION }}
            cache: 'npm'
        - name: Install dependencies
          run: npm ci
        - name: ESLint
          run: npm run lint

    compliance-check:
      name: Compliance check (banned terms)
      runs-on: ubuntu-latest
      steps:
        - name: Checkout
          uses: actions/checkout@v4
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: ${{ env.NODE_VERSION }}
            cache: 'npm'
        - name: Install dependencies
          run: npm ci
        - name: Run banned-terms scanner
          run: npm run check:compliance

    unit-tests:
      name: Unit tests (Vitest)
      runs-on: ubuntu-latest
      steps:
        - name: Checkout
          uses: actions/checkout@v4
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: ${{ env.NODE_VERSION }}
            cache: 'npm'
        - name: Install dependencies
          run: npm ci
        - name: Run tests
          run: npm test

    build:
      name: Build
      runs-on: ubuntu-latest
      needs: [type-check, lint, compliance-check, unit-tests]
      steps:
        - name: Checkout
          uses: actions/checkout@v4
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: ${{ env.NODE_VERSION }}
            cache: 'npm'
        - name: Install dependencies
          run: npm ci
        - name: Build Next.js
          run: npm run build
          env:
            NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: ${{ secrets.SHOPIFY_STORE_DOMAIN }}
            NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: ${{ secrets.SHOPIFY_STOREFRONT_TOKEN }}
            SHOPIFY_STOREFRONT_API_VERSION: '2025-10'
            NEXT_PUBLIC_DEFAULT_LOCALE: 'nl'
            NEXT_PUBLIC_SUPPORTED_LOCALES: 'nl,en'
        - name: Upload .next artifact
          uses: actions/upload-artifact@v4
          with:
            name: next-build
            path: |
              .next
              !.next/cache
            retention-days: 3

    e2e-smoke:
      name: Playwright e2e (against Vercel Preview)
      runs-on: ubuntu-latest
      needs: [build]
      if: github.event_name == 'pull_request'
      steps:
        - name: Checkout
          uses: actions/checkout@v4
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: ${{ env.NODE_VERSION }}
            cache: 'npm'
        - name: Install dependencies
          run: npm ci
        - name: Install Playwright browsers
          run: npx playwright install --with-deps chromium
        - name: Wait for Vercel Preview deployment
          id: vercel-wait
          uses: patrickedqvist/wait-for-vercel-preview@v1.3.2
          with:
            token: ${{ secrets.GITHUB_TOKEN }}
            max_timeout: 600
            check_interval: 10
        - name: Run Playwright tests against Preview URL
          run: npx playwright test
          env:
            PLAYWRIGHT_BASE_URL: ${{ steps.vercel-wait.outputs.url }}
            CI: 'true'
        - name: Upload Playwright report
          if: always()
          uses: actions/upload-artifact@v4
          with:
            name: playwright-report
            path: playwright-report
            retention-days: 7

    lighthouse:
      name: Lighthouse CI (against Vercel Preview)
      runs-on: ubuntu-latest
      needs: [build]
      if: github.event_name == 'pull_request'
      steps:
        - name: Checkout
          uses: actions/checkout@v4
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: ${{ env.NODE_VERSION }}
            cache: 'npm'
        - name: Install dependencies
          run: npm ci
        - name: Wait for Vercel Preview deployment
          id: vercel-wait
          uses: patrickedqvist/wait-for-vercel-preview@v1.3.2
          with:
            token: ${{ secrets.GITHUB_TOKEN }}
            max_timeout: 600
            check_interval: 10
        - name: Lighthouse CI (preview URLs)
          run: |
            cat > lighthouserc.preview.json <<EOF
            {
              "ci": {
                "collect": {
                  "url": [
                    "${{ steps.vercel-wait.outputs.url }}/nl",
                    "${{ steps.vercel-wait.outputs.url }}/nl/shop"
                  ],
                  "numberOfRuns": 1,
                  "settings": { "preset": "desktop" }
                },
                "assert": {
                  "preset": "lighthouse:no-pwa",
                  "assertions": {
                    "categories:performance": ["warn", { "minScore": 0.8 }],
                    "categories:accessibility": ["error", { "minScore": 0.95 }],
                    "categories:best-practices": ["warn", { "minScore": 0.9 }],
                    "categories:seo": ["error", { "minScore": 0.9 }]
                  }
                },
                "upload": { "target": "temporary-public-storage" }
              }
            }
            EOF
            npx lhci autorun --config=lighthouserc.preview.json
  ```
- [ ] Validate the YAML locally:
  ```bash
  npx --yes js-yaml .github/workflows/ci.yml > /dev/null
  ```
  Expected: no errors. (Alternatively use `actionlint` if available: `actionlint .github/workflows/ci.yml`.)
- [ ] Add required GitHub repo secrets via `gh` CLI:
  ```bash
  gh secret set SHOPIFY_STORE_DOMAIN
  gh secret set SHOPIFY_STOREFRONT_TOKEN
  ```
  (Paste values when prompted. Use the **dev/Preview** Shopify store credentials for CI builds — these are not production-only.)
- [ ] Open a draft PR from `feat/shopify-store-build` to the production branch and confirm all jobs run. The first run will likely surface missing scripts (e.g., `check:compliance` if SP-4 hasn't merged); accept this as expected — see Task 10.
- [ ] Commit:
  ```bash
  git add .github/workflows/ci.yml
  git commit -m "ci(sp-5): add GitHub Actions CI workflow (type/lint/compliance/build/e2e/lighthouse)"
  ```

**Acceptance:** YAML is valid; on PR open, GitHub shows the six job statuses; jobs gated `if: pull_request` only run on PR events.

---

## Task 10 — Standalone compliance workflow (fast-fail)

**Files (Create or Modify):**
- `.github/workflows/compliance.yml` (extend an SP-4 stub if it exists; create otherwise).

**Steps:**

- [ ] Check whether SP-4 left a stub:
  ```bash
  ls "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/.github/workflows/compliance.yml" 2>/dev/null
  ```
- [ ] Verify the `check:compliance` script exists (SP-4 owns it):
  ```bash
  grep -E '"check:compliance"' "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/package.json"
  ```
  If absent, this task is **blocked on SP-4**; flag it and proceed to Task 11.
- [ ] Write or replace `.github/workflows/compliance.yml`:
  ```yaml
  name: Compliance (banned terms)

  on:
    pull_request:
      branches:
        - master
        - main
        - feat/shopify-store-build
      paths:
        - 'src/**'
        - 'messages/**'
        - 'src/messages/**'
        - 'scripts/check-compliance.ts'
        - 'src/lib/compliance/**'
        - '.github/workflows/compliance.yml'
    push:
      branches:
        - master
        - main

  concurrency:
    group: compliance-${{ github.ref }}
    cancel-in-progress: true

  jobs:
    banned-terms:
      name: Banned-terms scanner
      runs-on: ubuntu-latest
      timeout-minutes: 5
      steps:
        - name: Checkout
          uses: actions/checkout@v4
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '20'
            cache: 'npm'
        - name: Install dependencies
          run: npm ci
        - name: Run banned-terms scanner
          run: npm run check:compliance
        - name: Comment on PR if compliance fails
          if: failure() && github.event_name == 'pull_request'
          uses: marocchino/sticky-pull-request-comment@v2
          with:
            header: compliance-failure
            message: |
              **Compliance check failed.**

              The banned-terms scanner found one or more forbidden phrases in
              copy or component files. See the workflow logs for `file:line`
              hits. NL Warenwet + EU Reg. 1924/2006 forbid aphrodisiac /
              health / medicinal / physiological-effect claims on this
              product category.

              Fix the offending strings (mood / ritual / intimacy framing
              only) and push again. This check must pass before merge.
  ```
- [ ] Validate the YAML:
  ```bash
  npx --yes js-yaml .github/workflows/compliance.yml > /dev/null
  ```
- [ ] Commit:
  ```bash
  git add .github/workflows/compliance.yml
  git commit -m "ci(sp-5): add standalone compliance workflow with PR comment on failure"
  ```

**Acceptance:** Workflow runs on PRs touching content/code paths; failure posts a sticky PR comment explaining the gate.

---

## Task 11 — Synthetic uptime monitor (Vercel Monitor OR UptimeRobot)

**Files (Create):**
- `docs/decisions/2026-05-19-uptime-monitor.md`

**Steps (runbook):**

- [ ] Pick a provider with Michael — present the two options:
  - **Option A — Vercel Monitor** (paid add-on; integrated dashboard; native Slack/email channels). Best if already on a paid Vercel plan that includes it.
  - **Option B — UptimeRobot** (free tier covers 50 monitors at 5-minute cadence; standalone account; supports email/Slack/Discord/Telegram webhooks).
  Default if no preference: **UptimeRobot** (zero incremental cost; faster to wire).
- [ ] **If Option A (Vercel Monitor):**
  - Vercel dashboard → Project → Monitoring → Monitors → Create monitor.
  - Add three HTTP monitors:
    - `https://<production-domain>/` — expect 307/308 to `/nl` OR 200; 5-min cadence.
    - `https://<production-domain>/nl/shop` — expect 200; 5-min cadence.
    - `https://<production-domain>/nl/shop/his` — expect 200; 5-min cadence.
  - Notification channel: confirm with Michael (email / Slack webhook / both).
- [ ] **If Option B (UptimeRobot):**
  - Sign in at https://uptimerobot.com (create account if needed; use michael@growku.nl).
  - Dashboard → Add New Monitor (×3):
    - Type: HTTP(s); URL: `https://<production-domain>/`; Interval: 5 minutes; Friendly name: `sensual-sweets — apex`.
    - Type: HTTP(s); URL: `https://<production-domain>/nl/shop`; Interval: 5 minutes; Friendly name: `sensual-sweets — /nl/shop`.
    - Type: HTTP(s); URL: `https://<production-domain>/nl/shop/his`; Interval: 5 minutes; Friendly name: `sensual-sweets — /nl/shop/his`.
  - Alert Contacts → Add an email contact (`michael@growku.nl`). Optionally add a Slack webhook.
  - Attach the alert contact to all three monitors.
- [ ] Verify alerting works — force a failure:
  - Briefly point one monitor URL at a 404 path (e.g., `/__force-uptime-test__`), wait one cadence cycle (5 min), confirm the alert fires, then revert the URL.
  - Document: alert received at `<HH:MM>` UTC on `<channel>`.
- [ ] Create `docs/decisions/2026-05-19-uptime-monitor.md`:
  ```markdown
  # Decision: Synthetic uptime monitor

  **Date:** 2026-05-19
  **Status:** Accepted
  **Owner:** Michael (mrb)

  ## Choice
  **<Option A: Vercel Monitor | Option B: UptimeRobot>**

  ## Rationale
  <one paragraph>

  ## Monitors
  - `https://<production-domain>/` — 5-min HTTP check, expects 200 or 307
  - `https://<production-domain>/nl/shop` — 5-min HTTP check, expects 200
  - `https://<production-domain>/nl/shop/his` — 5-min HTTP check, expects 200

  ## Alert channels
  - Email: michael@growku.nl
  - <Slack/Discord/Telegram webhook, if configured>

  ## Failure drill (executed YYYY-MM-DD at HH:MM UTC)
  Pointed `/nl/shop/his` at `/__force-uptime-test__` to force a 404. Alert
  arrived via `<channel>` after `<X>` minutes. URL reverted; monitor returned
  to OK on the next cycle.

  ## Revisit
  - Add Sentry alerts (week 2 post-launch) — see `2026-05-19-sentry-deferred.md`.
  - Add Shopify-side order-flow synthetic check (Phase 2).
  ```
- [ ] Commit:
  ```bash
  git add docs/decisions/2026-05-19-uptime-monitor.md
  git commit -m "docs(sp-5): record uptime monitor choice and drill outcome"
  ```

**Acceptance:** Three monitors active; forced-failure drill produced an alert; decision file committed.

---

## Task 12 — Sendcloud sanity check

**Steps (runbook, no commit unless results recorded):**

- [ ] Confirm SP-1 installed and authorised the Sendcloud Shopify app:
  - Shopify admin → Apps → Sendcloud should show "Installed" with a connected account.
  - Sendcloud dashboard → Integrations → Shopify should show the connected shop name.
- [ ] Place a synthetic end-to-end test order:
  - Use a test discount that brings the order to €0 if Shopify Payments is in test mode, OR use a real card + immediately refund.
  - Order one HIS gummy via the customer-facing storefront on the Production deploy.
- [ ] Verify within 60 seconds:
  - Shopify admin → Orders → confirm the test order appears.
  - Sendcloud dashboard → Shipments / Orders → confirm the same order appears.
  - Note the latency between Shopify "Order created" timestamp and Sendcloud "Received" timestamp.
- [ ] Generate a test label (do NOT print) to confirm carrier contract works:
  - Sendcloud → select the test shipment → "Create label" → confirm a PDF is generated and the shipment status moves to "Label created".
- [ ] Record the result in `docs/runbooks/sendcloud-sanity-check.md` (create the runbook file):
  ```markdown
  # Sendcloud sanity check — YYYY-MM-DD

  **Operator:** Michael (mrb)
  **Production domain:** `<domain>`

  ## Steps executed
  1. Test order placed via /nl/shop/his at HH:MM:SS UTC.
  2. Order visible in Shopify admin at HH:MM:SS UTC (latency: <X>s).
  3. Order visible in Sendcloud at HH:MM:SS UTC (latency from Shopify: <X>s).
  4. Test label generated in Sendcloud at HH:MM:SS UTC.

  ## Result
  PASS / FAIL — `<one-line note>`

  ## Next sanity check
  Day 1 of go-live (real first paid order); then weekly for two weeks.
  ```
- [ ] Commit:
  ```bash
  git add docs/runbooks/sendcloud-sanity-check.md
  git commit -m "docs(sp-5): record Sendcloud end-to-end sanity check"
  ```

**Acceptance:** Test order reached Sendcloud within 60s; test label generated; runbook file committed.

---

## Task 13 — Rollback runbook + dry-run rehearsal

**Files (Create):**
- `docs/runbooks/rollback.md`
- `docs/decisions/2026-05-19-sentry-deferred.md`

**Steps:**

- [ ] Create `docs/decisions/2026-05-19-sentry-deferred.md` (so the deferral is recorded, not silently lost):
  ```markdown
  # Decision: Sentry deferred at MVP

  **Date:** 2026-05-19
  **Status:** Accepted (defer; revisit week 2 post-launch)
  **Owner:** Michael (mrb)

  ## Decision
  `@sentry/nextjs` is **not installed** at MVP launch.

  ## Rationale
  - Time/budget pressure on the 2–3 week soft-launch window.
  - Vercel built-in logs + Speed Insights cover the most critical runtime
    visibility for a low-volume launch.
  - Uptime monitor (see `2026-05-19-uptime-monitor.md`) covers golden-path
    availability.
  - Adding Sentry post-launch is a 30-minute task — no architectural lock-in
    from deferring.

  ## Revisit trigger
  - Week 2 post-launch, OR
  - First runtime-error customer report, OR
  - Volume increase beyond ~100 orders/day.

  ## What we lose by deferring
  - Stack traces for client-side runtime errors.
  - Aggregated error rates.
  - Source-mapped exceptions in dashboards.

  ## What we keep
  - Vercel function logs (structured, last 24h on Hobby / 30 days on Pro).
  - Browser console errors (visible only to users — gap).
  - Synthetic uptime probes.
  ```
- [ ] Create `docs/runbooks/rollback.md` with the full runbook:
  ```markdown
  # Rollback runbook — Sensual Sweets

  **Owner:** Michael (mrb)
  **Backup operator:** designated dev (named at launch)
  **Target rollback time:** < 5 minutes (primary) / < 15 minutes (catastrophic)

  ## When to roll back

  Roll back IMMEDIATELY (no permission needed, < 5 min):
  - Site returns 500 on `/`, `/nl`, `/nl/shop`, or `/nl/shop/his`.
  - Add-to-cart fails for > 30s and SP-3 toast confirms it.
  - Checkout redirect lands on a non-Shopify domain or 404.
  - Lighthouse / Web Vitals show a > 50% LCP regression on `/nl/shop`.
  - Compliance violation discovered live (banned-term copy reached production).

  Coordinate first, then roll back (legal/PII/financial — < 15 min):
  - Storefront API token leak in client bundle.
  - Customer PII exposed (e.g., debug page deployed by mistake).
  - Payment / order flow corrupting Shopify state.

  ## Primary rollback (Vercel promote-previous)

  1. Identify the last-known-good Production deployment:
     ```bash
     vercel ls --prod
     ```
     Pick the deployment immediately BEFORE the bad one.
  2. Promote it:
     ```bash
     vercel rollback <deployment-url>
     ```
     Or via dashboard: Vercel → Project → Deployments → find the prior Production → "..." → Promote to Production.
  3. Verify:
     ```bash
     curl -sI https://<production-domain>/nl | head -1
     curl -sI https://<production-domain>/nl/shop | head -1
     curl -sI https://<production-domain>/nl/shop/his | head -1
     ```
     Expected: HTTP/2 200 on all three.
  4. Force-refresh the uptime monitor (Task 11) — it should clear within 5 min.

  ## Catastrophic rollback (kill switch + revert)

  If the issue is data/PII/legal (e.g., a payment integration is double-charging):

  1. **Kill the Storefront API token** immediately:
     - Shopify admin → Apps → "Sensual Sweets Storefront" (custom app) → API credentials → Revoke Storefront access token.
     - This breaks the live site (PLP/PDP/cart all fail) — that's the point.
  2. Promote the last-known-good deployment via the primary path above.
  3. Issue a new Storefront token in Shopify, update Vercel env (`NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` in Production), trigger a fresh deploy:
     ```bash
     vercel env rm NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN production
     vercel env add NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN production
     vercel deploy --prod
     ```
  4. Verify the three golden-path URLs again.

  ## Comms template (post-rollback)

  Internal Slack / Telegram:
  ```
  Sensual Sweets — production rolled back at HH:MM UTC.
  Reason: <one line>.
  Promoted deployment: <vercel deployment URL>.
  Site verified healthy on /, /nl/shop, /nl/shop/his.
  Postmortem to follow within 24h.
  ```

  External (only if customer-facing impact > 5 min):
  - Footer banner: "Tijdelijke storing verholpen — bedankt voor je geduld." / "Brief outage resolved — thanks for your patience."
  - Add-to-cart toast (if cart was lost): "Je winkelmand is geleegd — opnieuw toevoegen werkt nu weer." / "Your cart was cleared — please re-add items."

  ## Rehearsal — performed YYYY-MM-DD

  See Task 16's pre-launch dry run record (`docs/decisions/2026-05-19-pre-launch-dry-run.md`).
  ```
- [ ] **Rehearse the rollback** on a Preview deployment (do NOT touch Production for the drill until the dry run in Task 16):
  - Deploy two consecutive Preview deployments:
    ```bash
    vercel deploy   # capture URL_A
    # make a no-op change (e.g., bump a comment)
    git commit -am "chore: trigger preview B"
    vercel deploy   # capture URL_B
    ```
  - Time the rollback from URL_B to URL_A using `vercel promote` (preview-side equivalent):
    ```bash
    time vercel promote <URL_A>
    ```
  - Verify the alias / preview URL now serves URL_A's build.
  - Note the wall-clock time; expect well under 60 seconds for promote alone, < 5 min including verification curls.
- [ ] Commit:
  ```bash
  git add docs/runbooks/rollback.md docs/decisions/2026-05-19-sentry-deferred.md
  git commit -m "docs(sp-5): add rollback runbook and record Sentry-deferred decision"
  ```

**Acceptance:** Runbook covers primary + catastrophic paths; rehearsed on Preview; timing captured for the launch dry run.

---

## Task 14 — Pre-launch checklist (markdown)

**Files (Create):**
- `docs/runbooks/pre-launch-checklist.md`

**Steps:**

- [ ] Create `docs/runbooks/pre-launch-checklist.md`:
  ```markdown
  # Pre-launch checklist — Sensual Sweets

  **Owner:** Michael (mrb)
  **Source spec:** `docs/superpowers/specs/2026-05-19-shopify-store-design.md` (SP-5)
  **Launch target:** YYYY-MM-DD

  Every item must be checked **and dated** before DNS flip. Gate owner indicates
  who is responsible for marking the item complete. The Director / Michael owns
  the final go/no-go decision.

  ## Hard gates (no exceptions)

  - [ ] **(Michael)** Production branch decision recorded — `docs/decisions/2026-05-19-production-branch.md`.
  - [ ] **(Michael)** Shopify Payments status = Active. First test charge processed + refunded.
  - [ ] **(Counsel)** NL counsel sign-off on `/messages/legal/**` content — confirmation logged in `docs/decisions/2026-05-19-counsel-signoff.md`.
  - [ ] **(dev)** All SP-0..SP-4 acceptance criteria met (spot-check by reading each SP's `Acceptance criteria` section).
  - [ ] **(dev)** Compliance lint passes on the production-branch HEAD (`npm run check:compliance` exits 0).
  - [ ] **(dev)** GitHub Actions `CI` workflow passes on the merge commit to the production branch — all six jobs green.
  - [ ] **(dev)** Playwright golden path passes against the Production deployment URL (Task 16).
  - [ ] **(dev)** Lighthouse budgets met on `/nl` and `/nl/shop` against Production (a11y ≥ 95, perf ≥ 80, SEO ≥ 90).

  ## Fulfillment

  - [ ] **(Michael)** Sendcloud sanity check executed — `docs/runbooks/sendcloud-sanity-check.md`.
  - [ ] **(Michael)** First end-to-end paid order processed: cart → checkout → paid → Shopify shows order → Sendcloud receives → label generated.
  - [ ] **(Michael)** 3PL handoff process agreed (manual batch export at MVP — Phase 2 automates).

  ## Tax & legal

  - [ ] **(Michael / Accountant)** BTW rate confirmed in writing (9% reduced vs 21% standard for confectionery).
  - [ ] **(Michael)** Tax-inclusive prices ON in Shopify; verified on PDP.
  - [ ] **(Counsel)** All six policy pages live and finalised: Algemene Voorwaarden, Privacybeleid, Verzendbeleid, Retourbeleid, Cookiebeleid, Leeftijdsbeleid.
  - [ ] **(Counsel)** Soft 18+ footer disclosure approved (or hard modal switch decided — `docs/decisions/`).

  ## Infrastructure

  - [ ] **(dev)** Custom domain (apex + `www`) attached in Vercel, SSL valid — Task 15.
  - [ ] **(dev)** All env vars set in Production (`vercel env ls production` matches `.env.example` matrix).
  - [ ] **(dev)** Uptime monitor active with verified alert channel — `docs/decisions/2026-05-19-uptime-monitor.md`.
  - [ ] **(dev)** Rollback runbook rehearsed — `docs/runbooks/rollback.md`.

  ## Observability

  - [ ] **(dev)** Vercel Analytics events visible (`cart_add`, `cart_remove`, `begin_checkout`) after a manual run-through on Production.
  - [ ] **(dev)** Shopify Analytics commerce funnel populated from the first test orders.
  - [ ] **(Michael)** Sentry deferral acknowledged — `docs/decisions/2026-05-19-sentry-deferred.md`. Week-2 revisit on calendar.

  ## Comms & day-of

  - [ ] **(Michael)** Launch comms drafted (social / email / press if any).
  - [ ] **(Michael)** Support inbox monitored (zoho / shopify-default) — first 48h dedicated check-in cadence.
  - [ ] **(Michael)** Rollback decision-maker identified for first-24h on-call.

  ## Final sign-off

  - [ ] **(Michael)** All boxes above checked and dated. Recorded in `docs/decisions/launch-YYYY-MM-DD.md`.
  ```
- [ ] Commit:
  ```bash
  git add docs/runbooks/pre-launch-checklist.md
  git commit -m "docs(sp-5): add pre-launch checklist with gate owners"
  ```

**Acceptance:** Checklist file committed; each item has a gate owner (Michael / dev / counsel).

---

## Task 15 — Attach custom domain (apex + www)

**Steps (runbook):**

- [ ] Confirm with Michael the apex domain string (e.g., `sensualsweets.nl`) and the DNS provider (likely TransIP, Cloudflare, or Mijn.host).
- [ ] In Vercel: Dashboard → Project `sensual-sweets` → Settings → Domains → Add domain.
  - Add the apex: `<domain>` — Vercel will display the A record value (`76.76.21.21` or current Vercel apex IP).
  - Add the `www` subdomain: `www.<domain>` — Vercel will display the CNAME target (`cname.vercel-dns.com`).
- [ ] Configure DNS at the registrar:
  - **A record** for apex: name `@`, value `76.76.21.21` (use whatever value Vercel displays), TTL 300.
  - **CNAME record** for `www`: name `www`, value `cname.vercel-dns.com`, TTL 300.
  - **CAA record** (recommended): name `@`, value `0 issue "letsencrypt.org"`.
- [ ] Verify DNS propagation:
  ```bash
  dig +short <domain> A
  dig +short www.<domain> CNAME
  ```
  Expected: apex A returns Vercel IP; `www` CNAME returns `cname.vercel-dns.com`.
- [ ] In Vercel dashboard, refresh the Domains tab; each domain should show "Valid Configuration" + an SSL certificate issued by Let's Encrypt. SSL provisioning is typically < 60s after DNS resolves.
- [ ] Choose the canonical: in Vercel → Domains, set `<domain>` (apex) as the primary; `www.<domain>` redirects to apex (308). Confirm via:
  ```bash
  curl -sI https://www.<domain>/ | head -5
  curl -sI https://<domain>/ | head -5
  ```
  Expected: `www` returns 308 → apex; apex returns 200 or 307 → `/nl`.
- [ ] Verify SSL:
  ```bash
  curl -vI https://<domain>/ 2>&1 | grep -E '(subject|issuer|SSL connection)' | head -5
  ```
  Expected: issuer is Let's Encrypt; certificate covers both apex and `www`.
- [ ] No commit — runbook only. Record the domain in the pre-launch checklist when ticking the "Custom domain" box.

**Acceptance:** `dig` confirms DNS; `curl -I` confirms HTTPS + correct www→apex redirect; Vercel dashboard shows "Valid Configuration" on both domains.

---

## Task 16 — Pre-launch dry run (full CI + rollback drill)

**Files (Create):**
- `docs/decisions/2026-05-19-pre-launch-dry-run.md`

**Steps:**

- [ ] On the `feat/shopify-store-build` branch (or the integration branch targeted for the production merge), force a fresh PR to trigger the full CI matrix:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets"
  git checkout feat/shopify-store-build
  git pull
  # bump a comment in CHANGELOG.md or README to create a no-op commit
  git commit --allow-empty -m "chore: pre-launch dry run trigger"
  git push
  gh pr create --title "Pre-launch dry run" --body "Forcing a fresh CI run for the pre-launch dry run (Task 16)." --base master --head feat/shopify-store-build
  ```
- [ ] Watch all jobs in `gh pr checks` until they finish:
  ```bash
  gh pr checks --watch
  ```
  Capture wall-clock time for each:
  - `type-check`: ___ s
  - `lint`: ___ s
  - `compliance-check`: ___ s
  - `unit-tests`: ___ s
  - `build`: ___ s
  - `e2e-smoke`: ___ s (depends on Vercel Preview wait)
  - `lighthouse`: ___ s (depends on Vercel Preview wait)
- [ ] Hit the Vercel Preview URL produced by the PR and run the Playwright golden path locally against it:
  ```bash
  PLAYWRIGHT_BASE_URL=<preview-url> npx playwright test
  ```
  Capture pass/fail + total runtime.
- [ ] Run Lighthouse against the same Preview URL with mobile throttling explicitly:
  ```bash
  npx lhci collect --url=<preview-url>/nl --url=<preview-url>/nl/shop --settings.preset=mobile
  npx lhci assert --preset=lighthouse:no-pwa
  ```
  Capture pass/fail and scores.
- [ ] Execute a rollback drill **against the Preview alias** (NOT Production):
  - Identify two consecutive Preview deployments via `vercel ls`.
  - Promote the older one to the Preview alias:
    ```bash
    time vercel promote <older-deployment-url>
    ```
  - Verify the alias now serves the older build.
  - Roll forward again and verify.
- [ ] Create `docs/decisions/2026-05-19-pre-launch-dry-run.md`:
  ```markdown
  # Pre-launch dry run — Sensual Sweets

  **Date:** 2026-05-19 (or actual execution date)
  **Operator:** Michael (mrb) + dev
  **Branch under test:** `feat/shopify-store-build`
  **PR:** #<number>
  **Preview URL:** `<url>`

  ## CI job timings (GitHub Actions)
  | Job | Duration | Result |
  |---|---|---|
  | type-check | <X>s | pass/fail |
  | lint | <X>s | pass/fail |
  | compliance-check | <X>s | pass/fail |
  | unit-tests | <X>s | pass/fail |
  | build | <X>s | pass/fail |
  | e2e-smoke | <X>s | pass/fail |
  | lighthouse | <X>s | pass/fail |
  | **Total wall clock (parallel)** | <X> min | — |

  ## Playwright golden path against Preview
  - Total runtime: <X>s
  - Tests passed: <N>/<N>
  - Failures: <none / list>

  ## Lighthouse against Preview (mobile)
  | URL | Perf | A11y | Best Practices | SEO |
  |---|---|---|---|---|
  | `<preview>/nl` | <X> | <X> | <X> | <X> |
  | `<preview>/nl/shop` | <X> | <X> | <X> | <X> |

  ## Rollback drill
  - Promote older Preview → time `<X>s`.
  - Verify alias serves rolled-back build: pass/fail.
  - Roll forward → time `<X>s`.
  - **Total rollback wall-clock:** `<X>s` (target < 5 min — pass/fail).

  ## Issues found + resolution
  <bulleted list, or "none">

  ## Go/no-go recommendation
  GO / NO-GO — `<one-line rationale>`.
  ```
- [ ] Tick the corresponding boxes in `docs/runbooks/pre-launch-checklist.md` and date them.
- [ ] Commit:
  ```bash
  git add docs/decisions/2026-05-19-pre-launch-dry-run.md docs/runbooks/pre-launch-checklist.md
  git commit -m "docs(sp-5): record pre-launch dry run timings and go/no-go"
  ```

**Acceptance:** All six CI jobs green on the dry-run PR; Playwright passes against the Preview; Lighthouse meets budgets; rollback drill completed under 5 min wall-clock; decision file committed with go/no-go recommendation.

---

## Closing — post-task housekeeping

- [ ] Update `~/.claude/projects/-Users-mrb-LocalDev-NextJS-sensual-sweets/memory/MEMORY.md` with one line per major artifact added by SP-5 (vercel.ts, analytics wrapper, CI workflows, rollback runbook).
- [ ] Append commit summaries to the project's `commit-log.md` per the global memory protocol (no `Co-Authored-By` trailers).
- [ ] Flag any open items that did not complete (e.g., counsel sign-off pending, BTW rate unconfirmed) in the pre-launch checklist BEFORE the production merge.
- [ ] Once the production branch merge is approved and SP-5 acceptance criteria are met:
  ```bash
  git checkout <production-branch>
  git merge --no-ff feat/shopify-store-build
  git push
  vercel deploy --prod
  ```
  Then execute Task 15's domain attach (if not already live) and confirm the pre-launch checklist is 100% green.

**Final acceptance (matches spec):**

1. Production deploy live on custom domain with valid SSL.
2. All CI jobs green on the production-branch HEAD.
3. Playwright golden path passes against Production.
4. One real end-to-end paid order completes Shopify → Sendcloud → label.
5. Pre-launch checklist 100% ticked; evidence in `docs/decisions/launch-YYYY-MM-DD.md` (created by the launching operator on the day).
6. Rollback drill executed and timed.
