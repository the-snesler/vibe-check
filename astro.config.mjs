// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import auth from 'auth-astro';

import cloudflare from '@astrojs/cloudflare';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      GOOGLE_ID: envField.string({context: 'server', access: 'secret'}),
      GOOGLE_SECRET: envField.string({context: 'server', access: 'secret'}),
      SESSION_SECRET: envField.string({context: 'server', access: 'secret'}),
      MAPBOX_TOKEN: envField.string({context: 'server', access: 'secret'}),
    }
  },

  output: 'server',
  
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [auth(), icon()],
  adapter: cloudflare(),
});
