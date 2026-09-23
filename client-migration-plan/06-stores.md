# 06 · Stores

## Propósito

Documenta el estado global del cliente: la sesión persistida (`session.store.js`) y el diálogo de
confirmación global (`confirmation-dialog.store.js` + `ConfirmationDialog`), y fija qué estado va a un
store y cuál no. Se usa en la **Fase 3** (stores), después de los hooks: `core/service.js` y
`useLogout` leen el store de sesión, y `useMutation` abre el diálogo
([05-hooks.md](05-hooks.md#usemutation)).

Todo este documento es **base**. El único gestor de estado global es Zustand (`zustand` declarado en
[03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#packagejson)); no se usa ninguna otra
librería de estado.

## session.store.js

Path: `src/stores/session.store.js`.

```js
import {create} from 'zustand';
import {combine, createJSONStorage, persist} from 'zustand/middleware';

export const useSessionStore = create(persist(combine(
  {
    profile: null
  },
  (set) => ({
    setSession: ({profile}) => set({profile}),
    clear: () => set({profile: null})
  })
), {
  name: 'proyecto.session',
  storage: createJSONStorage(() => localStorage),
  version: 2,
  migrate: () => ({profile: null})
}));
```

**Guarda solo `profile`.** El perfil que devuelve el API al iniciar sesión: el registro del perfil con
su `user` anidado. El rol sale de `profile.user.role` y el bloqueo de `profile.user.disabled` y
`profile.user.bannedUntil`; con esos tres datos `Authorization` elige el árbol de rutas
([07-rutas-y-sesion.md](07-rutas-y-sesion.md#authorization)).

**Nunca guarda la credencial.** La sesión real es una cookie httpOnly que emite el API y que el
JavaScript del cliente no puede leer. Lo que hay en `localStorage` es un caché del perfil para pintar la
interfaz sin pedirlo en cada recarga; si ese caché miente (la sesión venció en el server), el primer 401
de cualquier petición lo vacía ([04-core.md](04-core.md#coreservicejs)).

**Dos acciones.** `setSession({profile})` la llama el callback de OAuth, que es por donde termina todo
inicio de sesión ([07-rutas-y-sesion.md](07-rutas-y-sesion.md#oauth)); `clear()` la llaman `service()`
ante un 401, `useLogout` ([05-hooks.md](05-hooks.md#uselogout)) y la pantalla de sesiones al revocar la
sesión actual. Las pantallas de edición del perfil propio actualizan el caché con
`useSessionStore.setState({profile: ...})` tras guardar
([07-rutas-y-sesion.md](07-rutas-y-sesion.md#módulos-de-cuenta-propia)). `combine` separa el estado
inicial de las acciones sin declarar tipos a mano.

**Clave `proyecto.session`.** El nombre de la entrada en `localStorage` lleva el slug del destino.

**`version: 2` + `migrate` que descarta.** Cuando cambia la forma de `profile` que espera el cliente, se
sube `version`. Al hidratar, `persist` compara la versión guardada con la del código; si difiere, llama a
`migrate`, que devuelve `{profile: null}`: el perfil persistido con la forma vieja se tira y el usuario
vuelve a entrar. No se escriben migraciones campo a campo porque el perfil es un caché que el login
reconstruye completo. En el destino, `version` arranca en el número que quieras; lo que importa es
subirlo cada vez que cambie la forma del perfil.

Fuera de React se lee y se escribe con `useSessionStore.getState()`; en un componente, con un selector
(`useSessionStore((state) => state.profile)`) para re-renderizar solo cuando cambia lo que usa.

## confirmation-dialog.store.js

Path: `src/stores/confirmation-dialog.store.js`.

```js
import {create} from 'zustand';

const useConfirmationDialogStore = create((set, get) => ({
  isOpen: false,
  title: '',
  description: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'destructive',
  data: null,
  _resolve: null,

  open: (config) => new Promise((resolve) => {
    get()._resolve?.(false);
    set({
      isOpen: true,
      title: config.title || '¿Estás seguro de realizar esta acción?',
      description: config.description || 'Esta acción no se puede deshacer.',
      confirmText: config.confirmText || 'Confirmar',
      cancelText: config.cancelText || 'Cancelar',
      variant: config.variant || 'destructive',
      data: config.data || null,
      _resolve: resolve
    });
  }),

  confirm: () => {
    get()._resolve?.(true);
    set({isOpen: false, _resolve: null});
  },

  cancel: () => {
    get()._resolve?.(false);
    set({isOpen: false, _resolve: null});
  },

  reset: () => {
    get()._resolve?.(false);
    set({isOpen: false, _resolve: null, data: null});
  }
}));

export default useConfirmationDialogStore;
```

Un solo diálogo de confirmación para toda la app, controlado por un store. `open(config)` lo muestra y
devuelve una `Promise<boolean>`: `true` si el usuario confirma, `false` si cancela. Así `useMutation`
puede escribir `await open(...)` y seguir en línea, sin callbacks ni estado local de "diálogo abierto"
en cada pantalla.

**`config`.** `{title, description, confirmText, cancelText, variant, data}`, todos opcionales, con
textos por defecto en castellano. `variant: 'destructive'` es el default porque la mayoría de las
confirmaciones son para borrar o bloquear. `data` es el payload de la mutación: `description` puede ser
una función que lo recibe.

**`open()` sobre uno pendiente lo cancela.** Antes de abrir, resuelve con `false` la promesa del diálogo
anterior, si quedó alguna. Sin eso, esa promesa quedaría colgada para siempre y el `busyRef` de la
`useMutation` que la esperaba no se liberaría.

**`_resolve` vive en el store.** Guardar la función `resolve` de la promesa es lo que conecta el click
del botón con el `await` de quien abrió. `confirm`, `cancel` y `reset` la llaman y la limpian. `reset`
además borra `data`: es lo que corre cuando el diálogo se desmonta.

## ConfirmationDialog

Path: `src/components/confirmation-dialog.jsx`.

```jsx
import {useEffect} from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import useConfirmationDialogStore from '@/stores/confirmation-dialog.store';

export default function ConfirmationDialog () {
  const {isOpen, title, description, confirmText, cancelText, variant, data, confirm, cancel, reset} =
    useConfirmationDialogStore();

  useEffect(() => {
    return () => reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resolvedDescription = typeof description === 'function' ? description(data) : description;

  return (
    <AlertDialog open={isOpen} onOpenChange={cancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{resolvedDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

Se monta una sola vez, en `App.jsx`, fuera del árbol de rutas
([07-rutas-y-sesion.md](07-rutas-y-sesion.md#appjsx)). Pinta el `AlertDialog` de `ui/`
([09-componentes.md](09-componentes.md#ui)), que es un diálogo modal de Radix: trampa de foco, Escape,
`role="alertdialog"`, título y descripción enlazados. La accesibilidad la pone el primitivo; este
componente solo le pasa el estado.

**`onOpenChange={cancel}`.** Radix llama a `onOpenChange` cuando el usuario cierra el diálogo por su
cuenta (Escape): se trata como una cancelación y la promesa resuelve `false`.

**`reset` al desmontar.** Si el componente se desmonta con un diálogo abierto, la promesa se resuelve con
`false` en vez de quedar colgada. La directiva `eslint-disable-line react-hooks/exhaustive-deps` está
porque el efecto tiene que correr solo al montar y desmontar.

**`description` como función.** `description(data)` permite que la confirmación nombre el registro
afectado sin que la pantalla arme el texto antes de llamar a `submit`.

## Qué va a Zustand

| Estado | Dónde vive | Por qué |
|---|---|---|
| Sesión (`profile`) | `stores/session.store.js` | La leen `service()`, `Authorization`, los layouts y los hooks, fuera y dentro de React, y tiene que sobrevivir a una recarga. |
| Diálogo de confirmación | `stores/confirmation-dialog.store.js` | Lo abre código que no es un componente (`useMutation` con `getState()`) y lo pinta un único componente global. |
| Datos del servidor | `useResolver` en la pantalla ([05-hooks.md](05-hooks.md#useresolver)) | Se vuelven a pedir por ruta y query string; copiarlos a un store crea una segunda verdad que se desincroniza. |
| Campos de un formulario | `useForm` ([05-hooks.md](05-hooks.md#useform)) | React Hook Form ya los guarda, valida y resetea. |
| Filtros, paginación y modal abierto | La URL: `useQueryParams` y `?modal=<ModalId>` ([10-modales-por-query.md](10-modales-por-query.md#modalwrapperjsx)) | Sobreviven a la recarga, se comparten con un enlace y el botón atrás funciona. |
| Estado de un solo componente (un menú abierto, una pestaña) | `useState` en ese componente | No lo lee nadie más. |

Un store nuevo se justifica solo si el estado cumple las dos condiciones de los dos existentes: lo leen
o escriben partes de la app que no comparten un ancestro razonable, y no es ni dato del servidor, ni
campo de formulario, ni algo que deba vivir en la URL. El archivo sigue el patrón `<nombre>.store.js`
en `src/stores/` ([02-estructura-de-carpetas.md](02-estructura-de-carpetas.md#nombres-de-archivos-y-carpetas)).

## Reglas de uso

- **Solo Zustand.** No agregues otra librería de estado global ni Context para estado que cambia.
- **No guardes datos del API en un store.** Ni listados, ni el detalle de un registro, ni un contador
  que se puede pedir. La excepción es el perfil de la sesión, que es un caché que el login reconstruye.
- **Nunca guardes un token ni una credencial en `localStorage`.** La sesión es la cookie httpOnly.
- **Sube `version` cuando cambie la forma de `profile`.** Si no, un usuario con el perfil viejo en
  `localStorage` entra con datos que el código ya no entiende.
- **Para pedir confirmación usa `useMutation`** (o `useConfirmationDialogStore.getState().open()` si no
  hay mutación). No montes un `AlertDialog` propio por pantalla para confirmar.
- **Un solo `ConfirmationDialog`, montado en `App.jsx`.** Dos instancias compiten por la misma promesa.
- **En componentes, lee el store con selector.** `useSessionStore()` sin selector re-renderiza con
  cualquier cambio.

## Checklist del ejecutor

- [ ] `src/stores/session.store.js` copiado con `name: 'proyecto.session'` (slug del destino),
      `version` y `migrate` que devuelve `{profile: null}`.
- [ ] La forma de `profile` que devuelve el API del destino trae `user.role`, `user.disabled` y
      `user.bannedUntil`; si no, se ajusta `Authorization` en la Fase 6.
- [ ] `src/stores/confirmation-dialog.store.js` copiado completo.
- [ ] `src/components/confirmation-dialog.jsx` copiado completo; `ui/alert-dialog.jsx` existe.
- [ ] `ConfirmationDialog` montado una sola vez en `App.jsx` (Fase 6).
- [ ] Ningún archivo de `src/` escribe en `localStorage` salvo `session.store.js` (el proveedor de tema
      guarda su preferencia por su cuenta, ver [09-componentes.md](09-componentes.md#tema)).
- [ ] `zustand` declarado en `package.json`; ninguna otra librería de estado global instalada.
