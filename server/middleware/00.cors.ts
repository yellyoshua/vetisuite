import { defineMiddleware } from 'nitro'

export default defineMiddleware((_event): void => {
  throw new Error('Not implemented: corsMiddleware')
})
