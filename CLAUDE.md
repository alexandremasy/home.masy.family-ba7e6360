# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The **UI/UX source of truth** for the `masy.family` systems — the components, templates/blocks,
tokens, interaction patterns, and module **specs**. It is **hand-authored** (Lovable is retired)
and **frontend-only**: all data is mocked in-memory, no backend, never wired to real data.

It is **not** a throwaway prototype anymore. Design and interaction are decided here and figured
here; the real frontend (`cockpit`) consumes what this repo defines. Treat it like a product.

Stack: **plain Vite + React 19 + TanStack Router (SPA)** + Tailwind v4 + shadcn/ui — the **same
stack as `cockpit`**, so components/styles/assets copy-paste (and, eventually, import) cleanly.
No SSR, no Cloudflare.

## The canonical model (read `/opt/apps/CLAUDE.md` for the full picture)

- **Mockup (this repo) owns UI + UX**: tokens, `ui/` + composed components, templates/blocks,
  interaction patterns, and specs. All documented in Storybook (see below).
- **Cockpit orchestrates**: it *uses* these components + templates and adds the data-logic layer
  (TanStack Query vs `api`, cache/invalidation, HA real-time, derived state). A cockpit page = a
  template from here + its data wiring. **Never author a component in `cockpit`** — author it here.
- **Not everything here is meant to ship.** `routes/_app.securite.*` (état, périmètre, activité,
  réseau, caméras) is design exploration: there is no api domain behind it and the cockpit has a
  small `réseau` page instead. It stays here until it is decided — do not port it.
- End-state: extract the shared foundation (tokens + `ui/` + components + templates) into a
  **package** the cockpit imports (deferred until the first real domain is rebuilt in cockpit).
  Until then, mockup-canonical copy-paste. `/sync-mockup` is the codified migration path.

## Storybook — the living design system

Published to **`design.masy.family`** (the `mockup-storybook` compose service, Storybook dev on
port 6006). It documents **Tokens** (read live from `src/styles.css`), **UI** primitives,
composed **Components**, **Blocks**, and co-located **Specs** (MDX). `@storybook/addon-mcp`
exposes the design system to coding agents (component context + reuse enforcement) — the bridge
that lets the cockpit rebuild reuse canonical components instead of reinventing them. Stories are
colocated with each component (`*.stories.tsx`); token pages + specs live under `src/design-system/`.

> The old in-app `/design-system` route is **retired** — Storybook supersedes it.

**The docs have to be trustworthy, not just present.** Props are parsed with
`react-docgen-typescript` (`.storybook/main.ts`) — the default JS parser cannot resolve
`ComponentPropsWithoutRef<typeof Primitive.Root> & VariantProps<...>`, which is how every
Radix-based control here is typed, and silently documents nothing. `bun run docs:audit`
runs that same parser offline and fails on a prop of ours left undescribed or a component
whose type did not resolve. Every prop we add carries a JSDoc line; Radix's own props are
shown but not ours to describe. It is part of `bun run check`, not a commit hook — it takes
~25 s.

## Run

```bash
bun install
bun run dev             # vite dev (SPA)
bun run check           # lint + typecheck + docs audit — run before calling work done
bun run lint            # eslint (prettier-clean required)
bun run docs:audit      # what Storybook's props table will really show
bun run format          # prettier --write
bun run storybook       # storybook dev :6006
bun run build-storybook # static build
```

`vite.config.ts` bakes the `VITE_PROXIED` block (allowedHosts + `wss:443` HMR) so the app serves
behind Traefik at `mockup.masy.family`; Storybook re-asserts it in `.storybook/main.ts` `viteFinal`.
Docs/memory are excluded from prettier (`.prettierignore`); `storybook-static` is gitignored.

## Language — French product, English code

The product UI is **French** (a French household's dashboard): "Repas", "Anniversaires", routes
`/repas`, `/courses`. Identifiers derived from those inherit it and that's fine. **Everything else
is English**: comments, docs, commit messages, Storybook story identifiers/titles.

## Design system

`DESIGN-SYSTEM.md` is the written record: **shadcn/ui is the system, not an option** — one token
layer (CSS vars in `src/styles.css`), customize `src/components/ui/*` in place, never build a
sibling. Storybook renders the tokens and components live.

## Project memory

Ongoing context lives in `.claude/memory/`.
