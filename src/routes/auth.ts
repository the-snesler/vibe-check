import { Hono } from "hono";
import { googleAuth } from "@hono/oauth-providers/google";
import type { AppEnv } from "../lib/types";
import { upsertUser } from "../db/queries";
import { createSession, destroySession } from "../middleware/session";

const auth = new Hono<AppEnv>();

auth.get(
  "/google",
  googleAuth({
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
  }),
  async (c) => {
    const googleUser = c.get("user-google");
    if (!googleUser?.id || !googleUser?.email) {
      return c.redirect("/?error=auth_failed");
    }

    const user = await upsertUser(
      c.env.DB,
      googleUser.id,
      googleUser.email,
      googleUser.name || googleUser.email,
      googleUser.picture || ""
    );

    await createSession(c, {
      userId: user.id,
      email: user.email,
      name: user.name,
      pictureUrl: user.picture_url,
      createdAt: Date.now(),
    });

    return c.redirect("/dashboard");
  }
);

auth.post("/logout", async (c) => {
  await destroySession(c);
  return c.redirect("/");
});

export default auth;
