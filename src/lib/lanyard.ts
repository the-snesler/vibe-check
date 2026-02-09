import type { LanyardData } from "./types";

const LANYARD_API = "https://api.lanyard.rest/v1/users";

export async function fetchLanyardPresence(
  discordId: string
): Promise<LanyardData | null> {
  try {
    const res = await fetch(`${LANYARD_API}/${discordId}`);
    if (!res.ok) return null;

    const json = (await res.json()) as {
      success: boolean;
      data?: {
        discord_status: string;
        active_on_discord_desktop: boolean;
        active_on_discord_mobile: boolean;
        active_on_discord_web: boolean;
        listening_to_spotify: boolean;
        spotify: {
          song: string;
          artist: string;
          album: string;
          album_art_url: string;
          timestamps: { start: number; end: number };
        } | null;
        activities: {
          type: number;
          name: string;
          state?: string;
          details?: string;
        }[];
      };
    };

    if (!json.success || !json.data) return null;

    const d = json.data;
    return {
      discord_status: d.discord_status,
      active_on_discord_desktop: d.active_on_discord_desktop,
      active_on_discord_mobile: d.active_on_discord_mobile,
      active_on_discord_web: d.active_on_discord_web,
      listening_to_spotify: d.listening_to_spotify,
      spotify: d.spotify,
      activities: d.activities.map((a) => ({
        type: a.type,
        name: a.name,
        state: a.state,
        details: a.details,
      })),
    };
  } catch {
    return null;
  }
}
