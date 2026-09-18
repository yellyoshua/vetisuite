import { defineErrorHandler } from 'nitro'

export default defineErrorHandler((_error, _event): Response => {
  throw new Error('Not implemented: nitroErrorHandler')
})
