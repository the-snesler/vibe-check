import { Hono } from "hono";
import { csrf } from "hono/csrf";
import type { AppEnv, PrivacySettings, StoredLocation } from "../lib/types";
import { DEFAULT_PRIVACY_SETTINGS } from "../lib/types";
import { requireAuth } from "../middleware/session";
import {
  getUserById,
  regenerateApiKey,
  regenerateOverlandToken,
  updateDiscordId,
  updatePrivacySettings,
} from "../db/queries";
import { generateApiKey, generateOverlandToken } from "../lib/tokens";

const dashboard = new Hono<AppEnv>();

dashboard.use("*", requireAuth);
dashboard.use(
  "*",
  csrf({
    origin: (origin) =>
      origin.endsWith("tsuni.dev") || origin.includes("localhost"),
  }),
);

dashboard.get("/", async (c) => {
  const userId = c.get("userId");
  const user = await getUserById(c.env.DB, userId);
  if (!user) {
    return c.redirect("/");
  }

  const privacySettings: PrivacySettings = user.privacy_settings
    ? JSON.parse(user.privacy_settings)
    : DEFAULT_PRIVACY_SETTINGS;

  const overlandEndpoint = `${c.req.url.split('/dashboard')[0]}/api/overland/${user.id}`;
  const statusEndpoint = `${c.req.url.split('/dashboard')[0]}/api/status/${user.api_key}`;
  const mcpEndpoint = `${c.req.url.split('/dashboard')[0]}/mcp`;
  const overlandSetupUrl = `overland://setup?url=${encodeURIComponent(overlandEndpoint)}&token=${encodeURIComponent(user.overland_token)}&device_id=1&unique_id=yes`;
  const locationJson = await c.env.STATUS_KV.get(`location:${user.id}`);
  const overlandUpdateText = buildUpdateText(locationJson);

  return c.render(
    <div class="min-h-screen bg-blueprint text-gray-900">
      <div class="max-w-2xl mx-auto px-4 py-8">
        <header class="flex items-center justify-between mb-8">
          <h1 class="text-2xl font-bold text-white">Vibe Check Dashboard</h1>
          <div class="flex items-center gap-3">
            {user.picture_url && (
              <img
                src={user.picture_url}
                alt=""
                class="w-8 h-8 rounded-full"
                referrerpolicy="no-referrer"
              />
            )}
            <span class="text-sm text-gray-300">{user.name}</span>
            <form method="post" action="/auth/logout">
              <button
                type="submit"
                class="text-sm text-gray-400 hover:text-gray-200 underline"
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        <section class="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 class="text-lg font-semibold mb-2 text-white">Step 1: Overland GPS Tracking</h2>
          <p class="text-sm text-gray-300 mb-3">
            Download and configure the{" "}
            <a
              href="https://overland.p3k.app/"
              class="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener"
            >
              Overland iOS app
            </a>{" "}
            with these settings:
          </p>

          <div class="mb-4">
            <a
              href={overlandSetupUrl}
              class="inline-block bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              Open in Overland
            </a>
            <p class="text-xs text-gray-400 mt-1">
              Tap on your iPhone to auto-configure the Overland app.
            </p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-200 mb-1">
              Endpoint URL
            </label>
            <div class="bg-gray-900 rounded p-3 font-mono text-sm break-all text-gray-200">
              {overlandEndpoint}
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-200 mb-1">
              Token (paste into Overland's "Access Token" field)
            </label>
            <div class="flex items-center gap-3 mb-4">
              <code class="bg-gray-900 px-2 py-1 rounded text-sm font-mono break-all text-gray-200">
                {user.overland_token}
              </code>
              <form
                method="post"
                action="/dashboard/regenerate-overland-token"
                class="inline shrink-0"
              >
                <button
                  type="submit"
                  class="text-sm text-red-400 hover:text-red-300 underline"
                  onclick="return confirm('Regenerate Overland token? Update the Overland app with the new token.')"
                >
                  Regenerate
                </button>
              </form>
            </div>
          </div>
          <p class="text-xs text-gray-400 leading-none">
            Latest update: {overlandUpdateText} (reload to refresh)
          </p>
        </section>

        <section class="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 class="text-lg font-semibold mb-2 text-white">Step 2 (optional): Discord Integration</h2>
          <p class="text-sm text-gray-300 mb-3">
            Join the {" "}
            <a
              href="https://github.com/Phineas/lanyard"
              class="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener"
            >
              Lanyard Discord server
            </a>
            {" "}and input your user ID below. Your Discord status, activities, and Spotify will appear in your
            status API response.
          </p>

          {user.discord_id ? (
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-400">Discord ID:</span>
              <code class="bg-gray-900 px-2 py-1 rounded text-sm font-mono text-gray-200">
                {user.discord_id}
              </code>
              <form
                method="post"
                action="/dashboard/update-discord"
                class="inline"
              >
                <input type="hidden" name="discord_id" value="" />
                <button
                  type="submit"
                  class="text-sm text-red-400 hover:text-red-300 underline"
                >
                  Remove
                </button>
              </form>
            </div>
          ) : (
            <form
              method="post"
              action="/dashboard/update-discord"
              class="flex items-center gap-3"
            >
              <input
                type="text"
                name="discord_id"
                placeholder="Discord User ID (e.g. 214167454291722241)"
                pattern="[0-9]{17,20}"
                required
                class="border border-gray-600 bg-gray-900 text-gray-200 rounded px-3 py-1.5 text-sm font-mono flex-1 placeholder-gray-500"
              />
              <button
                type="submit"
                class="bg-white text-gray-900 px-4 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors"
              >
                Save
              </button>
            </form>
          )}
          <p class="text-xs text-gray-400 mt-2">
            To find your Discord ID: enable Developer Mode in Discord settings,
            then right-click your name and "Copy User ID".
          </p>
        </section>

        <section class="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 class="text-lg font-semibold mb-2 text-white">Step 3: Your Status API</h2>
          <p class="text-sm text-gray-300 mb-3">
            Share this URL with AI assistants:
          </p>
          <div class="bg-gray-900 rounded p-3 font-mono text-sm break-all mb-4 text-gray-200">
            {statusEndpoint}
          </div>
          <p class="text-sm text-gray-300 mb-3">
            Or use the following MCP server in compatible AI assistants:
          </p>
          <div class="bg-gray-900 rounded p-3 font-mono text-sm break-all mb-4 text-gray-200">
            {mcpEndpoint}
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-400">API Key:</span>
            <code class="bg-gray-900 px-2 py-1 rounded text-sm font-mono break-all text-gray-200">
              {user.api_key}
            </code>
            <form
              method="post"
              action="/dashboard/regenerate-api-key"
              class="inline"
            >
              <button
                type="submit"
                class="text-sm text-red-400 hover:text-red-300 underline"
                onclick="return confirm('Regenerate API key? Existing integrations will break.')"
              >
                Regenerate
              </button>
            </form>
          </div>
        </section>

        <PrivacySection settings={privacySettings} />
      </div>
    </div>,
  );
});

dashboard.post("/update-discord", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.parseBody();
  const discordId = (body["discord_id"] as string)?.trim() || null;

  // Validate: must be a numeric Discord ID or empty (to remove)
  if (discordId && !/^\d{17,20}$/.test(discordId)) {
    return c.redirect("/dashboard");
  }

  await updateDiscordId(c.env.DB, userId, discordId);
  return c.redirect("/dashboard");
});

dashboard.post("/update-privacy", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.parseBody();

  const precision = body["location_precision"] as string;
  const validPrecisions = ["exact", "city", "region", "hidden"];
  if (!validPrecisions.includes(precision)) {
    return c.redirect("/dashboard");
  }

  // Collect checked hide_fields checkboxes
  const hideFields: string[] = [];
  const hideableFields = [
    "altitude",
    "speed",
    "course",
    "horizontal_accuracy",
    "vertical_accuracy",
    "speed_accuracy",
    "course_accuracy",
    "battery_state",
    "battery_level",
    "wifi",
    "device_id",
  ];
  for (const field of hideableFields) {
    if (body[`hide_${field}`]) {
      hideFields.push(field);
    }
  }

  const settings: PrivacySettings = {
    location_precision: precision as PrivacySettings["location_precision"],
    hide_fields: hideFields,
  };

  await updatePrivacySettings(c.env.DB, userId, settings);
  return c.redirect("/dashboard");
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

const PRECISION_OPTIONS = [
  { value: "exact", label: "Exact", desc: "Raw coordinates as reported" },
  { value: "city", label: "City", desc: "Rounded to ~1km" },
  { value: "region", label: "Region", desc: "Rounded to ~11km" },
  { value: "hidden", label: "Hidden", desc: "Location omitted entirely" },
] as const;

const HIDEABLE_FIELDS = [
  { name: "speed", label: "Speed" },
  { name: "altitude", label: "Altitude" },
  { name: "course", label: "Course" },
  { name: "battery_state", label: "Battery state" },
  { name: "battery_level", label: "Battery level" },
  { name: "wifi", label: "WiFi SSID" },
  { name: "device_id", label: "Device ID" },
  { name: "horizontal_accuracy", label: "Horizontal accuracy" },
  { name: "vertical_accuracy", label: "Vertical accuracy" },
  { name: "speed_accuracy", label: "Speed accuracy" },
  { name: "course_accuracy", label: "Course accuracy" },
] as const;

function PrivacySection({ settings }: { settings: PrivacySettings }) {
  return (
    <section class="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-6 mb-6">
      <h2 class="text-lg font-semibold mb-2 text-white">Privacy Controls</h2>
      <p class="text-sm text-gray-300 mb-4">
        Control what data is visible in your public status API response.
      </p>
      <form method="post" action="/dashboard/update-privacy">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-200 mb-2">
            Location precision
          </label>
          <div class="space-y-2">
            {PRECISION_OPTIONS.map((opt) => (
              <label class="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="radio"
                  name="location_precision"
                  value={opt.value}
                  checked={settings.location_precision === opt.value}
                />
                <span class="font-medium">{opt.label}</span>
                <span class="text-gray-500">— {opt.desc}</span>
              </label>
            ))}
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-200 mb-2">
            Hide fields
          </label>
          <div class="grid grid-cols-2 gap-2">
            {HIDEABLE_FIELDS.map((field) => (
              <label class="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  name={`hide_${field.name}`}
                  value="1"
                  checked={settings.hide_fields.includes(field.name)}
                />
                {field.label}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          class="bg-white text-gray-900 px-4 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors"
        >
          Save Privacy Settings
        </button>
      </form>
    </section>
  );
}

function buildUpdateText(locationJson: string | null): string {
  if (!locationJson) return "never";

  let raw: StoredLocation;
  try {
    raw = JSON.parse(locationJson) as StoredLocation;
  } catch {
    return "unknown";
  }

  const timestampMs = new Date(raw.timestamp).getTime();
  if (Number.isNaN(timestampMs)) return "unknown";

  const ageSeconds = Math.max(0, Math.round((Date.now() - timestampMs) / 1000));
  if (ageSeconds < 10) return "just now";
  if (ageSeconds < 60) return `${ageSeconds}s ago`;

  const ageMinutes = Math.floor(ageSeconds / 60);
  if (ageMinutes < 60) return `${ageMinutes}m ago`;

  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours < 24) {
    const minutesRemainder = ageMinutes % 60;
    return minutesRemainder
      ? `${ageHours}h ${minutesRemainder}m ago`
      : `${ageHours}h ago`;
  }

  const ageDays = Math.floor(ageHours / 24);
  return ageDays === 1 ? "1d ago" : `${ageDays}d ago`;
}

export default dashboard;
