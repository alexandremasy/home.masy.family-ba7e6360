---
name: mockup-stays-exploration
description: Deliberate call (2026-07-16) — keep everything in the mockup, do NOT wire any domain to api/cockpit yet
metadata:
  type: project
---

Asked directly whether to start syncing a domain to the real API-connected project,
Alex chose to **keep all domains on the mockup** and wire nothing yet — Repas
included: *"je découvre encore"*.

**Why:** while the model is still moving, the mockup is where iteration is free — one
edit, no migration, no API. Alex works upstream and explores before he freezes;
premature wiring trades that speed for lock-in he doesn't want yet.

**How to apply:** don't pitch "let's build this for real in api/cockpit" as a default.
Keep evolving the mock. The trigger to graduate a domain is Alex signalling that *that
one* domain has stopped changing — then port just it (brief → api data layer →
cockpit rebuilt by hand), not the whole app. Watch for the drift he flagged himself:
the mock grows and the gap with the real project widens. Surface that at a lull, once,
not as a nag.

Handoff mechanics when a domain does graduate live in the stack's CLAUDE.md and the
`*-BRIEF.md` files. See [[design-system-state]].
