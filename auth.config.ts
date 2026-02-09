import Google from '@auth/core/providers/google'
import { defineConfig } from 'auth-astro'

export default defineConfig({
	providers: [
		Google({
      clientId: import.meta.env.GOOGLE_ID,
      clientSecret: import.meta.env.GOOGLE_SECRET,
		}),
	],
  secret: import.meta.env.SESSION_SECRET,
  trustHost: true,
  basePath: '/auth'
})
