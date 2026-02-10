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
import { reverseGeocode, filterAddressByPrecision } from "../lib/geocode";

export const fetchUserStatus = async (
  apiKey: string,
  currentEnv: AppEnv["Bindings"],
): Promise<StatusResponse | StatusErrorResponse> => {
  const user = await getUserByApiKey(currentEnv.DB, apiKey);
  if (!user) {
    return { ok: false, error: "Invalid API key" };
  }

  const privacySettings: PrivacySettings = user.privacy_settings
    ? JSON.parse(user.privacy_settings)
    : DEFAULT_PRIVACY_SETTINGS;

  // Load location from KV and apply privacy settings
  const locationJson = await currentEnv.STATUS_KV.get(`location:${user.id}`);
  let location: StoredLocation | null = null;
  let dataAgeSeconds: number | null = null;
  let rawLat: number | undefined;
  let rawLon: number | undefined;

  if (locationJson) {
    const raw = JSON.parse(locationJson) as StoredLocation;
    rawLat = raw.coordinates.latitude;
    rawLon = raw.coordinates.longitude;
    location = applyPrivacy(raw, privacySettings);
    if (location) {
      const locationTime = new Date(raw.timestamp).getTime();
      dataAgeSeconds = Math.round((Date.now() - locationTime) / 1000);
    }
  }

  // Fetch Discord presence and geocode in parallel
  const [discord, rawAddress] = await Promise.all([
    user.discord_id ? fetchLanyardPresence(user.discord_id) : null,
    rawLat !== undefined && rawLon !== undefined
      ? reverseGeocode(
          rawLat,
          rawLon,
          currentEnv.MAPBOX_TOKEN,
          currentEnv.STATUS_KV,
        )
      : null,
  ]);

  const address = filterAddressByPrecision(
    rawAddress,
    privacySettings.location_precision,
  );

  return {
    ok: true,
    user: { name: user.name },
    location,
    address,
    discord,
    _meta: {
      generated_at: new Date().toISOString(),
      data_age_seconds: dataAgeSeconds,
    },
  };
};

const status = new Hono<AppEnv>();

// TODO: Add rate limiting
status.get("/:apiKey", async (c) => {
    const apiKey = c.req.param("apiKey");
    const result = await fetchUserStatus(apiKey, c.env);
    if (result.ok) c.header("Cache-Control", "public, max-age=30");
    return c.json(result);
  }
);

export default status;
