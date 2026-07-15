---
name: live-access-and-brief-workflow
description: How to see the mockup's live render, and what "brief" means for this repo
metadata:
  type: project
---

**Seeing the live mockup.** The mockup runs at `mockup.masy.family`, behind `auth.masy.family`
(Traefik forward-auth) — curl/WebFetch get a 302 to the auth portal, no content. Claude Code
sessions here run **on the homelab server** (cwd `/opt/apps/mockup`), so there is **no bridge to
Alex's local Chrome** — the `mcp__claude-in-chrome__*` browser tools are NOT available in this
session regardless of whether Alex's Chrome extension is on. Do not keep retrying the extension.
→ To judge the live render (visual/UX), the working path is **Alex pastes screenshots into the
chat** (drag & drop works, independent of the extension). Read the source for logic/state, but the
rendered look is only visible via his screenshots.

**"Brief" is ambiguous here — two things:**
- The `*-BRIEF.md` files (PLANIFICATION-BRIEF, MAISON-BRIEF…) = **handoffs** to `api`/`cockpit`
  (what migrates as spec, not code). See [[CLAUDE.md]] stack notes.
- A **"brief à Lovable"** = a **prompt** Alex pastes into Lovable to modify the mockup itself.
  When Alex says "refaire un brief à Lovable", he means this second one.

**What only Alex holds:** the "prochaines modifications" and "ce qui n'allait pas" (a usage
judgment made looking at the live screen) — the code won't tell you. Ask for screenshots or a
verbal dump; don't reconstruct from source and play innocent.
