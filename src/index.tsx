import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { renderer } from "./renderer";
import type { AppEnv } from "./lib/types";

import auth from "./routes/auth";
import dashboard from "./routes/dashboard";
import overland from "./routes/overland";
import status from "./routes/status";
import mcp from "./routes/mcp";

const app = new Hono<AppEnv>();

app.use(renderer);

app.get("/", async (c) => {
  const sessionId = getCookie(c, "sid");
  const hasSession = sessionId
    ? !!(await c.env.SESSIONS.get(`session:${sessionId}`))
    : false;

  return c.render(
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="max-w-md mx-auto px-4 text-center">
        <h1 class="text-3xl font-bold mb-4">Status</h1>
        <p class="text-gray-600 mb-6">
          Share your live location and presence with AI assistants, securely.
        </p>
        {hasSession ? (
          <a
            href="/dashboard"
            class="inline-block bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go to Dashboard
          </a>
        ) : (
          <a
            href="/auth/google"
            class="inline-block bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sign in with Google
          </a>
        )}
      </div>
    </div>
  );
});

app.route("/auth", auth);
app.route("/dashboard", dashboard);
app.route("/api/overland", overland);
app.route("/api/status", status);
app.route("/mcp", mcp);

export default app;
