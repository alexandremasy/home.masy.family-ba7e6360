import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_transactions",
  title: "List transactions",
  description:
    "List seed transactions, optionally filtered by category key and/or a case-insensitive text query on the label.",
  inputSchema: {
    category: z.string().optional().describe("Optional category key filter."),
    query: z.string().optional().describe("Optional case-insensitive substring to match on the label."),
    limit: z.number().int().min(1).max(500).optional().describe("Max rows to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, query, limit }) => {
    const { transactionsSeed } = await import("@/lib/budget-data");
    const q = query?.toLowerCase();
    const rows = transactionsSeed
      .filter((t) => (category ? t.category === category : true))
      .filter((t) => (q ? t.label.toLowerCase().includes(q) : true))
      .slice(0, limit ?? 50);
    return {
      content: [{ type: "text", text: `${rows.length} transaction(s) trouvée(s).` }],
      structuredContent: { count: rows.length, transactions: rows },
    };
  },
});
