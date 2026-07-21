/**
 * What Storybook's props table will actually show, computed offline.
 *
 * Storybook reads props through react-docgen-typescript (see .storybook/main.ts). This
 * runs the SAME parser with the SAME options, so the output is what the docs page renders
 * — without querying the running server, which is neither reliable nor free.
 *
 * Two failure modes it catches, both invisible when browsing the docs by hand:
 *   - a component whose props table is EMPTY (docgen could not resolve its type)
 *   - one of OUR props with no description (it shows up bare, so nobody knows what it does)
 *
 * "Ours" means declared in src/, as opposed to inherited from Radix. Radix props are part
 * of the API and are shown, but Radix does not describe most of them and we are not going
 * to write its documentation — flagging them would drown the signal.
 *
 * Usage:  bun run docs:audit          list everything, exit 1 if anything is bare
 *         bun run docs:audit --quiet  only the problems
 */
import { withCustomConfig } from "react-docgen-typescript";
import { readdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const COMPONENTS = path.join(ROOT, "src/components");
const quiet = process.argv.includes("--quiet");

// Keep in sync with `typescript.reactDocgenTypescriptOptions` in .storybook/main.ts.
const parser = withCustomConfig(path.join(ROOT, "tsconfig.json"), {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: (prop) => {
    if (prop.name === "className") return true;
    const from = prop.parent?.fileName;
    if (!from) return true;
    return !from.includes("@types/react");
  },
});

const files = readdirSync(COMPONENTS)
  .filter((f) => f.endsWith(".tsx") && !f.endsWith(".stories.tsx"))
  .map((f) => path.join(COMPONENTS, f));

const rows = [];
const notes = [];
for (const file of files) {
  let docs = [];
  try {
    docs = parser.parse(file);
  } catch (err) {
    rows.push({ file, name: "—", props: 0, ours: 0, bare: [], error: String(err.message ?? err) });
    continue;
  }
  if (docs.length === 0) {
    // Common and harmless: a component that takes no props at all resolves to nothing.
    // Worth listing, not worth failing on.
    notes.push(`${path.basename(file)} — no props resolved (a component with no props?)`);
    continue;
  }
  for (const doc of docs) {
    // docgen also picks up plain functions, hooks and inherited React class methods.
    // Only PascalCase names that are not lifecycle hooks are components.
    if (!/^[A-Z]/.test(doc.displayName) || /^component[A-Z]/.test(doc.displayName)) continue;

    const props = Object.values(doc.props ?? {});
    // A prop is ours when it is declared in this repo — not inherited from a dependency.
    // Conservative on purpose: a prop we declare always resolves to a file in src/. When
    // docgen cannot attribute a prop at all (Radix's `asChild` is the usual case), it is
    // not ours to document.
    const ours = props.filter((p) => {
      const from = p.parent?.fileName;
      return Boolean(from) && from.includes("/src/") && !from.includes("node_modules");
    });
    const bare = ours.filter((p) => !p.description?.trim()).map((p) => p.name);
    rows.push({
      file,
      name: doc.displayName,
      props: props.length,
      ours: ours.length,
      bare,
      error: null,
    });
  }
}

// A component with no props at all is fine — nothing to describe. What is not fine is a
// component whose type docgen could not resolve, and any own prop left bare.
const problems = rows.filter((r) => r.error || r.bare.length > 0);

if (!quiet) {
  console.log(
    `${"component".padEnd(28)}${"props".padStart(6)}${"ours".padStart(6)}${"bare".padStart(6)}  file`,
  );
  for (const r of rows.sort((a, b) => b.bare.length - a.bare.length)) {
    const mark = r.error ? "??" : r.bare.length ? "!!" : "OK";
    console.log(
      `${mark} ${r.name.padEnd(25)}${String(r.props).padStart(6)}${String(r.ours).padStart(6)}${String(r.bare.length).padStart(6)}  ${path.basename(r.file)}`,
    );
  }
  console.log("");
}

for (const n of notes) console.log(`· ${n}`);

for (const r of problems) {
  if (r.error) {
    console.log(`✗ ${path.basename(r.file)} — ${r.error}`);
  } else {
    console.log(`✗ ${r.name} (${path.basename(r.file)}) — undocumented: ${r.bare.join(", ")}`);
  }
}

console.log(
  `\n${rows.length} components · ${problems.length} with an undocumented own prop or an unresolved type`,
);
process.exit(problems.length > 0 ? 1 : 0);
