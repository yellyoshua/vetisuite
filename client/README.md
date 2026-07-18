# Veti Suite — App (client)

SPA de gestión para clínicas veterinarias. Se sirve en **app.vetisuite.com**.

Demo MVP sin backend real: el estado vive en memoria (zustand) con datos
semilla; `src/lib/api.ts` simula una API real. Recargar reinicia los datos.

Stack: React 19 · Vite 8 · TypeScript strict · zustand 5 · react-router-dom 7
· Tailwind CSS 4 · lucide-react · bun.

## Comandos (desde la raíz del monorepo)

```sh
bun install                      # instala todo el workspace
bun run --filter client dev      # dev server con HMR
bun run --filter client build    # tsc -b + vite build
bun run lint                     # eslint desde la raíz
```

## Referencias

- Sistema de diseño: [DESIGN.md](DESIGN.md)
- Manual de estilo/testing/deploy: [AGENTS.md](AGENTS.md)
- Estructura del monorepo: [../CLAUDE.md](../CLAUDE.md)
