# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start Vite dev server with hot reload
pnpm build            # Production build to dist/
pnpm deploy           # Build + deploy to Cloudflare Workers
pnpm cf-typegen       # Regenerate CloudflareBindings type from wrangler.jsonc
pnpm preview          # Build + local preview via Vite
```

Database operations:
```bash
npx wrangler d1 execute status-endpoint-db --file=src/db/schema.sql        # Apply schema
npx wrangler d1 execute status-endpoint-db --file=src/db/migrations/XXX.sql # Run migration
```

## Architecture

Hono web framework on Cloudflare Workers. JSX uses `hono/jsx` (not React DOM) — import from `hono/jsx` or use Hono's `html` helper, never `react-dom`.

**Data flow:** Overland iOS app POSTs GPS → stored in KV → status API reads KV + fetches Discord via Lanyard → returns combined JSON (with privacy filters applied on-read).

**Cloudflare bindings** (defined in `wrangler.jsonc`, typed via `CloudflareBindings`):
- `DB` — D1 SQLite database (users table)
- `STATUS_KV` — KV namespace for cached location data
- `SESSIONS` — KV namespace for session store (30-day TTL)
- Secrets in `.dev.vars`: `GOOGLE_ID`, `GOOGLE_SECRET`, `SESSION_SECRET`

**Environment type:** Use `AppEnv` from `src/lib/types.ts` for all Hono route/middleware typing. It combines `CloudflareBindings` with secrets and session variables.

## Route Structure

All routes are in `src/routes/` and mounted in `src/index.tsx`:

- `status.tsx` — `GET /api/status/:apiKey` — public JSON API (30s cache)
- `mcp.ts` — `/mcp` — MCP server with `get_status` tool
- `auth.tsx` — Google OAuth login/logout
- `dashboard.tsx` — Protected settings UI (CSRF-protected, requires session)
- `overland.tsx` — `POST /api/overland/:userId` — GPS webhook (Bearer token auth)

The landing page (`GET /`) is rendered directly in `src/index.tsx`.

## Key Patterns

- **Privacy filtering** (`src/lib/privacy.ts`): Applied on-read in the status endpoint, not on storage. Rounds coordinates by precision level and nulls hidden fields.
- **Session middleware** (`src/middleware/session.ts`): `requireAuth` middleware validates sessions from KV. Use `c.get('userId')` / `c.get('userName')` / `c.get('userEmail')` for authenticated user data.
- **Token generation** (`src/lib/tokens.ts`): API keys use `sk_` prefix, Overland tokens use `ol_` prefix.
- **Database queries** (`src/db/queries.ts`): All D1 operations go through helper functions here. Single `users` table with `privacy_settings` stored as JSON text.
- **Styling**: Tailwind CSS 4 with custom animations in `src/style.css`. HTML shell in `src/renderer.tsx`.
