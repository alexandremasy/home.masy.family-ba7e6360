import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_budget_category",
  title: "Get budget category",
  description:
    "Return the detail (budget, actual, delta, sub-postes) for a single budget category by its key (e.g. 'logement', 'energie', 'alimentation').",
  inputSchema: {
    key: z
      .string()
      .min(1)
      .describe("Category key such as 'logement', 'energie', 'transport', 'alimentation', etc."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ key }) => {
    const { categories } = await import("@/lib/budget-data");
    const c = categories.find((x) => x.key === key.toLowerCase());
    if (!c) {
      return {
        content: [
          {
            type: "text",
            text: `Unknown category '${key}'. Available: ${categories.map((x) => x.key).join(", ")}.`,
          },
        ],
        isError: true,
      };
    }
    const data = {
      key: c.key,
      label: c.label,
      budget_eur: c.budget,
      actual_eur: c.actual,
      delta_eur: c.actual - c.budget,
      subs: c.subs.map((s) => ({ label: s.label, actual_eur: s.actual })),
    };
    return {
      content: [
        {
          type: "text",
          text: `${c.label}: budget ${c.budget} € · réel ${c.actual} € · écart ${c.actual - c.budget} €.`,
        },
      ],
      structuredContent: data,
    };
  },
});
