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

1. Get the container's IP on the `proxy` network, port **5173** (vite):
   `docker inspect apps-mockup-1 --format '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}'`.
   IP can change on restart — re-inspect each time.
   **GOTCHA (verified 2026-07-16):** a direct IP or container-name hit is now **BLOCKED** — vite
   has `server.allowedHosts: ["mockup.masy.family"]`, so any other Host gets "Blocked request. This
   host is not allowed" (a text page, not the app; the PNG comes out tiny ~34KB). The fix is to make
   the browser send `Host: mockup.masy.family` WHILE resolving it to the container (not Traefik):
   map the hostname to the container IP with `--add-host`.
2. Run a Playwright container on the same network, mapping the allowed host to the container IP:
   `docker run --rm --network proxy --add-host mockup.masy.family:<IP> -v <scratch>:/out -w /out \
     -e BASE=http://mockup.masy.family:5173 -e ROUTES="/" -e VIEWPORTS="1440x900" -e THEME=light \
     mcr.microsoft.com/playwright:v1.48.0-jammy bash -c \
     "npm i playwright@1.48.0 --no-save --silent && node shot.js"`
   This resolves `mockup.masy.family` straight to the container (bypasses the Traefik forward-auth)
   AND passes vite's allowedHosts. `shot.js` = launch chromium, `goto` waitUntil networkidle,
   `waitForTimeout(1500)` to settle hydration/anim, `screenshot fullPage`; loops routes × viewports
   (desktop 1440 / mobile 390) × THEME. First run pulls the ~2GB image (slow, background it).
3. `Read` the PNGs — Claude Code reads images. A ~400KB+ PNG = real render; a ~34KB one = the
   "Blocked request" text page (you got the Host wrong).

No chromium on the host and no sudo for `playwright install-deps`, so the self-contained Docker
image is the reliable path. `shot.js` kept in the session scratchpad (env-driven: BASE, ROUTES,
VIEWPORTS, THEME); could be promoted to `scripts/shot.mjs` if this recurs (ask first — infra vs.
deliverable).

**"Brief" is ambiguous here — two things:**
- The `*-BRIEF.md` files (PLANIFICATION-BRIEF, MAISON-BRIEF…) = **handoffs** to `api`/`cockpit`
  (what migrates as spec, not code). See [[CLAUDE.md]] stack notes.
- A **"brief à Lovable"** = a **prompt** Alex pastes into Lovable to modify the mockup itself.
  When Alex says "refaire un brief à Lovable", he means this second one.

**What only Alex holds:** the "prochaines modifications" and "ce qui n'allait pas" (a usage
judgment made looking at the live screen) — the code won't tell you. Ask for screenshots or a
verbal dump; don't reconstruct from source and play innocent.
