import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'nitro'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  compatibilityDate: '2026-07-17',

  // En Nitro 3 `serverDir` es `false` por defecto: sin esto NO escanea nada y
  // toda ruta responde 404. `'./'` = las carpetas de convención (routes/, utils/,
  // middleware/, plugins/, tasks/…) cuelgan de la raíz de `server/`.
  serverDir: './',

  ignore: ['modules/**'],
  preset: process.env.NITRO_PRESET || 'aws-lambda',

  // `@/` → raíz del server. El tsconfig generado ya trae el `paths`, pero el
  // bundler no lo hereda: sin esto compila y revienta en runtime con
  // ERR_MODULE_NOT_FOUND. El gemelo del client: client/vite.config.ts.
  alias: { '@': root }
})
