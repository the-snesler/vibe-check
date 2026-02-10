import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { html } from "hono/html";
import { renderer } from "./renderer";
import type { AppEnv } from "./lib/types";

import auth from "./routes/auth";
import dashboard from "./routes/dashboard";
import overland from "./routes/overland";
import status from "./routes/status";
import mcp from "./routes/mcp";
import { home } from "./home";

const app = new Hono<AppEnv>();

app.use(renderer);

app.route("/", home);
app.route("/auth", auth);
app.route("/dashboard", dashboard);
app.route("/api/overland", overland);
app.route("/api/status", status);
app.route("/mcp", mcp);

export default app;
