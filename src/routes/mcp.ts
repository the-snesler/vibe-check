import { Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { z } from "zod";
import type { AppEnv, PrivacySettings } from "../lib/types";
import { DEFAULT_PRIVACY_SETTINGS } from "../lib/types";
import { getUserByApiKey } from "../db/queries";
import { fetchLanyardPresence } from "../lib/lanyard";
import { applyPrivacy } from "../lib/privacy";

// Module-level env reference — safe because Workers handle one request at a time
let currentEnv: AppEnv["Bindings"];

const mcpServer = new McpServer(
  { name: "status-endpoint", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

mcpServer.registerTool(
  "get_status",
  {
    description: "Get a user's current live status including GPS location and Discord presence",
    inputSchema: { api_key: z.string().describe("The user's API key (starts with sk_)") },
  },
  async ({ api_key }) => {
    const user = await getUserByApiKey(currentEnv.DB, api_key);
    if (!user) {
      return {
        content: [{ type: "text" as const, text: '{"ok":false,"error":"Invalid API key"}' }],
        isError: true,
      };
    }

    const privacySettings: PrivacySettings = user.privacy_settings
      ? JSON.parse(user.privacy_settings)
      : DEFAULT_PRIVACY_SETTINGS;

    const locationJson = await currentEnv.STATUS_KV.get(`location:${user.id}`);
    let location = null;
    let dataAgeSeconds = null;

    if (locationJson) {
      const raw = JSON.parse(locationJson);
      location = applyPrivacy(raw, privacySettings);
      if (location) {
        dataAgeSeconds = Math.round(
          (Date.now() - new Date(raw.timestamp).getTime()) / 1000
        );
      }
    }

    const discord = user.discord_id
      ? await fetchLanyardPresence(user.discord_id)
      : null;

    const result = {
      ok: true,
      user: { name: user.name },
      location,
      discord,
      _meta: {
        generated_at: new Date().toISOString(),
        data_age_seconds: dataAgeSeconds,
      },
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

const transport = new StreamableHTTPTransport({ enableJsonResponse: true });

const mcp = new Hono<AppEnv>();

mcp.all("/*", async (c) => {
  currentEnv = c.env;
  if (!mcpServer.isConnected()) {
    await mcpServer.connect(transport);
  }
  const response = await transport.handleRequest(c);
  return response ?? c.text("Method not allowed", 405);
});

export default mcp;
