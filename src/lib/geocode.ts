import type { GeocodedAddress, PrivacySettings } from "./types";

const MAPBOX_GEOCODE_API =
  "https://api.mapbox.com/search/geocode/v6/reverse";

export async function reverseGeocode(
  lat: number,
  lon: number,
  token: string,
  kv: KVNamespace
): Promise<GeocodedAddress | null> {
  try {
    const cacheKey = `geocode:${lat.toFixed(2)}:${lon.toFixed(2)}`;
    const cached = await kv.get(cacheKey);
    if (cached) return JSON.parse(cached) as GeocodedAddress;

    const url = `${MAPBOX_GEOCODE_API}?longitude=${lon}&latitude=${lat}&access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const json = (await res.json()) as {
      features?: {
        properties?: {
          full_address?: string;
          context?: {
            place?: { name?: string };
            region?: { name?: string };
            country?: { name?: string };
          };
        };
      }[];
    };

    const feature = json.features?.[0];
    if (!feature?.properties) return null;

    const props = feature.properties;
    const address: GeocodedAddress = {
      full_address: props.full_address ?? null,
      place: props.context?.place?.name ?? null,
      region: props.context?.region?.name ?? null,
      country: props.context?.country?.name ?? null,
    };

    await kv.put(cacheKey, JSON.stringify(address), {
      expirationTtl: 86400,
    });

    return address;
  } catch {
    return null;
  }
}

export function filterAddressByPrecision(
  address: GeocodedAddress | null,
  precision: PrivacySettings["location_precision"]
): GeocodedAddress | null {
  if (!address) return null;

  if (precision === "hidden") return null;

  if (precision === "region") {
    return {
      full_address: null,
      place: null,
      region: address.region,
      country: address.country,
    };
  }

  // "exact" and "city" — return all fields
  return address;
}
