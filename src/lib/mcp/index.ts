import { defineMcp } from "@lovable.dev/mcp-js";
import listBudgetCategories from "./tools/list-budget-categories";
import getBudgetCategory from "./tools/get-budget-category";
import listTransactions from "./tools/list-transactions";
import getEnergyStatus from "./tools/get-energy-status";
import listRooms from "./tools/list-rooms";

export default defineMcp({
  name: "maison-mcp",
  title: "Maison MCP",
  version: "0.1.0",
  instructions:
    "Read-only tools for this Maison cockpit: browse Budget categories and transactions, inspect the Énergie snapshot, and list rooms. All data is mocked in-memory.",
  tools: [listBudgetCategories, getBudgetCategory, listTransactions, getEnergyStatus, listRooms],
});
