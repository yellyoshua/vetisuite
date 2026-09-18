import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import awsAmplify from 'astro-aws-amplify'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://vetisuite.com',
  output: 'static',
  adapter: awsAmplify(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
})
