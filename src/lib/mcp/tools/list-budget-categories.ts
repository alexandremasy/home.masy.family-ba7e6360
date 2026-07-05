import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_budget_categories",
  title: "List budget categories",
  description:
    "List every budget category for the current period, with the budgeted amount, the actual spend, the delta, and the sub-postes breakdown.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { categories } = await import("@/lib/budget-data");
    const rows = categories.map((c) => ({
      key: c.key,
      label: c.label,
      budget_eur: c.budget,
      actual_eur: c.actual,
      delta_eur: c.actual - c.budget,
      subs: c.subs.map((s) => ({ label: s.label, actual_eur: s.actual })),
    }));
    const totals = rows.reduce(
      (acc, r) => ({ budget: acc.budget + r.budget_eur, actual: acc.actual + r.actual_eur }),
      { budget: 0, actual: 0 },
    );
    const summary =
      `Budget total: ${totals.budget} € · Réel: ${totals.actual} € · ` +
      `Écart: ${totals.actual - totals.budget} € (${rows.length} catégories).`;
    return {
      content: [{ type: "text", text: summary }],
      structuredContent: { totals, categories: rows },
    };
  },
});

// keep zod import used (harmless) so future edits can add validation
void z;
