#!/usr/bin/env bun
// ensure-proxied.mjs — makes this mockup dev server survive Lovable syncs.
//
// Lovable REGENERATES vite.config.ts on every sync and strips the block that
// lets the app be served behind Traefik (allowedHosts + wss HMR). Without it,
// mockup.masy.family answers "Blocked request" and HMR never connects.
//
// This script runs at container boot BEFORE vite (see the `mockup` service in
// /opt/apps/docker-compose.yaml). Idempotent: if the block is already present it
// does nothing; otherwise it re-injects it into the `vite: { ... }` object of the
// Lovable defineConfig.
//
// NOTE: it lives INSIDE the repo, so a Lovable sync could in theory delete it.
// It is committed (restore with git), and the boot command tolerates its absence
// (logs and starts vite anyway — degrading to the old "Blocked request").
//
//   usage: bun scripts/ensure-proxied.mjs <path/to/vite.config.ts>
import { readFileSync, writeFileSync } from "node:fs";

const target = process.argv[2];
if (!target) {
  console.error("[ensure-proxied] usage: ensure-proxied.mjs <path/to/vite.config.ts>");
  process.exit(1);
}

let src;
try {
  src = readFileSync(target, "utf8");
} catch (e) {
  console.error(`[ensure-proxied] cannot read ${target}: ${e.message}`);
  process.exit(1); // the config is genuinely missing — vite would fail anyway
}

// Already patched (either Lovable didn't strip it, or a previous boot injected
// it). The marker is the env flag name, which only appears in our block.
if (src.includes("VITE_PROXIED")) {
  console.log("[ensure-proxied] block present — nothing to do");
  process.exit(0);
}

const BLOCK = `
    // [ensure-proxied] Auto-injected at container boot. Lovable regenerates this
    // file and strips this block; source of truth is scripts/ensure-proxied.mjs.
    // Serves mockup.masy.family behind Traefik: accept the host + route HMR wss:443.
    ...(process.env.VITE_PROXIED
      ? {
          server: {
            allowedHosts: ["mockup.masy.family"],
            hmr: { protocol: "wss", clientPort: 443 },
          },
        }
      : {}),`;

// Insert right after the `vite: {` opening of the config object. Anchor to the
// start of a line (^ + only leading whitespace) so we skip the `vite: {` that
// appears inside Lovable's header COMMENT ("...defineConfig({ vite: { ... } })").
const m = src.match(/^[ \t]*vite\s*:\s*\{/m);
if (!m) {
  console.error(
    "[ensure-proxied] ⚠ no `vite: {` block found in " + target + "\n" +
    "[ensure-proxied] ⚠ mockup.masy.family will answer 'Blocked request'.\n" +
    "[ensure-proxied] ⚠ Lovable changed the config shape — update scripts/ensure-proxied.mjs.",
  );
  process.exit(0); // surface loudly, but never block the dev server from booting
}

const at = m.index + m[0].length;
writeFileSync(target, src.slice(0, at) + BLOCK + src.slice(at));
console.log("[ensure-proxied] injected VITE_PROXIED block into " + target);
