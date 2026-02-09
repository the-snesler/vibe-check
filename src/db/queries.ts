import type { UserRow, PrivacySettings } from "../lib/types";
import { DEFAULT_PRIVACY_SETTINGS } from "../lib/types";
import { generateApiKey, generateOverlandToken } from "../lib/tokens";

export async function getUserByGoogleId(
  db: D1Database,
  googleId: string
): Promise<UserRow | null> {
  return db
    .prepare("SELECT * FROM users WHERE google_id = ?")
    .bind(googleId)
    .first<UserRow>();
}

export async function getUserByApiKey(
  db: D1Database,
  apiKey: string
): Promise<UserRow | null> {
  return db
    .prepare("SELECT * FROM users WHERE api_key = ?")
    .bind(apiKey)
    .first<UserRow>();
}

export async function getUserById(
  db: D1Database,
  userId: string
): Promise<UserRow | null> {
  return db
    .prepare("SELECT * FROM users WHERE id = ?")
    .bind(userId)
    .first<UserRow>();
}

export async function getUserByOverlandToken(
  db: D1Database,
  token: string
): Promise<UserRow | null> {
  return db
    .prepare("SELECT * FROM users WHERE overland_token = ?")
    .bind(token)
    .first<UserRow>();
}

export async function upsertUser(
  db: D1Database,
  googleId: string,
  email: string,
  name: string,
  pictureUrl: string
): Promise<UserRow> {
  const existing = await getUserByGoogleId(db, googleId);
  if (existing) {
    await db
      .prepare(
        `UPDATE users SET email = ?, name = ?, picture_url = ?, updated_at = datetime('now') WHERE google_id = ?`
      )
      .bind(email, name, pictureUrl, googleId)
      .run();
    return { ...existing, email, name, picture_url: pictureUrl };
  }

  const id = crypto.randomUUID();
  const apiKey = generateApiKey();
  const overlandToken = generateOverlandToken();

  await db
    .prepare(
      `INSERT INTO users (id, google_id, email, name, picture_url, api_key, overland_token)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, googleId, email, name, pictureUrl, apiKey, overlandToken)
    .run();

  return {
    id,
    google_id: googleId,
    email,
    name,
    picture_url: pictureUrl,
    api_key: apiKey,
    overland_token: overlandToken,
    discord_id: null,
    privacy_settings: JSON.stringify(DEFAULT_PRIVACY_SETTINGS),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function updateDiscordId(
  db: D1Database,
  userId: string,
  discordId: string | null
): Promise<void> {
  await db
    .prepare(
      `UPDATE users SET discord_id = ?, updated_at = datetime('now') WHERE id = ?`
    )
    .bind(discordId, userId)
    .run();
}

export async function updatePrivacySettings(
  db: D1Database,
  userId: string,
  settings: PrivacySettings
): Promise<void> {
  await db
    .prepare(
      `UPDATE users SET privacy_settings = ?, updated_at = datetime('now') WHERE id = ?`
    )
    .bind(JSON.stringify(settings), userId)
    .run();
}

export async function regenerateApiKey(
  db: D1Database,
  userId: string,
  newApiKey: string
): Promise<void> {
  await db
    .prepare(
      `UPDATE users SET api_key = ?, updated_at = datetime('now') WHERE id = ?`
    )
    .bind(newApiKey, userId)
    .run();
}

export async function regenerateOverlandToken(
  db: D1Database,
  userId: string,
  newToken: string
): Promise<void> {
  await db
    .prepare(
      `UPDATE users SET overland_token = ?, updated_at = datetime('now') WHERE id = ?`
    )
    .bind(newToken, userId)
    .run();
}
