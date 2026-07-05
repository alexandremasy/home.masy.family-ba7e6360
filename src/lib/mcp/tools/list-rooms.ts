import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "list_rooms",
  title: "List rooms",
  description: "List every room in the Maison space with its key, label, and icon.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { rooms } = await import("@/lib/mock-data");
    const rows = rooms.map((r) => ({ key: r.key, name: r.name, icon: r.icon }));
    return {
      content: [{ type: "text", text: `${rows.length} pièce(s).` }],
      structuredContent: { rooms: rows },
    };
  },
});
