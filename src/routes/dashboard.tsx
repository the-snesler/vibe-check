import { Hono } from "hono";
import { csrf } from "hono/csrf";
import type { AppEnv } from "../lib/types";
import { requireAuth } from "../middleware/session";
import {
  getUserById,
  regenerateApiKey,
  regenerateOverlandToken,
} from "../db/queries";
import { generateApiKey, generateOverlandToken } from "../lib/tokens";

const dashboard = new Hono<AppEnv>();

dashboard.use("*", requireAuth);
dashboard.use(
  "*",
  csrf({ origin: (origin) => origin.endsWith("samnesler.com") || origin.includes("localhost") })
);

dashboard.get("/", async (c) => {
  const userId = c.get("userId");
  const user = await getUserById(c.env.DB, userId);
  if (!user) {
    return c.redirect("/");
  }

  const overlandEndpoint = `https://status.samnesler.com/api/overland/${user.id}`;
  const statusEndpoint = `https://status.samnesler.com/api/status/${user.api_key}`;

  return c.render(
    <div class="max-w-2xl mx-auto px-4 py-8">
      <header class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold">Status Dashboard</h1>
        <div class="flex items-center gap-3">
          {user.picture_url && (
            <img
              src={user.picture_url}
              alt=""
              class="w-8 h-8 rounded-full"
              referrerpolicy="no-referrer"
            />
          )}
          <span class="text-sm text-gray-600">{user.name}</span>
          <form method="post" action="/auth/logout">
            <button
              type="submit"
              class="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <section class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold mb-2">Your Status API</h2>
        <p class="text-sm text-gray-600 mb-3">
          Share this URL with AI assistants or anyone who needs your live
          status:
        </p>
        <div class="bg-gray-50 rounded p-3 font-mono text-sm break-all mb-4">
          {statusEndpoint}
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">API Key:</span>
          <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
            {user.api_key}
          </code>
          <form
            method="post"
            action="/dashboard/regenerate-api-key"
            class="inline"
          >
            <button
              type="submit"
              class="text-sm text-red-600 hover:text-red-800 underline"
              onclick="return confirm('Regenerate API key? Existing integrations will break.')"
            >
              Regenerate
            </button>
          </form>
        </div>
      </section>

      <section class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold mb-2">Overland GPS Tracking</h2>
        <p class="text-sm text-gray-600 mb-3">
          Configure the{" "}
          <a
            href="https://overland.p3k.app/"
            class="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener"
          >
            Overland iOS app
          </a>{" "}
          with these settings:
        </p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Endpoint URL
          </label>
          <div class="bg-gray-50 rounded p-3 font-mono text-sm break-all">
            {overlandEndpoint}
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Token (paste into Overland's "Access Token" field)
          </label>
          <div class="flex items-center gap-3">
            <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono break-all">
              {user.overland_token}
            </code>
            <form
              method="post"
              action="/dashboard/regenerate-overland-token"
              class="inline shrink-0"
            >
              <button
                type="submit"
                class="text-sm text-red-600 hover:text-red-800 underline"
                onclick="return confirm('Regenerate Overland token? Update the Overland app with the new token.')"
              >
                Regenerate
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* TODO: Phase 2 - Discord integration section */}
      {/* TODO: Phase 2 - Privacy controls section */}
    </div>
  );
});

dashboard.post("/regenerate-api-key", async (c) => {
  const userId = c.get("userId");
  await regenerateApiKey(c.env.DB, userId, generateApiKey());
  return c.redirect("/dashboard");
});

dashboard.post("/regenerate-overland-token", async (c) => {
  const userId = c.get("userId");
  await regenerateOverlandToken(c.env.DB, userId, generateOverlandToken());
  return c.redirect("/dashboard");
});

export default dashboard;
