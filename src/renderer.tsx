import { jsxRenderer } from "hono/jsx-renderer";
import { Link, ViteClient } from "vite-ssr-components/hono";

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Vibe Check</title>
        <ViteClient />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <Link href="/src/style.css" rel="stylesheet" />
      </head>
      <body class="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
});
