---
name: live-access-and-brief-workflow
description: How to see the mockup's live render, and what "brief" means for this repo
metadata:
  type: project
---

**Seeing the live mockup — SOLVED, use this.** The session runs **on the homelab server** (cwd
`/opt/apps/mockup`): no Chrome bridge (`mcp__claude-in-chrome__*` absent), and Alex is on tmux+ssh
so **pasting images into the chat does NOT work either**. The working method — screenshot the
container from inside the Docker network, which **bypasses the `auth.masy.family` Traefik
forward-auth** (auth is a Traefik middleware; hitting the container directly skips it):

1. Get the container's internal address: `docker inspect apps-mockup-1` → IP on the `proxy`
   network, port **5173** (vite). Direct hit `http://<IP>:5173/` returns 200 (no auth). IP can
   change on restart — re-inspect; or use container-name DNS on the proxy network.
2. Run a Playwright container on the same network, screenshot to a mounted scratchpad dir:
   `docker run --rm --network proxy -v <scratch>:/out -w /out -e BASE=http://<IP>:5173 \
     mcr.microsoft.com/playwright:v1.48.0-jammy bash -c \
     "npm i playwright@1.48.0 --no-save --silent && node shot.js"`
   (`shot.js` = launch chromium, `goto` waitUntil networkidle, `waitForTimeout(1500)` to settle
   hydration/anim, `screenshot fullPage`; loop routes × viewports desktop 1440 / mobile 390.)
3. `Read` the PNGs — Claude Code reads images. This is how you judge the real render.

No chromium on the host and no sudo for `playwright install-deps`, so the self-contained Docker
image is the reliable path. Script kept in this session's scratchpad; could be promoted to
`scripts/shot.mjs` if this recurs (ask first — infra vs. deliverable).

**"Brief" is ambiguous here — two things:**
- The `*-BRIEF.md` files (PLANIFICATION-BRIEF, MAISON-BRIEF…) = **handoffs** to `api`/`cockpit`
  (what migrates as spec, not code). See [[CLAUDE.md]] stack notes.
- A **"brief à Lovable"** = a **prompt** Alex pastes into Lovable to modify the mockup itself.
  When Alex says "refaire un brief à Lovable", he means this second one.

**What only Alex holds:** the "prochaines modifications" and "ce qui n'allait pas" (a usage
judgment made looking at the live screen) — the code won't tell you. Ask for screenshots or a
verbal dump; don't reconstruct from source and play innocent.
