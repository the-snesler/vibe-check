# Vibe Check

> Give your AI assistants eyes on the real world.

Vibe Check is a lightweight status API and [MCP](https://modelcontextprotocol.io/) server that shares your real-time location and Discord presence with personal AI assistants — securely and on your terms.

Built for tools like [Poke](https://poke.com/) and [OpenClaw](https://openclaw.ai/) that work best with context about where you are and what you're up to.

## How It Works

```
iPhone (Overland)  ──►  Vibe Check  ◄──  Lanyard (Discord)
                            │
                      REST API / MCP
                            │
                    ┌───────┴───────┐
                    ▼               ▼
                  Poke          OpenClaw
             (iMessage AI)   (Autonomous Agent)
```

1. **Track** — The [Overland](https://overland.p3k.app/) iOS app sends your GPS location in the background
2. **Aggregate** — Vibe Check combines location with your Discord presence via [Lanyard](https://github.com/Phineas/lanyard)
3. **Serve** — AI assistants query the REST API or MCP server and get your full context

## Features

- **REST API** — `GET /api/status/:apiKey` returns JSON with location, Discord presence, Spotify, and more
- **MCP Server** — `get_status` tool at `/mcp` for assistants that speak [Model Context Protocol](https://modelcontextprotocol.io/)
- **GPS Tracking** — Background location via [Overland](https://overland.p3k.app/) with one-tap setup from the dashboard
- **Discord Presence** — Status, activities, and Spotify pulled from [Lanyard](https://github.com/Phineas/lanyard)
- **Privacy Controls** — Location precision (exact / city / region / hidden) and per-field hiding
- **Google OAuth** — Secure sign-in with session management

## API Response

```json
{
  "ok": true,
  "user": { "name": "Sam" },
  "location": {
    "coordinates": { "latitude": 37.7749, "longitude": -122.4194 },
    "timestamp": "2026-02-09T12:00:00Z",
    "speed": 0,
    "motion": ["stationary"],
    "battery_state": "charging",
    "battery_level": 85
  },
  "discord": {
    "discord_status": "online",
    "listening_to_spotify": true,
    "spotify": {
      "song": "Redbone",
      "artist": "Childish Gambino",
      "album": "Awaken, My Love!"
    },
    "activities": []
  },
  "_meta": {
    "generated_at": "2026-02-09T12:00:30Z",
    "data_age_seconds": 30
  }
}
```

## Setup

### Prerequisites

- Node.js 18+
- A [Cloudflare](https://www.cloudflare.com/) account (Workers, D1, KV)
- Google OAuth credentials ([console](https://console.cloud.google.com/apis/credentials))
- [Overland](https://overland.p3k.app/) iOS app for GPS tracking
- Optional: a Discord account + [Lanyard](https://github.com/Phineas/lanyard) for presence

### Development

```bash
npm install
npm run dev
```

### Environment

Create a `.dev.vars` file:

```
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
SESSION_SECRET=a_random_secret
```

### Database

Create a D1 database and run the schema:

```bash
npx wrangler d1 create status-endpoint-db
npx wrangler d1 execute status-endpoint-db --file=src/db/schema.sql
```

### Deploy

```bash
npm run deploy
```

## Privacy

You control exactly what gets shared:

| Precision | Effect |
|-----------|--------|
| **Exact** | Raw coordinates as reported |
| **City** | Rounded to ~1 km |
| **Region** | Rounded to ~11 km |
| **Hidden** | Location omitted entirely |

Individual fields (speed, altitude, battery, WiFi SSID, device ID, etc.) can also be hidden independently. All settings are managed from the dashboard and apply immediately.

## Tech Stack

[Hono](https://hono.dev) ・ [Cloudflare Workers](https://workers.cloudflare.com) ・ [D1](https://developers.cloudflare.com/d1/) ・ [KV](https://developers.cloudflare.com/kv/) ・ [Tailwind CSS](https://tailwindcss.com) ・ [Overland](https://overland.p3k.app/) ・ [Lanyard](https://github.com/Phineas/lanyard)

## Links

- [Privacy Policy](http://samnesler.com/posts/privacy-policy/)
- [Terms of Service](http://samnesler.com/posts/terms-of-service/)
