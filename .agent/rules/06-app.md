---
trigger: always_on
---

# App (`app/`)

SPA de los paneles. React puro sobre HTTP: sin Server Actions, `action()`, `useActionState` ni
`startTransition`.

## Pantalla

- `modules/<rol>/<feature>/page.jsx` + `resolvers.js` (siempre, aunque vacío) + su
  `<feature>.service.js`, registrada en el árbol de rutas de su rol.
- Componentes propios de la pantalla en su `components/`; reutilizables en `src/components/`.
- Separado por rol aunque apunte al mismo endpoint. **No se abstrae entre perfiles**; solo los campos
  de formulario se comparten.

## Datos

- Toda llamada al API sale de un `*.service.js` construido con `service()`. Ninguna pantalla hace
  `fetch` propio.
- Leer al montar → `useResolver`. Formulario → `useForm`. Botón o item → `useMutation`.
- Nada de `useState` para campos de formulario; nada de `useEffect` que reaccione al resultado de
  una mutación.
- `onSuccess` presente se queda con el control: el hook no navega ni resetea detrás de él.
- Salir del documento (pasarela de pago, 302 de OAuth) va en `onSuccess` con `window.location`;
  `redirectTo` es solo ruta de react-router.
- Los hooks de mutación no comparten helper entre ellos: si algo se repite, se repite.

## Estado

- Sesión: única puerta `useSessionStore`. Guarda el perfil, **nunca la credencial**.
- Zustand para estado de app, Jotai para atómico local. Derivá con `useMemo` en vez de duplicar estado.

## UI

- Tailwind como única solución de estilos; iconos `lucide-react` con import explícito.
- `<img>` nativo contra `/api/files/…`; no hay optimizador.
- Accesibilidad no es opcional: HTML semántico, `label` en cada input, ARIA donde aplique, foco
  gestionado en modales.
- Cada pantalla contempla sus tres estados: cargando, error y vacío.
