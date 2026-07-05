import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_energy_status",
  title: "Get energy status",
  description:
    "Return the current energy dashboard snapshot: last reading date, monthly-due flag, KPIs, and recent history.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { energie } = await import("@/lib/mock-data");
    return {
      content: [
        {
          type: "text",
          text: `Relevé le ${energie.lastReadingDate}. ${energie.monthlyDue ? "Un relevé mensuel est à saisir." : "À jour."}`,
        },
      ],
      structuredContent: energie,
    };
  },
});
