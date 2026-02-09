import { jsxRenderer } from "hono/jsx-renderer";
import { Link, ViteClient } from "vite-ssr-components/hono";

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Vibe Check</title>
        <meta
          name="description"
          content="Share your real-time location and Discord presence with AI assistants, securely."
        />
        <meta property="og:title" content="Vibe Check" />
        <meta
          property="og:description"
          content="Give your AI assistants eyes on the real world."
        />
        <meta property="og:image" content="/logo.png" />
        <meta name="theme-color" content="#0f0d2e" />
        <ViteClient />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <Link href="/src/style.css" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body class="antialiased">{children}</body>
    </html>
  );
});
