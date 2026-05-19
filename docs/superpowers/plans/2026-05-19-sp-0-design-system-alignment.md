# SP-0 — Design-System Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `src/app/globals.css` to byte-level parity with the canonical design system at `sensual-sweets-design/v1-design/sensual-sweets.css` — drop the `--ss-*` token prefix, port the canonical component-class layer, add a light-theme token block, and document the two locked divergences (smoother `@property --neon-angle` border + Tailwind v4 `@theme inline` registrations).
**Architecture:** Single-file CSS layer in `src/app/globals.css` imported once from `src/app/layout.tsx`. All design tokens are plain CSS custom properties on `:root, [data-theme="dark"]` (dark default) plus an additive `[data-theme="light"]` neutrals-only block. Component classes (`.btn-ss*`, `.card-ss*`, `.badge-ss*`, `.ss-nav`, `.ss-orb*`, `.text-*`, `.neon-card-outer-ss`) are vanilla CSS classes — no Tailwind utilities, no runtime dependencies.
**Tech Stack:** Tailwind v4, plain CSS custom properties, no runtime deps.

---

## Task 1: Inventory current state

**Files affected:**
- Read: `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets-design/v1-design/sensual-sweets.css` (canonical source-of-truth)
- Read: `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css` (project file)
- No writes in this task — output is a captured audit string used in Task 5 as the `/* DIVERGENCE: ... */` block header

- [ ] **Step 1: Read the canonical CSS in full**

  Run:
  ```bash
  wc -l "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets-design/v1-design/sensual-sweets.css"
  ```

  Expected output: a single line ending with `.../sensual-sweets.css` and a leading count of `     264` (the canonical file is 264 lines as of 2026-05-19).

  Then open the file (Read tool) and confirm these structural anchors exist in this order:
  1. `:root, [data-theme="dark"] {` block (tokens)
  2. `[data-theme="light"] {` block (light neutrals only)
  3. `.btn-ss` base, then `.btn-ss-duo`, `.btn-ss-his`, `.btn-ss-hers`, `.btn-ss-ghost`, `.btn-ss-sm`, `.btn-ss-lg`
  4. `.card-ss`, `.card-ss-his`, `.card-ss-hers`, `.neon-card-outer-ss`, `.neon-card-inner-ss`, `@keyframes neonChase`
  5. `.badge-ss`, `.badge-ss-duo`, `.badge-ss-his`, `.badge-ss-hers`, `.badge-ss-warn`, `.badge-ss-neutral`
  6. `.ss-orb`, `.ss-orb-his`, `.ss-orb-hers`, `@keyframes orbBreath`
  7. `.text-duo-gradient`, `.text-his`, `.text-hers`, `.text-duo`
  8. `.ss-nav`, `.ss-nav-brand`

- [ ] **Step 2: Read the project globals.css in full**

  Open `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css` (Read tool). Confirm:
  - `:root` block uses `--ss-*` prefixed tokens (lines 4–29)
  - `@property --neon-angle` block (lines 32–36) — **this is divergence #1, must be preserved**
  - `@theme inline { ... }` Tailwind v4 block (lines 94–104) — **this is divergence #2, must be preserved**
  - `.neon-card-outer` / `.neon-card-inner` (lines 186–231) use the project's smoother conic-gradient `@property` rotation — **preserve under their original unsuffixed names AND ALSO add the canonical `.neon-card-outer-ss` / `.neon-card-inner-ss` keyframe-swap variants alongside**
  - Pre-existing keep-as-is utilities: `.font-playfair`, `.gradient-text`, `.gradient-text-animate`, `.gradient-button`, `.text-glow`, `.glow-sm`, `.glow-md`, `.glow-lg`, `.bg-grid`, `.section-divider`, `.step-connector`, `.star`, `.neon-card-outer`, `.neon-card-inner`, `@keyframes float|float-reverse|glow-pulse|shimmer|bounce-gentle|fade-up|star-twinkle|orb-breath|gummy-drift|product-rise|neon-rotate`, `@media (prefers-reduced-motion: reduce)`

- [ ] **Step 3: Grep for `--ss-` across `src/` and `public/`**

  Run:
  ```bash
  grep -rn "\-\-ss\-" "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/" "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/public/" 2>/dev/null
  ```

  Expected output (verified 2026-05-19):
  ```
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:5:  --ss-bg: #07000e;
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:6:  --ss-surface: #0e0018;
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:7:  --ss-surface-2: #110022;
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:8:  --ss-text: rgba(255, 255, 255, 0.95);
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:9:  --ss-muted: rgba(255, 255, 255, 0.65);
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:10:  --ss-dim: rgba(255, 255, 255, 0.4);
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:11:  --ss-border: rgba(255, 255, 255, 0.1);
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:12:  --ss-his: #3b82f6;
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:13:  --ss-his-deep: #1e3a8a;
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:14:  --ss-hers: #e11d48;
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:15:  --ss-hers-deep: #7f1d1d;
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:16:  --ss-duo: #c026d3;
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:17:  --ss-duo-gradient: linear-gradient(
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:23:  --ss-duo-gradient-hover: linear-gradient(
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:138:  background: var(--ss-duo-gradient);
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:241:  background: var(--ss-duo-gradient);
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:251:  background: var(--ss-duo-gradient-hover);
  /Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css:269:  background: var(--ss-duo-gradient);
  ```

  **All 18 hits are inside `src/app/globals.css`. No component TSX, no `public/` SVG, no other file references `--ss-*`.** This confirms the rename is CSS-internal and component markup can stay untouched in SP-0.

- [ ] **Step 4: Grep for stale component-class names that the spec earmarks for porting**

  Run:
  ```bash
  grep -rn "btn-ss\|card-ss\|badge-ss\|ss-nav\|ss-orb\|text-duo-gradient\|text-his\|text-hers\|neon-card-outer-ss\|neon-card-inner-ss" "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/" 2>/dev/null
  ```

  Expected output: empty (zero matches). These canonical classes are not yet used in component TSX — SP-3 will introduce them. The job of SP-0 is to make them resolvable in DevTools so SP-3 can land cleanly. If matches do appear, note them for Task 6 visual verification (an existing component already depends on a class about to be ported).

- [ ] **Step 5: Confirm Task 1 audit baseline (no file changes yet)**

  Run:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets" && git status --short
  ```

  Expected output: should NOT list `src/app/globals.css` as Modified (or, if it already is from the working tree, you understand the pre-existing diff before Task 2 starts). Snapshot the current state mentally; this is the pre-rename baseline used for the visual regression check in Task 6.

---

## Task 2: Token rename in `globals.css`

**Files affected:**
- Modify: `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css`

The rename is a one-shot replacement of the `:root` block plus four `var(--ss-duo-gradient*)` call-sites. Per the spec mapping: `--ss-bg → --bg`, `--ss-surface → --surface-1-solid` (the project's single solid surface — canonical also exposes `--surface-1/2/3` as translucent layers, which we add in Task 3 as part of porting the full canonical token block), `--ss-surface-2 → --surface-2-solid` (project-only convenience holding `#110022`, kept available for any existing TSX usage; canonical `--surface-2` is the translucent layer), `--ss-text → --text-1`, `--ss-muted → --text-2`, `--ss-dim → --text-3`, `--ss-border → --border-visible`, `--ss-his → --his`, `--ss-his-deep → --his-deep`, `--ss-hers → --hers`, `--ss-hers-deep → --hers-deep`, `--ss-duo → --duo`, `--ss-duo-gradient → --duo-gradient`, `--ss-duo-gradient-hover → --duo-gradient-hover`.

- [ ] **Step 1: Replace the project `:root` token block with the full canonical dark-theme token block**

  In `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css`, replace lines 3–29 (the comment `/* Sensual Sweets design tokens are mirrored from the provided showcase CSS. */` plus the entire `:root { ... }` block) with the following exact content:

  ```css
  /* ============================================================
     Sensual Sweets — Design System Tokens & Components
     Mirrored from sensual-sweets-design/v1-design/sensual-sweets.css
     SoT: that file. Mirror direction: SoT → project, never reverse.
     See docs/design/drift-check.md for the diff/pull runbook.
     ============================================================ */

  /* ============================================================ */
  /* TOKENS:DARK — Sensual Sweets brand tokens                    */
  /* ============================================================ */
  :root, [data-theme="dark"] {
    --bg:               #07000E;
    --surface-1:        rgba(14,0,24,0.55);
    --surface-2:        rgba(17,0,34,0.65);
    --surface-3:        rgba(26,0,52,0.65);
    --surface-1-solid:  #0E0018;
    --surface-2-solid:  #110022; /* project-only convenience: solid sibling for --surface-2 used by legacy components */
    --border-hairline:  rgba(255,255,255,0.06);
    --border-visible:   rgba(255,255,255,0.10);
    --text-1:           rgba(255,255,255,0.95);
    --text-2:           rgba(255,255,255,0.65);
    --text-3:           rgba(255,255,255,0.40);
    --primary:          #3B82F6;
    --primary-hover:    #2563EB;
    --primary-soft:     rgba(59,130,246,0.12);
    --primary-strong:   rgba(59,130,246,0.40);
    --accent:           #C026D3;
    --secondary:        #E11D48;
    --info:             #22D3EE;
    --warn:             #E2C854;
    --danger:           #E11D48;
    --special:          #C026D3;
    --his:              #3B82F6;
    --his-glow:         #2563EB;
    --his-deep:         #1E3A8A;
    --hers:             #E11D48;
    --hers-glow:        #BE123C;
    --hers-deep:        #7F1D1D;
    --duo:              #C026D3;
    --duo-gradient:     linear-gradient(135deg, #3B82F6 0%, #C026D3 50%, #E11D48 100%);
    --duo-gradient-hover: linear-gradient(135deg, #60A5FA 0%, #D946EF 50%, #F43F5E 100%);
    --font-display:     'Playfair Display', Georgia, 'Times New Roman', serif;
    --font-body:        'Raleway', ui-sans-serif, system-ui, -apple-system, sans-serif;
    --font-mono:        'JetBrains Mono', ui-monospace, monospace;
    --radius-sm:        12px;
    --radius-md:        24px;
    --radius-lg:        32px;
    --radius-full:      9999px;
    --space-card:       32px;
    --space-section:    96px;
    --space-gap:        16px;
    --shadow-card:
      0 0 0 1px rgba(255,255,255,0.05),
      inset 0 1px 0 rgba(255,255,255,0.04),
      0 14px 36px -12px rgba(0,0,0,0.7);
    --shadow-card-hover:
      0 0 0 1px rgba(255,255,255,0.10),
      inset 0 1px 0 rgba(255,255,255,0.07),
      0 24px 56px -18px rgba(0,0,0,0.8);
    --shadow-glow-primary:
      0 0 0 1px rgba(59,130,246,0.32),
      inset 0 1px 0 rgba(255,255,255,0.05),
      0 0 28px -2px rgba(59,130,246,0.30),
      0 14px 36px -12px rgba(0,0,0,0.7);
    --shadow-glow-duo:
      0 0 24px rgba(192,38,211,0.40),
      0 14px 36px -12px rgba(0,0,0,0.7);
    --shadow-glow-his:
      0 0 20px rgba(37,99,235,0.40),
      0 14px 36px -12px rgba(0,0,0,0.7);
    --shadow-glow-hers:
      0 0 20px rgba(225,29,72,0.40),
      0 14px 36px -12px rgba(0,0,0,0.7);
    --shadow-inset:
      inset 0 0 0 1px rgba(255,255,255,0.05),
      inset 0 2px 4px 0 rgba(0,0,0,0.45);
    --shadow-pop:
      0 0 0 1px rgba(255,255,255,0.06),
      0 28px 64px -12px rgba(0,0,0,0.85);
    --glass-bg:          linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
    --gradient-shell:    linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 35%, rgba(0,0,0,0.6));
    --gradient-shell-primary: linear-gradient(180deg, rgba(59,130,246,0.45), rgba(59,130,246,0.08) 40%, rgba(0,0,0,0.6));
    --gradient-shell-duo: linear-gradient(135deg, rgba(59,130,246,0.30), rgba(192,38,211,0.20), rgba(225,29,72,0.30));
    --ambient:
      radial-gradient(65% 55% at 10% 10%, rgba(59,130,246,0.12), transparent 65%),
      radial-gradient(55% 45% at 85% 15%, rgba(225,29,72,0.10), transparent 65%),
      radial-gradient(45% 40% at 50% 95%, rgba(192,38,211,0.08), transparent 60%);
  }
  ```

  Use the `Edit` tool with `old_string` matching from the `/* Sensual Sweets design tokens...` comment through the closing `}` of the original `:root` block, and `new_string` set to the content above.

- [ ] **Step 2: Update the four in-file `var(--ss-duo-gradient*)` call-sites**

  Still in `src/app/globals.css`, perform these four exact edits:

  1. In `.gradient-text` (was line 138): `background: var(--ss-duo-gradient);` → `background: var(--duo-gradient);`
  2. In `.gradient-button` (was line 241): `background: var(--ss-duo-gradient);` → `background: var(--duo-gradient);`
  3. In `.gradient-button::before` (was line 251): `background: var(--ss-duo-gradient-hover);` → `background: var(--duo-gradient-hover);`
  4. In `.section-divider` (was line 269): `background: var(--ss-duo-gradient);` → `background: var(--duo-gradient);`

  Each is a single-line `Edit` with the surrounding selector kept intact in `old_string` to guarantee uniqueness.

- [ ] **Step 3: Verify zero `--ss-` substrings remain in `src/` and `public/`**

  Run:
  ```bash
  grep -rn "\-\-ss\-" "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/" "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/public/" 2>/dev/null ; echo "exit=$?"
  ```

  Expected output:
  ```
  exit=1
  ```

  An empty body + `exit=1` from grep means zero matches across both trees. If any line prints before `exit=`, fix that file and re-run.

- [ ] **Step 4: Sanity-check the body and other unprefixed token consumers still parse**

  Run:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets" && grep -n "var(--" src/app/globals.css | head -40
  ```

  Expected: every `var(--…)` in the file references a token defined in the new `:root, [data-theme="dark"]` block (e.g. `var(--duo-gradient)`, `var(--font-playfair)`, etc.). No leftover `var(--ss-…)`.

---

## Task 3: Port canonical component classes

**Files affected:**
- Modify: `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css`

Append the canonical button / card / badge / orb / typography / nav blocks to `globals.css`, exactly as written in the canonical file, with the project's existing `.neon-card-outer` / `.neon-card-inner` (`@property --neon-angle` smoother version) preserved as-is and the canonical keyframe-swap variants added under the `-ss` suffix.

- [ ] **Step 1: Append the canonical Button / Card / Badge / Orb / Text / Nav block to the end of `globals.css`**

  Use the `Edit` tool. `old_string`: the final closing brace + newline of the existing `@media (prefers-reduced-motion: reduce) { ... }` block (the last lines of the file as it stands after Task 2). `new_string`: that same closing block followed by the canonical content below. Paste this verbatim (these are bytes from `sensual-sweets-design/v1-design/sensual-sweets.css`, lines 113–264):

  ```css

  /* ============================================================ */
  /* BUTTON SYSTEM (canonical port)                                */
  /* ============================================================ */

  /* Base */
  .btn-ss {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--font-body);
    font-size: 12px; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase;
    border: none; cursor: pointer;
    border-radius: var(--radius-full); padding: 12px 28px;
    transition: all 200ms ease;
    white-space: nowrap;
    text-decoration: none;
  }

  /* DUO — primary gradient CTA */
  .btn-ss-duo {
    background: var(--duo-gradient);
    color: #fff;
    box-shadow: var(--shadow-glow-duo);
  }
  .btn-ss-duo:hover {
    background: var(--duo-gradient-hover);
    transform: scale(1.02);
    box-shadow: 0 0 32px rgba(192,38,211,0.55);
  }

  /* HIS */
  .btn-ss-his { background: var(--his); color: #fff; box-shadow: var(--shadow-glow-his); }
  .btn-ss-his:hover { background: var(--his-glow); transform: scale(1.02); }

  /* HERS */
  .btn-ss-hers { background: var(--hers); color: #fff; box-shadow: var(--shadow-glow-hers); }
  .btn-ss-hers:hover { background: var(--hers-glow); transform: scale(1.02); }

  /* Ghost */
  .btn-ss-ghost {
    background: rgba(255,255,255,0.05);
    color: var(--text-2);
    border: 1px solid rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
  }
  .btn-ss-ghost:hover { background: rgba(255,255,255,0.10); color: var(--text-1); }

  /* Sizes */
  .btn-ss-sm { font-size: 11px; padding: 8px 18px; }
  .btn-ss-lg { font-size: 14px; padding: 16px 40px; }

  /* ============================================================ */
  /* CARD SYSTEM (canonical port)                                  */
  /* ============================================================ */
  .card-ss {
    background: var(--surface-1-solid);
    border: 1px solid var(--border-visible);
    border-radius: var(--radius-md);
    padding: var(--space-card);
    transition: all 250ms ease;
  }
  .card-ss:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }

  .card-ss-his {
    border-color: rgba(59,130,246,0.25);
    box-shadow: 0 0 40px rgba(37,99,235,0.10);
  }
  .card-ss-his:hover { box-shadow: 0 0 56px rgba(37,99,235,0.20); }

  .card-ss-hers {
    border-color: rgba(225,29,72,0.25);
    box-shadow: 0 0 40px rgba(225,29,72,0.10);
  }
  .card-ss-hers:hover { box-shadow: 0 0 56px rgba(225,29,72,0.20); }

  /* Neon-chase shell (canonical keyframe-swap variant — KEPT ALONGSIDE the smoother
     project @property --neon-angle .neon-card-outer / .neon-card-inner higher up
     in this file. See DIVERGENCE block at top of globals.css.) */
  .neon-card-outer-ss {
    border-radius: calc(var(--radius-md) + 1px);
    padding: 1px;
    animation: neonChase 3.5s linear infinite;
  }
  .neon-card-inner-ss {
    background: var(--surface-1-solid);
    border-radius: var(--radius-md);
    padding: var(--space-card);
  }
  @keyframes neonChase {
    0%   { background-image: linear-gradient(0deg,   rgba(59,130,246,0.60), rgba(192,38,211,0.40), rgba(225,29,72,0.60)); }
    25%  { background-image: linear-gradient(90deg,  rgba(59,130,246,0.60), rgba(192,38,211,0.40), rgba(225,29,72,0.60)); }
    50%  { background-image: linear-gradient(180deg, rgba(59,130,246,0.60), rgba(192,38,211,0.40), rgba(225,29,72,0.60)); }
    75%  { background-image: linear-gradient(270deg, rgba(59,130,246,0.60), rgba(192,38,211,0.40), rgba(225,29,72,0.60)); }
    100% { background-image: linear-gradient(360deg, rgba(59,130,246,0.60), rgba(192,38,211,0.40), rgba(225,29,72,0.60)); }
  }

  /* ============================================================ */
  /* BADGE SYSTEM (canonical port)                                 */
  /* ============================================================ */
  .badge-ss {
    display: inline-flex; align-items: center; gap: 4px;
    font-family: var(--font-body);
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    padding: 4px 12px; border-radius: var(--radius-full);
  }
  .badge-ss-duo   { background: rgba(192,38,211,0.12); color: #D946EF; border: 1px solid rgba(192,38,211,0.35); }
  .badge-ss-his   { background: rgba(59,130,246,0.12);  color: #60A5FA; border: 1px solid rgba(59,130,246,0.35); }
  .badge-ss-hers  { background: rgba(225,29,72,0.12);   color: #FB7185; border: 1px solid rgba(225,29,72,0.35); }
  .badge-ss-warn  { background: rgba(226,200,84,0.12);  color: #E2C854; border: 1px solid rgba(226,200,84,0.35); }
  .badge-ss-neutral { background: var(--surface-2); color: var(--text-2); border: 1px solid var(--border-visible); }

  /* ============================================================ */
  /* AMBIENT ORB HELPER (canonical port)                           */
  /* ============================================================ */
  .ss-orb {
    position: absolute; border-radius: 50%;
    pointer-events: none; will-change: transform;
    animation: orbBreath 7s ease-in-out infinite alternate;
  }
  .ss-orb-his  { background: radial-gradient(circle, rgba(59,130,246,0.45) 0%, transparent 70%); }
  .ss-orb-hers { background: radial-gradient(circle, rgba(225,29,72,0.40) 0%, transparent 70%); animation-duration: 8s; animation-direction: alternate-reverse; }
  @keyframes orbBreath {
    from { transform: scale(1.0); opacity: 0.7; }
    to   { transform: scale(1.08); opacity: 1.0; }
  }

  /* ============================================================ */
  /* GRADIENT TEXT UTILITY (canonical port)                        */
  /* ============================================================ */
  .text-duo-gradient {
    background: var(--duo-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .text-his  { color: var(--his); }
  .text-hers { color: var(--hers); }
  .text-duo  { color: var(--duo); }

  /* ============================================================ */
  /* NAV (canonical port)                                          */
  /* ============================================================ */
  .ss-nav {
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(14,0,24,0.85); backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: var(--radius-full);
    padding: 10px 20px 10px 16px;
  }
  .ss-nav-brand {
    font-family: var(--font-display); font-style: italic; font-weight: 900; font-size: 16px;
    background: var(--duo-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  ```

- [ ] **Step 2: Confirm project-only `.neon-card-outer` / `.neon-card-inner` (the smoother `@property`-driven divergence) is still present and untouched**

  Run:
  ```bash
  grep -n "\.neon-card-outer\b\|\.neon-card-inner\b\|@property --neon-angle\|@keyframes neon-rotate\b" "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css"
  ```

  Expected output (line numbers will have shifted, but the four anchors must all appear):
  ```
  <N>:@property --neon-angle {
  <N>:@keyframes neon-rotate {
  <N>:.neon-card-outer {
  <N>:.neon-card-outer:hover {
  <N>:.neon-card-inner {
  <N>:.neon-card-inner::before {
  ```

  If any of these is missing, the append in Step 1 overwrote them — revert and redo the append with the closing `}` of `@media (prefers-reduced-motion: reduce)` as the `old_string` anchor.

- [ ] **Step 3: Confirm the canonical port also added the `-ss`-suffixed neon classes**

  Run:
  ```bash
  grep -n "\.neon-card-outer-ss\|\.neon-card-inner-ss\|@keyframes neonChase\b" "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css"
  ```

  Expected output: exactly three lines, each anchoring one of the three identifiers.

- [ ] **Step 4: Spot-check all newly-ported class names are present**

  Run:
  ```bash
  for c in btn-ss btn-ss-duo btn-ss-his btn-ss-hers btn-ss-ghost btn-ss-sm btn-ss-lg \
           card-ss card-ss-his card-ss-hers neon-card-outer-ss neon-card-inner-ss \
           badge-ss badge-ss-duo badge-ss-his badge-ss-hers badge-ss-warn badge-ss-neutral \
           ss-nav ss-nav-brand ss-orb ss-orb-his ss-orb-hers \
           text-duo-gradient text-his text-hers text-duo ; do
    grep -q "\.${c}\b" "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css" \
      && echo "OK  .${c}" || echo "MISS .${c}"
  done
  ```

  Expected output: 27 lines, every line beginning with `OK  `. Any `MISS` means the canonical port is incomplete — re-do Step 1 paying attention to the missing selector.

---

## Task 4: Add light-theme token block

**Files affected:**
- Modify: `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css`

The dark `:root, [data-theme="dark"]` block from Task 2 is the default. We now add the canonical `[data-theme="light"]` block — neutrals only, brand colours constant — so SP-3+ can flip themes via `<html data-theme="light">` without further CSS work.

- [ ] **Step 1: Insert the `[data-theme="light"]` block immediately after the dark-theme block**

  Locate the closing `}` of the `:root, [data-theme="dark"] { ... }` block in `globals.css` (it ends with the `--ambient: ...` declaration followed by a closing brace). Insert the following block immediately after that closing brace, before the `@property --neon-angle { ... }` block:

  ```css

  /* ============================================================ */
  /* TOKENS:LIGHT — neutrals-only override                         */
  /* Brand colours (--his, --hers, --duo, --duo-gradient) stay     */
  /* constant; only neutrals flip. No toggle UI in MVP — set       */
  /* <html data-theme="light"> manually to preview.                */
  /* ============================================================ */
  [data-theme="light"] {
    --bg: #F8F4FF;
    --surface-1: #FFFFFF;
    --surface-2: #F3EEFF;
    --surface-3: #E9DDFF;
    --surface-1-solid: #FFFFFF;
    --border-hairline: rgba(0,0,0,0.06);
    --border-visible: rgba(0,0,0,0.10);
    --text-1: #07000E;
    --text-2: #3A2A55;
    --text-3: #71717A;
    --primary: #2563EB;
    --primary-hover: #1D4ED8;
    --primary-soft: rgba(37,99,235,0.10);
    --primary-strong: rgba(37,99,235,0.40);
    --accent: #C026D3;
    --secondary: #E11D48;
    --duo-gradient: linear-gradient(135deg, #2563EB 0%, #9333EA 50%, #E11D48 100%);
    --ambient: none;
  }
  ```

  Use `Edit` with `old_string` set to the dark block's closing `}` plus the literal next line (whatever comment or rule immediately follows it) to guarantee unique anchoring, and `new_string` inserting the light block between them.

- [ ] **Step 2: Verify the light block was inserted in the right place**

  Run:
  ```bash
  grep -n "data-theme=" "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css"
  ```

  Expected output (two lines):
  ```
  <N>::root, [data-theme="dark"] {
  <M>:[data-theme="light"] {
  ```

  Where `<M>` is greater than `<N>`. If `[data-theme="light"]` does not appear or appears before the dark block, redo Step 1.

- [ ] **Step 3: Manual smoke-test the light block (deferred to Task 6 visual verification)**

  Note for the Task 6 verifier: setting `<html data-theme="light">` (via DevTools attribute edit on `/`) must visibly flip background and text colours without changing the HIS / HERS / DUO brand colours. This is verified by eye in Task 6 Step 4; nothing to do in Task 4 itself.

---

## Task 5: Document divergences

**Files affected:**
- Create: `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/docs/design/drift-check.md`
- Modify: `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css` (add a `/* DIVERGENCE: ... */` comment block at the very top)

- [ ] **Step 1: Create `docs/design/drift-check.md` with the manual diff runbook**

  Write the file at `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/docs/design/drift-check.md` with this exact content:

  ```markdown
  # Drift-check runbook

  **Last reviewed:** 2026-05-19 (SP-0 design-system alignment landed).

  ## Source of truth

  - **Canonical CSS:** `sensual-sweets-design/v1-design/sensual-sweets.css` (sibling iCloud symlink, owned by design-side Claude).
  - **Project mirror:** `src/app/globals.css` (this repo).
  - **Mirror direction:** SoT → project, **never reverse**. Edits authored in this repo do not flow back to the design folder; they must be re-authored there first and then mirrored here.

  ## When to run this check

  - Before merging any PR that touches `src/app/globals.css`.
  - After every design-side iteration (whenever the design Claude reports an update to the canonical CSS).
  - Before every production deploy as a launch-checklist line (SP-5).

  ## Procedure (manual, 5 minutes)

  1. Confirm the canonical file's path and last-modified time:
     ```bash
     ls -la "../sensual-sweets-design/v1-design/sensual-sweets.css"
     stat -f "%Sm" "../sensual-sweets-design/v1-design/sensual-sweets.css"
     ```
  2. Diff against the project mirror (token block + component blocks only — divergences are expected near the top of `globals.css` and around `.neon-card-outer*`):
     ```bash
     diff -u \
       "../sensual-sweets-design/v1-design/sensual-sweets.css" \
       "src/app/globals.css" | less
     ```
  3. Walk the diff. Every hunk must be one of:
     - A **locked divergence** (listed below) — leave it alone.
     - A canonical change that has not yet been mirrored — pull it into `globals.css` exactly, then rerun the diff and confirm only locked divergences remain.
     - Something else — STOP and flag to Michael before merging. Unknown drift means the SoT and the project disagree about reality.

  ## Locked divergences (do NOT "fix" on pull)

  1. **Neon border driver.** The project ships a smoother conic-gradient rotation driven by `@property --neon-angle` + `@keyframes neon-rotate` powering `.neon-card-outer` / `.neon-card-inner`. The canonical CSS uses keyframe `background-image` swaps powering `.neon-card-outer-ss` / `.neon-card-inner-ss` (also ported into this repo for future canonical-aligned usage). The smoother `@property` version is GPU-friendlier and must remain the default. **Both variants coexist in `globals.css`.**
  2. **Tailwind v4 `@theme inline` registrations.** The project registers font and animation tokens via `@theme inline { ... }` so Tailwind utilities (`font-playfair`, `animate-float`, etc.) resolve. The canonical CSS is plain CSS and has no Tailwind layer. This block lives in the project only.

  ## Adding a new divergence

  If a future design pull requires a divergence that is not on the list above:
  1. Document it under "Locked divergences" with reason + GPU/UX justification + a one-line example.
  2. Update the `/* DIVERGENCE: ... */` comment block at the top of `src/app/globals.css` to match.
  3. Get Michael's sign-off in the PR description.

  ## Future automation (Phase 2)

  Replace this manual workflow with a CI job:
  - Strip Tailwind `@theme` block + project-only `.neon-card-outer*` block from `globals.css` with `sed`.
  - `diff -q` against canonical.
  - Fail on any output other than empty.

  Scoped under SP-5 risks; not blocking for MVP.
  ```

- [ ] **Step 2: Add the `/* DIVERGENCE: ... */` comment block at the top of `globals.css`**

  Open `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css` and `Edit` the first three lines (the `@import "tailwindcss";` line plus the empty line plus the existing canonical-mirror header from Task 2) so that the file begins with:

  ```css
  @import "tailwindcss";

  /* ============================================================
     DIVERGENCE FROM CANONICAL (intentional — do NOT "fix" on pull)
     1. .neon-card-outer / .neon-card-inner use @property --neon-angle
        + @keyframes neon-rotate (smoother, GPU-friendly conic rotation).
        The canonical keyframe-swap variants are also present as
        .neon-card-outer-ss / .neon-card-inner-ss + @keyframes neonChase
        for future canonical-aligned usage. Both coexist by design.
     2. The @theme inline { ... } block registers Tailwind v4 font
        and animation utilities. Canonical CSS has no Tailwind layer.
     See docs/design/drift-check.md for the full pull runbook.
     ============================================================ */

  /* ============================================================
     Sensual Sweets — Design System Tokens & Components
     Mirrored from sensual-sweets-design/v1-design/sensual-sweets.css
     SoT: that file. Mirror direction: SoT → project, never reverse.
     See docs/design/drift-check.md for the diff/pull runbook.
     ============================================================ */
  ```

  Concretely: in the Edit, `old_string` is the existing file head (the `@import` line plus the existing 6-line mirrored-from header inserted in Task 2 Step 1), and `new_string` is the block above (which preserves the existing header verbatim and inserts the new DIVERGENCE block between `@import` and the mirrored-from header).

- [ ] **Step 3: Verify the DIVERGENCE block and the runbook both exist**

  Run:
  ```bash
  head -20 "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css" && echo "---" && ls -la "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/docs/design/drift-check.md"
  ```

  Expected: the first 20 lines must contain the string `DIVERGENCE FROM CANONICAL`; the `ls -la` line must show `drift-check.md` exists (size > 0 bytes).

---

## Task 6: Verify and commit

**Files affected:**
- Verify (no edits): `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/app/globals.css`
- Verify (no edits): `/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/docs/design/drift-check.md`
- Commit to branch `feat/shopify-store-build`

- [ ] **Step 1: Final grep — zero `--ss-` substrings repo-wide (src + public)**

  Run:
  ```bash
  grep -rn "\-\-ss\-" "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/src/" "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets/public/" 2>/dev/null ; echo "exit=$?"
  ```

  Expected output:
  ```
  exit=1
  ```

  Any line printed before `exit=` is a failure — open the offending file and fix before continuing.

- [ ] **Step 2: TypeScript / lint sanity (build will catch CSS too via Next.js postcss)**

  Run:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets" && npm run build
  ```

  Expected: the command exits 0. Output includes a `Compiled successfully` line, lists routes, and shows no Tailwind warnings about unknown utilities. If you see `Module not found`, `Unknown utility class`, or a postcss parse error pointing at `globals.css`, fix that line before continuing.

- [ ] **Step 3: Boot the dev server and confirm the canonical classes resolve**

  In one shell, run:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets" && npm run dev
  ```

  Visit `http://localhost:3000/`. In DevTools (Elements / Styles), inspect any DOM element, click "+" in the Styles pane to add an experimental class to `<body>`, type `btn-ss-duo`, and confirm DevTools resolves it (the rule shows `background: var(--duo-gradient)` from `globals.css`). Repeat for `card-ss`, `badge-ss-warn`, `ss-orb-his`, `text-duo-gradient`. Every one must show a non-empty rule from `globals.css`. If any resolves empty, the port in Task 3 dropped that selector — fix and rerun build.

- [ ] **Step 4: Manual visual regression (eyeball) against pre-rename baseline**

  Still on `/` in the dev browser:
  1. Compare Hero (heading, gradient text, CTA buttons, floating product image, orbs) against the pre-Task-2 visual memory from Task 1 Step 5. Identical render expected — no colour shift, no missing glow, no broken neon border.
  2. Scroll to Products: each of the three product cards renders identically (HIS blue accents, HERS red, DUO gradient).
  3. Scroll to Testimonials: stars twinkle, gradient text intact.
  4. In DevTools, on the `<html>` element, add attribute `data-theme="light"`. Background must shift to a pale lavender (#F8F4FF), body text turns dark, but the HIS / HERS / DUO brand colours stay the same saturated blue / red / magenta. Remove the attribute to restore dark.
  5. Stop the dev server (`Ctrl+C`).

  If steps 1–3 show any visible difference vs the pre-rename baseline, the rename or port introduced a bug — diff `globals.css` against `git show HEAD:src/app/globals.css` to locate the regression before continuing.

- [ ] **Step 5: Stage and commit on branch `feat/shopify-store-build`**

  Confirm the current branch first:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets" && git branch --show-current
  ```

  Expected output: `feat/shopify-store-build`. If not, run `git checkout feat/shopify-store-build` first.

  Then stage and commit:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets" && \
  git add src/app/globals.css docs/design/drift-check.md && \
  git commit -m "$(cat <<'EOF'
  feat(design): SP-0 mirror canonical CSS, drop --ss- prefix, port component classes

  - Rename all --ss-* tokens to unprefixed canonical names (--bg, --text-1,
    --duo-gradient, etc.) and import the full canonical dark-theme token block
    (surfaces, shadows, gradient shells, ambient).
  - Port canonical component classes verbatim: .btn-ss / .btn-ss-{duo,his,hers,
    ghost,sm,lg}; .card-ss / .card-ss-{his,hers}; .neon-card-outer-ss /
    .neon-card-inner-ss + @keyframes neonChase; .badge-ss / .badge-ss-{duo,his,
    hers,warn,neutral}; .ss-orb / .ss-orb-{his,hers}; .text-{duo-gradient,his,
    hers,duo}; .ss-nav / .ss-nav-brand.
  - Add [data-theme="light"] neutrals-only override (brand colours constant).
  - Preserve project divergences: the smoother @property --neon-angle
    .neon-card-outer / .neon-card-inner and the Tailwind v4 @theme inline block.
  - Document divergences inline at top of globals.css and add docs/design/
    drift-check.md as the manual pull runbook.

  Unblocks SP-3 (shop UI) which leans on these component classes.
  EOF
  )"
  ```

  **No `Co-Authored-By` trailer.** Michael's standing rule.

- [ ] **Step 6: Verify the commit landed cleanly on the right branch**

  Run:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets" && git log -1 --format='%h %s%n%b' && git status --short
  ```

  Expected output:
  - `git log -1` shows the SP-0 commit subject with the short hash; the body lists the bullets from Step 5; **no `Co-Authored-By` line anywhere**.
  - `git status --short` shows no `M  src/app/globals.css` and no untracked `docs/design/drift-check.md` — both committed. Other unrelated working-tree changes from before SP-0 (e.g. `M src/components/sections/*.tsx` listed at session start) remain untouched and still appear in `git status`.

  If `Co-Authored-By` appears anywhere in `git log -1`, immediately:
  ```bash
  cd "/Users/mrb/LocalDev/NextJS/Sensual Sweets/sensual-sweets" && git commit --amend -m "$(cat <<'EOF'
  feat(design): SP-0 mirror canonical CSS, drop --ss- prefix, port component classes

  - Rename all --ss-* tokens to unprefixed canonical names (--bg, --text-1,
    --duo-gradient, etc.) and import the full canonical dark-theme token block
    (surfaces, shadows, gradient shells, ambient).
  - Port canonical component classes verbatim: .btn-ss / .btn-ss-{duo,his,hers,
    ghost,sm,lg}; .card-ss / .card-ss-{his,hers}; .neon-card-outer-ss /
    .neon-card-inner-ss + @keyframes neonChase; .badge-ss / .badge-ss-{duo,his,
    hers,warn,neutral}; .ss-orb / .ss-orb-{his,hers}; .text-{duo-gradient,his,
    hers,duo}; .ss-nav / .ss-nav-brand.
  - Add [data-theme="light"] neutrals-only override (brand colours constant).
  - Preserve project divergences: the smoother @property --neon-angle
    .neon-card-outer / .neon-card-inner and the Tailwind v4 @theme inline block.
  - Document divergences inline at top of globals.css and add docs/design/
    drift-check.md as the manual pull runbook.

  Unblocks SP-3 (shop UI) which leans on these component classes.
  EOF
  )"
  ```

  This re-authors the commit message without the trailer. Re-verify with `git log -1`.

---

## Acceptance criteria (mirror of spec; tick all before declaring SP-0 done)

- [ ] Zero `--ss-` substrings in `src/app/globals.css` and `src/components/**` (verified in Task 6 Step 1).
- [ ] All canonical component classes (`.btn-ss*`, `.card-ss*`, `.badge-ss*`, `.ss-nav*`, `.ss-orb*`, `.text-*`, `.neon-card-outer-ss`, `.neon-card-inner-ss`) resolve in DevTools (Task 6 Step 3).
- [ ] `[data-theme="light"]` block present; manually setting `<html data-theme="light">` flips neutrals without breaking brand colours (Task 6 Step 4).
- [ ] `npm run build` passes with no Tailwind warnings (Task 6 Step 2).
- [ ] Visual regression: Hero, Products, Testimonials render identically to pre-rename baseline (Task 6 Step 4).
- [ ] `docs/design/drift-check.md` exists and documents the two locked divergences (Task 5).
- [ ] Commit landed on `feat/shopify-store-build` with no `Co-Authored-By` trailer (Task 6 Step 6).
