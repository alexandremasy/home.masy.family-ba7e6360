# Project memory — mockup.masy.family

<!-- one line per memory file -->
- [Live access & brief workflow](live-access-and-brief-workflow.md) — to SEE the live render: Playwright container on the proxy net → screenshots the mockup container internally (bypasses Traefik auth) → Read the PNGs. "Brief à Lovable" = a prompt, not the *-BRIEF.md handoffs.
- [Dashboard layout conventions](dashboard-layout-conventions.md) — the bento unit is col-span-2 (col-span-1 = half a cell); a "mode" is full-bleed with its tabs in the TopNav, everything else is an overlay that covers it. Sécurité is now a mode.
- [PageHeader bleed gotcha](pageheader-bleed-gotcha.md) — PageHeader's negative margins must match the shell's padding (`variant="page"` when full-bleed) or the page scrolls sideways below ~1440px.
- [Mock data is not the brief](mock-data-is-not-the-brief.md) — mock-data.ts mixes Alex's real household with Lovable filler (Sam, Léa, the garage door are INVENTED). FOYER-BRIEF.md is cited in CLAUDE.md but missing — ask Alex about the household, never infer it.
- [Home OS vision](home-os-vision.md) — the reframe: this is a unified "home OS" (console + wall touchscreens + TV), not a HA dashboard. Emotion = a calm presence that knows (aurora + liquid glass, ambience on surface / admin in depth).
- [Dashboard design direction](dashboard-design-direction.md) — tactical layer under the vision: attention-first home, living module access, navigation by module (Accueil = default).
