import { Hono } from "hono";
import type {
  AppEnv,
  OverlandPayload,
  OverlandLocation,
  StoredLocation,
} from "../lib/types";
import { getUserById } from "../db/queries";

const overland = new Hono<AppEnv>();

// TODO: Add rate limiting per user
overland.post("/:userId", async (c) => {
  const userId = c.req.param("userId");

  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ result: "error", error: "Missing authorization" }, 401);
  }
  const bearerToken = authHeader.slice(7);

  const user = await getUserById(c.env.DB, userId);
  if (!user) {
    return c.json({ result: "error", error: "User not found" }, 404);
  }

  if (!timingSafeEqual(bearerToken, user.overland_token)) {
    return c.json({ result: "error", error: "Invalid token" }, 401);
  }

  let payload: OverlandPayload;
  try {
    payload = await c.req.json<OverlandPayload>();
  } catch {
    return c.json({ result: "error", error: "Invalid JSON" }, 400);
  }

  if (!payload.locations || !Array.isArray(payload.locations)) {
    return c.json({ result: "error", error: "Missing locations array" }, 400);
  }

  // Prefer "current" if present, otherwise find latest by timestamp
  let latest: OverlandLocation | null = null;

  if (
    payload.current?.geometry?.coordinates &&
    payload.current?.properties?.timestamp
  ) {
    latest = payload.current;
  } else if (payload.locations.length > 0) {
    latest =
      payload.locations
        .filter(
          (loc) => loc.geometry?.coordinates && loc.properties?.timestamp
        )
        .sort((a, b) => {
          const ta = new Date(a.properties.timestamp).getTime();
          const tb = new Date(b.properties.timestamp).getTime();
          return tb - ta;
        })[0] || null;
  }

  if (latest) {
    // TODO: Apply privacy/precision controls before storing
    const stored: StoredLocation = {
      coordinates: {
        latitude: latest.geometry.coordinates[1],
        longitude: latest.geometry.coordinates[0],
      },
      timestamp: latest.properties.timestamp,
      altitude: latest.properties.altitude ?? null,
      speed: latest.properties.speed ?? null,
      course: latest.properties.course ?? null,
      horizontal_accuracy: latest.properties.horizontal_accuracy ?? null,
      vertical_accuracy: latest.properties.vertical_accuracy ?? null,
      speed_accuracy: latest.properties.speed_accuracy ?? null,
      course_accuracy: latest.properties.course_accuracy ?? null,
      motion: latest.properties.motion ?? [],
      battery_state: latest.properties.battery_state ?? null,
      battery_level: latest.properties.battery_level ?? null,
      wifi: latest.properties.wifi ?? null,
      device_id: latest.properties.device_id ?? null,
      received_at: new Date().toISOString(),
    };

    await c.env.STATUS_KV.put(
      `location:${userId}`,
      JSON.stringify(stored)
    );
  }

  return c.json({ result: "ok" });
});

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}

export default overland;
