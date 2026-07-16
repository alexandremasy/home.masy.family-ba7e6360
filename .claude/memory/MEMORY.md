# Project memory — mockup.masy.family

<!-- one line per memory file -->
- [Nav is a collapsed sidebar](nav-is-collapsed-sidebar.md) — navigation is a collapsed shadcn sidebar (UniFi-style icon rail, mode switcher in the header), NOT a top bar. TopNav/ModeSwitcher deleted; --nav-h now 56px.
- [Live access & brief workflow](live-access-and-brief-workflow.md) — to SEE the live render: Playwright container on the proxy net → screenshots the mockup container internally (bypasses Traefik auth) → Read the PNGs. "Brief à Lovable" = a prompt, not the *-BRIEF.md handoffs.
- [Dashboard layout conventions](dashboard-layout-conventions.md) — the bento unit is col-span-2 (col-span-1 = half a cell); a "mode" is full-bleed with its tabs in the TopNav, everything else is an overlay that covers it. Sécurité is now a mode.
- [Commit as you go](commit-as-you-go.md) — commit + push continuously, and distrust the auto-commit hook: it only fires on Write/Edit, so sed/python/`git mv` changes escape it — that is how origin/main got pushed broken.
- [Design system state](design-system-state.md) — shadcn/ui IS the system and the refactor landed: use it, edit `ui/*` when it fights the palette, never build a sibling. The type scale, the FR/EN split, and why a red lint isn't your regression.
- [Palette semantics](palette-semantics.md) — `warm` is the ALERT tone (never a plain highlight), `primary` teal is the positive signal; `accent`/`warm` foregrounds are dark in both themes and only work on a solid fill.
- [PageHeader bleed gotcha](pageheader-bleed-gotcha.md) — PageHeader's negative margins must match the shell's padding (`variant="page"` when full-bleed) or the page scrolls sideways below ~1440px.
- [Mock data is not the brief](mock-data-is-not-the-brief.md) — mock-data.ts mixes Alex's real household with Lovable filler (Sam, Léa, the garage door are INVENTED). FOYER-BRIEF.md is cited in CLAUDE.md but missing — ask Alex about the household, never infer it.
- [Home OS vision](home-os-vision.md) — the reframe: this is a unified "home OS" (console + wall touchscreens + TV), not a HA dashboard. Emotion = a calm presence that knows (aurora + liquid glass, ambience on surface / admin in depth).
- [Dashboard design direction](dashboard-design-direction.md) — tactical layer under the vision: attention-first home, living module access, navigation by module (Accueil = default).
- [Figma tokens source](figma-tokens-source.md) — Figma is a one-way REFERENCE, not linked to the code: consult it before inventing a token, nothing flows back. The code is the source of truth.
- [Mockup stays exploration](mockup-stays-exploration.md) — deliberate call (2026-07-16): keep every domain on the mock, wire nothing to api/cockpit yet. Graduate a domain only when Alex says it stopped changing.
- [Don't stack grey on light](dont-stack-grey-on-light.md) — the light page is already soft-grey; don't add bg-secondary/muted fills on it. Elements take the page colour; reserve white (bg-card) for the active zone.
- [Mirror sibling patterns](mirror-sibling-patterns.md) — before inventing any UI construct, copy the route/component that already does it: routed tabs → /repas, forms → DishForm, edit pages → dish $dishId (delete behind AlertDialog). The system includes composition patterns, not just ui/* primitives.
