---
name: commit-as-you-go
description: Commit and push as you go — and never trust the auto-commit hook, it only sees Write/Edit, not sed/python/git mv
metadata:
  type: feedback
---

Alex, 2026-07-15: *"Tu dois commiter au fil de l'eau. Fais ce qui te semble le mieux, en bon père
de famille."* — don't wait to be asked, and don't wait for the end of a session.

**Why:** the repo has a hook that auto-commits **and pushes** on `Write`/`Edit`, with a `sync: <file>`
message. It does NOT see files changed through `sed -i`, `python3` heredocs, `git mv` or `git rm`.

That asymmetry silently **broke `origin/main`**: the hook pushed the *renames* (staged by `git mv`)
without the *content edits* (done in `sed`) that went with them. Result on the remote: files named
`_app.repas.courses.tsx` still declaring `createFileRoute("/_app/maison/courses")` — file path ≠ route
id, which TanStack refuses. `_app.repas.plats.tsx` was never committed at all while its three
children were. `git status -sb` showed **0 ahead / 0 behind**, so nothing looked wrong.

**How to apply:**
- After any `sed`/`python`/`git mv` batch, run `git status` — the hook did not cover it.
- Commit in coherent groups (one concern each), in English, and push. No `Co-Authored-By` trailer
  (see the global CLAUDE.md).
- Before pushing a rename, verify the remote would still build:
  `for f in $(git ls-tree -r --name-only origin/main src/routes/); do` compare the basename with the
  `createFileRoute()` id inside.
