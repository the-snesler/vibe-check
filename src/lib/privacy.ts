import type { StoredLocation, PrivacySettings } from "./types";

const HIDEABLE_FIELDS = [
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
] as const;

export function applyPrivacy(
  location: StoredLocation,
  settings: PrivacySettings
): StoredLocation | null {
  if (settings.location_precision === "hidden") {
    return null;
  }

  const result = { ...location, coordinates: { ...location.coordinates } };

  // Round coordinates based on precision level
  if (settings.location_precision === "city") {
    // ~1.1km precision
    result.coordinates.latitude =
      Math.round(result.coordinates.latitude * 100) / 100;
    result.coordinates.longitude =
      Math.round(result.coordinates.longitude * 100) / 100;
  } else if (settings.location_precision === "region") {
    // ~11km precision
    result.coordinates.latitude =
      Math.round(result.coordinates.latitude * 10) / 10;
    result.coordinates.longitude =
      Math.round(result.coordinates.longitude * 10) / 10;
  }

  // Null out hidden fields
  for (const field of settings.hide_fields) {
    if (HIDEABLE_FIELDS.includes(field as (typeof HIDEABLE_FIELDS)[number])) {
      (result as Record<string, unknown>)[field] = null;
    }
  }

  return result;
}
