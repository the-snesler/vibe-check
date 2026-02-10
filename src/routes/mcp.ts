import { Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { z } from "zod";
import type { AppEnv } from "../lib/types";
import { fetchUserStatus } from "./status";

// Module-level env reference — safe because Workers handle one request at a time
let currentEnv: AppEnv["Bindings"];
let api_key: string;

const mcpServer = new McpServer(
  { name: "status-endpoint", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

mcpServer.registerTool(
  "get_status",
  {
    description: "Get a user's current live status including GPS location and Discord presence",
  },
  async () => {
    const result = await fetchUserStatus(api_key, currentEnv);
    return { content: [{type: "text" as const, text: JSON.stringify(result, null, 2)}], isError: !result.ok };
  }
);

const transport = new StreamableHTTPTransport({ enableJsonResponse: true });

const mcp = new Hono<AppEnv>();

mcp.all("/*", async (c) => {
  currentEnv = c.env;
  api_key = c.req.header("Authorization")?.replace("Bearer ", "") ?? "";
  if (!api_key) {
    return c.text("Unauthorized", 401);
  }
  if (!mcpServer.isConnected()) {
    await mcpServer.connect(transport);
  }
  const response = await transport.handleRequest(c);
  return response ?? c.text("Method not allowed", 405);
});

export default mcp;
