import { Hono } from "hono";
import type {
  AppEnv,
  StoredLocation,
  StatusResponse,
  StatusErrorResponse,
} from "../lib/types";
import { getUserByApiKey } from "../db/queries";

const status = new Hono<AppEnv>();

// TODO: Add rate limiting
// TODO: Add Discord/Lanyard data (Phase 2)
status.get("/:apiKey", async (c) => {
  const apiKey = c.req.param("apiKey");

  const user = await getUserByApiKey(c.env.DB, apiKey);
  if (!user) {
    return c.json<StatusErrorResponse>(
      { ok: false, error: "Invalid API key" },
      404
    );
  }

  const locationJson = await c.env.STATUS_KV.get(`location:${user.id}`);
  let location: StoredLocation | null = null;
  let dataAgeSeconds: number | null = null;

  if (locationJson) {
    location = JSON.parse(locationJson) as StoredLocation;
    const locationTime = new Date(location.timestamp).getTime();
    dataAgeSeconds = Math.round((Date.now() - locationTime) / 1000);
  }

  c.header("Cache-Control", "public, max-age=30");

  return c.json<StatusResponse>({
    ok: true,
    user: { name: user.name },
    location,
    _meta: {
      generated_at: new Date().toISOString(),
      data_age_seconds: dataAgeSeconds,
    },
  });
});

export default status;
