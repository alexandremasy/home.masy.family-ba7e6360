# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **throwaway design mockup** built in Lovable — a **frontend-only prototype with no
persistence** (all data is mocked in-memory). Its job is to validate UX + business
logic fast, then hand the model off to the real apps. It is **not** production and is
never wired to a real backend.

Stack: **TanStack Start** (SSR) + Vite + React 19 + Tailwind v4, served on Cloudflare
via `@cloudflare/vite-plugin`. SSR entry is redirected to `src/server.ts` (our error
wrapper) — see `vite.config.ts` and `wrangler.jsonc`.

## Where this fits (the stack)

This is one of three apps under `/opt/apps` — read `/opt/apps/CLAUDE.md` for the stack
overview. The relationship is what matters here:

- **`mockup` (this repo) — the exploration ground.** Prototype a domain's UI + logic
  with mocked data, lock it, then hand it off. It owns no data and ships nothing.
- **`api` (`/opt/apps/api`) — the real data layer.** When a mockup validates a domain,
  its persistence/business logic gets built for real here (the single write door to
  Postgres). Mocked shapes here become the OpenAPI contract there.
- **`cockpit` (`/opt/apps/cockpit`) — the real frontend.** Validated screens get
  **rebuilt by hand** in cockpit against the live `api` — the mockup is the exact
  visual/UX target, not code to copy.

So: what's proven here does not migrate as code. It migrates as a **brief** → `api`
gets the data layer, `cockpit` gets the UI. The `*-BRIEF.md` files at the root are
exactly those handoffs:

- `FOYER-BRIEF.md` — the household model (PM spec, WIP).
- `MAISON-BRIEF.md` — Maison domain: repas, courses, anniversaires.
- `PLANIFICATION-BRIEF.md` — budget Planification handoff (the data layer to build).

## Gotcha — Lovable regenerates `vite.config.ts`

Lovable overwrites this file on every sync. The `VITE_PROXIED` block (`allowedHosts:
["mockup.masy.family"]` + `wss`/443 HMR) must be **re-applied after each sync**, or
`mockup.masy.family` answers "Blocked request". The `@lovable.dev/vite-tanstack-config`
preset already bundles the core plugins — do NOT add tanstackStart/react/tailwind/etc.
manually or the app breaks on duplicate plugins.

## Run

Runs as the `mockup` service in the `/opt/apps` compose stack (bind-mount + vite HMR).
Locally:

```bash
bun install
bun run dev        # vite dev (SSR)
bun run lint       # eslint
```

First boot installs ~610 packages (~4 min) — normal.

## Project memory

Ongoing context lives in `.claude/memory/`.
