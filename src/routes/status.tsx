import { Hono } from "hono";
import type {
  AppEnv,
  StoredLocation,
  StatusResponse,
  StatusErrorResponse,
  PrivacySettings,
} from "../lib/types";
import { DEFAULT_PRIVACY_SETTINGS } from "../lib/types";
import { getUserByApiKey } from "../db/queries";
import { fetchLanyardPresence } from "../lib/lanyard";
import { applyPrivacy } from "../lib/privacy";

const status = new Hono<AppEnv>();

// TODO: Add rate limiting
status.get("/:apiKey", async (c) => {
  const apiKey = c.req.param("apiKey");

  const user = await getUserByApiKey(c.env.DB, apiKey);
  if (!user) {
    return c.json<StatusErrorResponse>(
      { ok: false, error: "Invalid API key" },
      404
    );
  }

  const privacySettings: PrivacySettings = user.privacy_settings
    ? JSON.parse(user.privacy_settings)
    : DEFAULT_PRIVACY_SETTINGS;

  // Load location from KV and apply privacy settings
  const locationJson = await c.env.STATUS_KV.get(`location:${user.id}`);
  let location: StoredLocation | null = null;
  let dataAgeSeconds: number | null = null;

  if (locationJson) {
    const raw = JSON.parse(locationJson) as StoredLocation;
    location = applyPrivacy(raw, privacySettings);
    if (location) {
      const locationTime = new Date(raw.timestamp).getTime();
      dataAgeSeconds = Math.round((Date.now() - locationTime) / 1000);
    }
  }

  // Fetch Discord presence if configured
  const discord = user.discord_id
    ? await fetchLanyardPresence(user.discord_id)
    : null;

  c.header("Cache-Control", "public, max-age=30");

  return c.json<StatusResponse>({
    ok: true,
    user: { name: user.name },
    location,
    discord,
    _meta: {
      generated_at: new Date().toISOString(),
      data_age_seconds: dataAgeSeconds,
    },
  });
});

export default status;
