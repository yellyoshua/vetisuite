import { defineConfig } from 'astro/config'
import awsAmplify from 'astro-aws-amplify'

export default defineConfig({
  site: 'https://vetisuite.com',
  output: 'static',
  adapter: awsAmplify({
    customRules: [{ source: '/<*>', target: '/index.html', status: '404-200', }],
  }),
})
