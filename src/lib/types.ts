export type AppEnv = {
  Bindings: CloudflareBindings & {
    GOOGLE_ID: string;
    GOOGLE_SECRET: string;
    SESSION_SECRET: string;
  };
  Variables: {
    userId: string;
    userEmail: string;
    userName: string;
  };
};

export interface UserRow {
  id: string;
  google_id: string;
  email: string;
  name: string;
  picture_url: string;
  api_key: string;
  overland_token: string;
  discord_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  pictureUrl: string;
  createdAt: number;
}

export interface OverlandPayload {
  locations: OverlandLocation[];
  current?: OverlandLocation;
  trip?: {
    distance: number;
    mode: string;
    current_location: OverlandLocation;
    start_location: OverlandLocation;
    start: string;
  };
}

export interface OverlandLocation {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    timestamp: string;
    altitude?: number;
    speed?: number;
    course?: number;
    horizontal_accuracy?: number;
    vertical_accuracy?: number;
    speed_accuracy?: number;
    course_accuracy?: number;
    motion?: string[];
    battery_state?: string;
    battery_level?: number;
    wifi?: string;
    device_id?: string;
    [key: string]: unknown;
  };
}

// TODO: Add privacy controls - allow users to configure which fields are exposed
// TODO: Add precision controls - allow rounding coordinates
export interface StoredLocation {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  altitude: number | null;
  speed: number | null;
  course: number | null;
  horizontal_accuracy: number | null;
  vertical_accuracy: number | null;
  speed_accuracy: number | null;
  course_accuracy: number | null;
  motion: string[];
  battery_state: string | null;
  battery_level: number | null;
  wifi: string | null;
  device_id: string | null;
  received_at: string;
}

export interface StatusResponse {
  ok: true;
  user: {
    name: string;
  };
  location: StoredLocation | null;
  // TODO: Add discord field for Lanyard data in Phase 2
  _meta: {
    generated_at: string;
    data_age_seconds: number | null;
  };
}

export interface StatusErrorResponse {
  ok: false;
  error: string;
}
