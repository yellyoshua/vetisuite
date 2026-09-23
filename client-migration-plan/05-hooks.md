# 05 · Hooks

## Propósito

Documenta los hooks compartidos de `src/hooks/`: leer del API (`useResolver`), enviar un formulario
(`useForm`), disparar una mutación suelta (`useMutation`), llevar filtros y paginación en la URL
(`useQueryParams`), cerrar sesión (`useLogout`) y, como pieza opcional, sondear notificaciones
(`useNotifications`). Se usa en la **Fase 2** (core y hooks), después de
[04-core.md](04-core.md#coreservicejs): todos los hooks consumen `service()` y su forma de error.

Todos son **base** salvo `use-notifications.js` y su service, que son **opcionales**.

Dependencias que deben estar declaradas: `react-router`, `react-hook-form`, `@hookform/resolvers`,
`zod`, `sonner` y `react-use` ([03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#packagejson)).

## useResolver

Path: `src/hooks/use-resolver.js`.

```js
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useParams, useSearchParams} from 'react-router';

const PRIMITIVES = {true: true, false: false, null: null};

export default function useResolver (resolvers) {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState(() => ({data: {}, errors: {}, isLoading: Object.keys(resolvers).length > 0}));

  const query = withoutModalParam(searchParams).toString();
  const routeParams = JSON.stringify(params);

  const search = useMemo(() => decodeSearch(query), [query]);

  const contextRef = useRef();
  const resolversRef = useRef();
  const pendingRef = useRef(new Map());
  const lastIdRef = useRef(0);

  contextRef.current = {params, search};
  resolversRef.current = resolvers;

  const load = useCallback((key) => {
    const id = lastIdRef.current + 1;
    const context = contextRef.current;

    lastIdRef.current = id;
    pendingRef.current.set(key, id);

    const settle = (value, error) => {
      if (pendingRef.current.get(key) !== id) {
        return;
      }

      pendingRef.current.delete(key);

      setState((current) => ({
        data: error ? current.data : {...current.data, [key]: value},
        errors: {...current.errors, [key]: error},
        isLoading: pendingRef.current.size > 0
      }));
    };

    return invoke(resolversRef.current, key, context)
    .then((value) => settle(value, null))
    .catch((failure) => settle(null, failure.error || failure.message || 'No se pudo cargar la información'));
  }, []);

  const refetch = useCallback((...keys) => {
    const targets = keys.length > 0 ? keys : Object.keys(resolversRef.current);
    const requests = targets.map((key) => load(key));

    setState((current) => ({...current, isLoading: pendingRef.current.size > 0}));

    return Promise.all(requests);
  }, [load]);

  useEffect(() => {
    refetch();
  }, [routeParams, query, refetch]);

  return {
    data: state.data,
    error: Object.values(state.errors).find(Boolean) || null,
    isLoading: state.isLoading,
    refetch
  };
}

async function invoke (resolvers, key, context) {
  const resolver = resolvers[key];

  if (typeof resolver !== 'function') {
    throw new Error(`No existe el resolver "${key}"`);
  }

  return resolver(context.params, context.search);
}

function withoutModalParam (searchParams) {
  const filtered = new URLSearchParams(searchParams);

  filtered.delete('modal');

  return filtered;
}

function decodeSearch (query) {
  const entries = [...new URLSearchParams(query)]
  .map(([key, value]) => [key, decodePrimitive(value)]);

  return Object.fromEntries(entries);
}

function decodePrimitive (value) {
  if (Object.hasOwn(PRIMITIVES, value)) {
    return PRIMITIVES[value];
  }

  return decodeNumber(value);
}

function decodeNumber (value) {
  const trimmed = value.trim();
  const parsed = Number(trimmed);

  if (trimmed === '' || !Number.isFinite(parsed) || String(parsed) !== trimmed) {
    return value;
  }

  return parsed;
}
```

Es la única forma en que una pantalla lee del API. Recibe un objeto `clave → función que devuelve una
promesa` (el `resolvers.js` del módulo), dispara todas las claves al montar y devuelve `data` con esas
mismas claves. Los resolvers son llamadas directas a un service, que ya desempaqueta el envelope y lanza
al fallar. La forma de `page.jsx` + `resolvers.js` está en
[08-modulos.md](08-modulos.md#pagejsx-y-resolversjs).

```js
import itemsService from './items.service';

export default {
  items: (params, search) => itemsService.get({search: search.search, page: search.page})
};
```

**La ruta la lee el hook, no el componente.** Cada resolver recibe `(params, search)`: los params
dinámicos de react-router (`params.id` en `/items/edit/:id`) y el query string ya decodificado. Cuando
cualquiera de los dos cambia (paginar, buscar, navegar a otro `:id`) se vuelve a pedir todo. Por eso los
filtros viven en la URL: cambiar la URL es lo que vuelve a llamar al API.

**Dependencias como strings.** `useParams()` y `useSearchParams()` devuelven identidades nuevas en cada
render; si fueran la dependencia del efecto, el hook pediría en bucle. El efecto depende de
`JSON.stringify(params)` y del query string serializado, que solo cambian cuando cambia su contenido.

**`modal` queda fuera del query.** `modal` es el parámetro reservado de los modales por query
(`?modal=<ModalId>`) y ningún resolver lo lee. Sin este filtro, abrir o cerrar un modal encima de una
pantalla la haría releer todo y parpadear al pasar por `isLoading` por un cambio de URL que no tiene
nada que ver con los datos. El detalle está en
[Acoplamiento con los modales por query](05-hooks.md#acoplamiento-con-los-modales-por-query).

**`search` llega con primitivos.** `?page=2&active=true` llega como `{page: 2, active: true}`. `true`,
`false` y `null` se buscan en `PRIMITIVES` con `Object.hasOwn` y no con `in`: con `in`,
`?x=constructor` devolvería una función heredada del prototipo. Un número solo se convierte si sobrevive
la ida y vuelta (`String(Number(x)) === x`): así `?search=0912345678` llega como el string
`'0912345678'` y conserva el cero de la izquierda, y lo mismo pasa con `1e5` o `12.50`; `page=2` sigue
llegando como `2`, que es para lo que existe la conversión. `Number.isFinite` deja fuera `'NaN'` e
`'Infinity'`, que sí pasan la ida y vuelta.

**Un solo indicador.** `isLoading` significa "queda alguna clave en vuelo": la carga inicial y un
`refetch` comparten el flag. `pendingRef` guarda `clave → id de su petición viva` e `isLoading` es
exactamente "ese mapa no está vacío". Sin claves no hay nada en vuelo, así que el estado inicial arranca
en `isLoading: false` para las pantallas con `resolvers.js` vacío (`export default {}`), que de otro
modo harían parpadear el spinner.

**Una respuesta vieja no gana.** Si una clave se vuelve a pedir antes de que termine la anterior, la
respuesta que llega tarde se descarta en `settle`: la dueña de la clave es la petición viva. Esto evita
que una búsqueda lenta pise el resultado de la búsqueda siguiente.

**`error` es un texto.** No es un estado aparte: es el primer mensaje de error de cualquier clave, listo
para `PageError` ([09-componentes.md](09-componentes.md#pagestate)). `service()` lanza `{status, error}` y
un resolver propio puede lanzar un `Error`; por eso se lee `failure.error || failure.message`.

**`invoke` es `async` a propósito.** Todo lo que puede salir mal al invocar un resolver tiene que llegar
al estado de error de la pantalla, no escaparse por el efecto y tumbar el árbol de React: una clave mal
escrita en `refetch('clavequenoexiste')`, un resolver que lanza antes de devolver la promesa, o un
resolver sin `async` que devuelve un valor suelto (`() => useSessionStore.getState().profile`), que no
tiene `.then`. `async` convierte el `throw` en rechazo y envuelve el valor suelto en una promesa.

**`refetch(...keys)` nunca falla.** `refetch()` pide todas las claves y `refetch('items')` solo esa.
Devuelve una promesa que siempre se resuelve (el error queda en el estado), para encadenarla después de
una mutación sin `try/catch`. Hace un solo `setState` por llamada, y con cero claves apaga el flag en vez
de dejarlo colgado. `refetch` es estable entre renders: lee los resolvers y el contexto del render
actual desde `resolversRef` y `contextRef`, no desde un closure viejo.

**Claves fijas.** El juego de claves tiene que ser el mismo en todos los renders. Una clave condicional
(`...(isAdmin && {members: …})`) que aparece después del montaje no se dispara sola: se pide con
`refetch('members')`.

## useForm

Path: `src/hooks/use-form.js`.

```js
import {toast} from 'sonner';
import {useForm as useHookForm} from 'react-hook-form';
import {useNavigate} from 'react-router';
import {zodResolver} from '@hookform/resolvers/zod';
import {useRef, useState} from 'react';
import logger from '@/lib/logger';

export default function useForm (content, {onSubmit, schema, redirectTo, onSuccess, successMessage, disableToast}) {
  const navigate = useNavigate();
  const form = useHookForm({values: content, shouldFocusError: true, mode: 'onChange', resolver: zodResolver(schema)});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const busyRef = useRef(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (busyRef.current) {
      return;
    }

    busyRef.current = true;

    const isValid = await form.trigger();

    if (!isValid) {
      busyRef.current = false;
      logger.warning('[useForm] Validation errors', {fields: Object.keys(form.formState.errors)});

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await onSubmit(form.getValues());

      if (!disableToast) {
        toast.success(successMessage || 'Operación realizada correctamente');
      }

      if (onSuccess) {
        onSuccess(response);

        return;
      }

      if (redirectTo) {
        navigate(redirectTo);

        return;
      }

      form.reset(content);
    } catch (failure) {
      logger.error('[useForm] Falló el envío', failure);

      const message = failure.error || failure.message || 'Ocurrió un error inesperado';

      setError({message, fields: failure.fields});

      if (!disableToast) {
        toast.error(message);
      }

      applyServerFieldErrors(form, message, failure.fields);
    } finally {
      busyRef.current = false;
      setIsSubmitting(false);
    }
  };

  return {
    control: form.control,
    watch: form.watch,
    setValue: form.setValue,
    trigger: form.trigger,
    reset: form.reset,
    formState: form.formState,
    isSubmitting,
    handleSubmit,
    error
  };
}

function applyServerFieldErrors (form, message, fields) {
  if (!Array.isArray(fields)) {
    return;
  }

  fields.forEach((name, index) => {
    form.setError(name, {type: 'server', message}, {shouldFocus: index === 0});
  });
}
```

Formulario contra el API: React Hook Form + Zod + una función de un service. El uso típico:

```jsx
const {control, handleSubmit, isSubmitting} = useForm(item, {
  schema: updateItemSchema,
  onSubmit: (body) => itemsService.put({id: item.id, ...body}),
  redirectTo: '/items',
  successMessage: 'Registro actualizado correctamente'
});
```

Los componentes de campo que reciben `control` están en
[09-componentes.md](09-componentes.md#formularios).

**Parámetros.** `content` son los valores iniciales y también los valores a los que vuelve el
formulario tras un éxito. `onSubmit` es la petición: recibe los valores validados y devuelve lo que
devuelve `service()`. `schema` es el schema Zod que valida antes de enviar
([08-modulos.md](08-modulos.md#schema)). `successMessage` es el texto del toast de éxito y
`disableToast` apaga los toasts de éxito y de error.

**`values: content`.** React Hook Form sincroniza el formulario cuando `content` cambia, así que una
pantalla de edición puede pasar directamente el dato del resolver.

**Latch `busyRef`.** `isSubmitting` se enciende recién después del `await form.trigger()`, y entre el
click y esa línea hay un hueco de varios frames por el que pasaría un segundo submit: dos POST idénticos
con un doble click. El `ref` se enciende de forma síncrona en la primera línea útil y cierra ese hueco;
se apaga en `finally`, o antes si la validación falla.

**El log de validación lleva solo nombres de campos.** `logger.warning` registra
`Object.keys(form.formState.errors)` y nunca `getValues()`: los valores incluyen contraseñas y su
confirmación, y el error de validación más común (la confirmación que no coincide) volcaría ambas
contraseñas en claro a la consola de un navegador que puede estar compartiendo pantalla.

**Después del éxito, en este orden.**
1. Toast de éxito, salvo `disableToast`.
2. Si hay `onSuccess`, se llama con el payload del API y **se queda con el control**: el hook ni navega
   ni resetea el formulario. Es el gancho para releer (el `refetch` del `useResolver` de la pantalla) o
   para irse a mano.
3. Si no hay `onSuccess` y hay `redirectTo`, navega con react-router. `redirectTo` es solo para rutas
   internas de la SPA. Salir del documento (una pasarela externa, el redireccionamiento de un proveedor
   OAuth) no es esto: se hace en `onSuccess` con `window.location`.
4. Si no hay ninguno de los dos, resetea el formulario a `content`. El reset es para el formulario que
   se queda en pantalla: si la pantalla se va, vaciar los campos solo haría parpadear el formulario
   mientras arranca la navegación.

**Después de un error.** Se registra con el logger, se guarda `{message, fields}` en `error`, se muestra
el toast (salvo `disableToast`) y se marcan los campos. `failure.error` es el mensaje que manda el API,
ya listo para mostrarse; un fallo que no trae `error` (un `Error` lanzado por código propio) usa
`failure.message`, y si no hay ninguno cae en el mensaje genérico.

**`applyServerFieldErrors`.** El API manda solo los NOMBRES de los campos que rechazó su validación,
nunca los mensajes (no expone la estructura de su schema). Por eso cada campo se marca con el mensaje
general del error, con `type: 'server'`, y el foco va al primero. Sin esto, un 400 de validación del
server saldría solo por toast y el formulario quedaría pintado como válido: el usuario leería el error
sin saber qué campo arreglar.

## useMutation

Path: `src/hooks/use-mutation.js`.

```js
import {toast} from 'sonner';
import {useRef, useState} from 'react';
import logger from '@/lib/logger';
import useConfirmationDialogStore from '@/stores/confirmation-dialog.store';

export default function useMutation (request, {onSuccess, onError, confirm, skipConfirm, successMessage, disableToast} = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const busyRef = useRef(false);

  const submit = async (data) => {
    if (busyRef.current) {
      return;
    }

    busyRef.current = true;

    const confirmed = skipConfirm || await useConfirmationDialogStore.getState().open({...confirm, data});

    if (!confirmed) {
      busyRef.current = false;

      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await request(data);

      if (!disableToast) {
        toast.success(successMessage || 'Operación realizada correctamente');
      }

      onSuccess?.(response);
    } catch (failure) {
      logger.error('[useMutation] Falló la mutación', failure);

      const message = failure.error || failure.message || 'Ocurrió un error inesperado';

      setError({message, fields: failure.fields});

      if (!disableToast) {
        toast.error(message);
      }

      onError?.({message, fields: failure.fields});
    } finally {
      busyRef.current = false;
      setIsLoading(false);
    }
  };

  return [isLoading, submit, error];
}
```

Mutación suelta, sin formulario: un botón, una acción de una fila, el botón de confirmar de un modal.
`request` recibe lo que se le pasa a `submit` y devuelve lo que devuelve `service()`:

```jsx
const [isLoading, removeItem] = useMutation((id) => itemsService.remove({id}), {
  confirm: {title: '¿Eliminar este registro?'},
  successMessage: 'Registro eliminado correctamente',
  onSuccess: () => refetch()
});
```

**Pide confirmación por defecto.** Antes de enviar abre el diálogo global de
[06-stores.md](06-stores.md#confirmation-dialogstorejs) con las props de `confirm` y espera su promesa.
Si el usuario cancela no se envía nada. `data` viaja al diálogo para que la descripción pueda ser una
función del dato (`description: (item) => ...`). `skipConfirm: true` envía directo: es lo que usan las
acciones que ya tienen su propio paso de confirmación (un modal) o que no destruyen nada.

**Latch `busyRef`.** Mismo motivo que en `useForm`: el `ref` síncrono impide que un doble click dispare
dos peticiones idénticas antes de que `isLoading` llegue al render. El latch también cubre el tiempo en
que el diálogo de confirmación está abierto.

**Devuelve una tupla.** `[isLoading, submit, error]`, para nombrarla según la acción
(`[isRemoving, removeItem]`). `onSuccess` recibe el payload del API ya desempaquetado y `onError`
recibe `{message, fields}`; los toasts siguen las mismas reglas que en `useForm`.

`useForm` y `useMutation` repiten a propósito el bloque `try/catch/finally`: cada uno se lee de arriba
a abajo en un solo `async` y no comparten helper. ESLint les sube `max-statements` a 30 solo a estos dos
archivos para no forzar esa abstracción
([03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#eslint)).

## useQueryParams

Path: `src/hooks/use-query-params.js`.

```js
import {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'react-router';
import {useDebounce} from 'react-use';

export default function useQueryParams () {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryParams, setQueryParams] = useState(searchParams);

  const [, cancel] = useDebounce(() => {
    if (queryParams === searchParams) {
      return;
    }

    setSearchParams(queryParams, {replace: true});
  }, 600, [queryParams]);

  useEffect(() => {
    setQueryParams((current) => {
      return current.toString() === searchParams.toString() ? current : searchParams;
    });
  }, [searchParams]);

  const changeQuery = (query = {}) => {
    const params = new URLSearchParams(queryParams);

    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);

        return;
      }

      if (params.has(key)) {
        params.delete(key);
      }
    });

    setQueryParams(params);
  };

  const nextPage = () => {
    const page = queryParams.get('page') || 1;
    changeQuery({page: parseInt(page, 10) + 1});
  };

  const prevPage = () => {
    const page = queryParams.get('page') || 1;
    changeQuery({page: Math.max(parseInt(page, 10) - 1, 0)});
  };

  const search = (value) => {
    changeQuery({search: value, page: null});
  };

  const query = useMemo(() => {
    return Object.fromEntries(queryParams.entries());
  }, [queryParams]);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    changeQuery,
    nextPage,
    prevPage,
    search,
    query
  };
}
```

Filtros y paginación en el query string. Lo usa el componente de un listado; los resolvers leen el
resultado desde `search` ([useResolver](05-hooks.md#useresolver)).

```jsx
const {nextPage, prevPage, search, query} = useQueryParams();
const currentPage = Number(query.page) || 1;
```

**Escritura diferida a 600 ms.** `changeQuery` cambia un estado local (`queryParams`) y `useDebounce`
lo lleva a la URL 600 ms después del último cambio: teclear en el buscador no dispara una lectura por
tecla. `query` se deriva del estado local, así que la pantalla ve el valor nuevo al instante aunque la
URL todavía no haya cambiado.

**`replace`.** La URL se escribe con `replace: true` para no llenar el historial con una entrada por
búsqueda o por página.

**No re-pide a mano.** `useResolver` tiene el query string como dependencia: cambiar la URL es lo que
vuelve a llamar al API. Ni el componente ni este hook llaman a `refetch` al paginar o buscar.

**Sincronización con la URL.** El estado inicial es la misma referencia que `searchParams`, y el
debounce compara por referencia para no hacer un `replace` inútil al montar. El efecto sobre
`searchParams` re-sincroniza el estado local tras una navegación que solo cambia el query (atrás y
adelante del navegador) mientras el componente sigue montado. Al desmontar se cancela el debounce
pendiente para no escribir en la URL de otra pantalla.

**`changeQuery` quita las claves falsy.** Un valor vacío, `0`, `null` o `false` borra la clave.
Consecuencias:
- `prevPage` nunca baja de la página 1: desde la página 1 calcula `0`, que es falsy, y la clave `page`
  se quita, que es la página 1.
- `search(value)` reinicia la paginación: manda `page: null`, que quita `page` de la URL, y sin `page`
  el API devuelve la primera página.
- Un filtro booleano `false` no se puede expresar con el booleano: se manda como el string `'false'`,
  que `useResolver` decodifica de vuelta a `false`.

## useLogout

Path: `src/hooks/use-logout.js`.

```js
import useMutation from '@/hooks/use-mutation';
import logoutService from '@/modules/auth/logout.service';
import {useSessionStore} from '@/stores/session.store';

export default function useLogout () {
  const endSession = () => {
    useSessionStore.getState().clear();
    window.location.assign('/');
  };

  return useMutation(() => logoutService.post({}), {
    skipConfirm: true,
    successMessage: 'Sesión cerrada correctamente',
    onSuccess: endSession,
    onError: endSession
  });
}
```

Cerrar sesión: el server revoca la sesión y vence la cookie httpOnly; el cliente solo tira el perfil
cacheado, que es lo único que guarda ([06-stores.md](06-stores.md#sessionstorejs)). El service y los
puntos donde se llama están en [07-rutas-y-sesion.md](07-rutas-y-sesion.md#logout).

**Salir es incondicional.** `endSession` corre tanto en `onSuccess` como en `onError`. Si saliera solo
en `onSuccess`, un logout con la red caída, un 500 o una sesión ya vencida (401) dejaría al usuario
dentro del panel creyendo que cerró sesión. Revocar en el server es el mejor esfuerzo; vaciar el store
local no depende de que el server conteste.

**Navegación dura a `/`.** Sin sesión, la raíz de la app es el login
([07-rutas-y-sesion.md](07-rutas-y-sesion.md#archivos-de-rutas)). Se usa `window.location.assign` y no
`navigate()` para recargar el documento y tirar cualquier estado en memoria que se haya llenado con la
sesión anterior.

Devuelve la tupla de `useMutation`: `const [isLoggingOut, logout] = useLogout();`.

## useNotifications (opcional)

Condición: el API del destino expone el endpoint `notifications` (lectura con `GET` y marcado como
leídas con `PUT`). Si no existe, no transportes este hook, su service ni el listener.

Path: `src/modules/notifications/notifications.service.js`.

```js
import service from '@/core/service';

export default service('notifications');
```

Es un módulo sin rol y sin pantalla: las notificaciones son cromo del panel (la campana del header), no
una ruta. Existe solo para alojar el service, que consumen este hook y el listener de todos los roles.

Path: `src/hooks/use-notifications.js`.

```js
import {useState, useCallback, useRef, useEffect} from 'react';
import {useInterval} from 'react-use';
import {toast} from 'sonner';
import {useSessionStore} from '@/stores/session.store';
import notificationsService from '@/modules/notifications/notifications.service';

const POLL_MS = 60000;

async function fetchNotifications () {
  const response = await notificationsService.get().catch(() => null);

  return response?.notifications || [];
}

export default function useNotifications () {
  const [notifications, setNotifications] = useState([]);
  const seenRef = useRef(new Set());
  const requestRef = useRef(0);
  const firstLoadRef = useRef(true);
  const hasSession = useSessionStore((state) => Boolean(state.profile));

  const refresh = useCallback(async () => {
    requestRef.current += 1;
    const requestId = requestRef.current;
    const items = await fetchNotifications();

    if (requestId !== requestRef.current) {
      return;
    }

    const fresh = items.filter((item) => !seenRef.current.has(item.id));

    items.forEach((item) => seenRef.current.add(item.id));
    setNotifications(items);

    if (firstLoadRef.current) {
      firstLoadRef.current = false;

      return;
    }

    fresh.forEach((item) => toast.info(item.title, {description: item.body}));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useInterval(refresh, hasSession ? POLL_MS : null);

  const unreadCount = notifications.filter((item) => !item.readAt).length;

  return {notifications, unreadCount, refresh};
}
```

Devuelve `{notifications, unreadCount, refresh}`. El componente que lo monta (la campana con su lista y
el botón de marcar como leídas) está en
[07-rutas-y-sesion.md](07-rutas-y-sesion.md#notificaciones-opcional).

**Polling, no tiempo real.** Pide al montar y después cada 60000 ms con `useInterval`, solo mientras hay
sesión (`useInterval` con `null` se detiene). No hay WebSocket ni SSE: un minuto de demora alcanza para
avisos del panel y no agrega infraestructura.

**Toast solo para lo nuevo.** `seenRef` guarda los ids ya vistos. La primera carga llena ese conjunto
sin mostrar toasts (lo que ya estaba al entrar no es novedad); desde la segunda, cada id que no estaba
se anuncia con `toast.info(title, {description: body})`.

**Respuesta vieja descartada.** `requestRef` numera cada `refresh`; si llega la respuesta de uno que ya
no es el último (un `refresh` manual tras marcar como leídas se cruza con el del intervalo), se ignora.

**Un fallo no rompe el panel.** `fetchNotifications` convierte cualquier error en una lista vacía: las
notificaciones son accesorias y no muestran toast de error.

La forma de cada notificación es `{id, title, body, readAt}`: `unreadCount` cuenta las que no tienen
`readAt`.

## Acoplamiento con los modales por query

El modal por query y los hooks de datos comparten la URL, y tres decisiones evitan que se pisen.
Primera: `useResolver` quita `modal` del query string antes de usarlo como dependencia, así que abrir o
cerrar un modal no vuelve a pedir los datos de la pantalla ni la hace pasar por `PageLoading`; solo se
quita `modal`, y los parámetros extra que se pasan a `openModal` sí cuentan como un cambio del query
string ([10-modales-por-query.md](10-modales-por-query.md#parámetros-extra)). Segunda: `useQueryParams`
escribe la URL con `replace` 600 ms después del último cambio, y el cierre del modal por `onClose`
también escribe con `replace`, así que ninguno deja en el historial una entrada que el botón atrás
repita o que reabra el modal. Tercera: el efecto que lleva el foco al panel del modal depende solo de
`isOpen`; si dependiera de `handleClose`, que cambia con cada `searchParams`, la escritura diferida de
`useQueryParams` volvería a ejecutarlo 600 ms después y le robaría el foco al campo en el que el usuario
está escribiendo dentro del modal.

La mitad del modal de este acoplamiento está en
[10-modales-por-query.md](10-modales-por-query.md#el-parámetro-modal-y-useresolver).

## Reglas de uso

- **Una pantalla lee del API solo con `useResolver`.** Nada de `useEffect` + `service().get()` en un
  componente: se pierden el estado de carga único, el descarte de respuestas viejas y la relectura por
  cambio de URL.
- **No llames a `refetch` después de cambiar filtros o página.** Cambia la URL con `useQueryParams`;
  `useResolver` vuelve a pedir solo. Llama a `refetch` después de una mutación.
- **Claves fijas en `resolvers.js`.** Nada de claves condicionales; si una clave se pide bajo demanda,
  usa `refetch('<clave>')`.
- **No leas `modal` en un resolver.** Es del sistema de modales y el hook lo quita a propósito.
- **Formularios con `useForm`; acciones sueltas con `useMutation`.** No uses `useMutation` para enviar un
  formulario: se pierden la validación Zod y el marcado de campos del server.
- **`onSuccess` o `redirectTo`, no ambos.** Con `onSuccess` el hook ignora `redirectTo`. Si necesitas
  releer y navegar, hazlo dentro de `onSuccess`.
- **`redirectTo` solo para rutas de la SPA.** Para salir del documento usa `window.location` dentro de
  `onSuccess`.
- **Nunca registres valores de formulario.** Ni en `logger` ni en `console`.
- **`skipConfirm` solo cuando ya hubo confirmación o la acción no destruye nada.** El default de
  `useMutation` es preguntar.
- **Un booleano `false` en la URL va como `'false'`.** `changeQuery` borra las claves falsy.
- **Cerrar sesión siempre con `useLogout`.** Nunca `clear()` solo, ni `navigate('/sign-in')`.

## Checklist del ejecutor

- [ ] `src/hooks/use-resolver.js` copiado completo; el filtro de `modal` y la decodificación con
      `Object.hasOwn` y la ida y vuelta de números están intactos.
- [ ] `src/hooks/use-form.js` copiado completo, con `busyRef` y `applyServerFieldErrors`.
- [ ] `src/hooks/use-mutation.js` copiado completo; importa el store de
      [06-stores.md](06-stores.md#confirmation-dialogstorejs).
- [ ] `src/hooks/use-query-params.js` copiado completo, con debounce de 600 ms y `replace: true`.
- [ ] `src/hooks/use-logout.js` copiado completo; `endSession` en `onSuccess` y en `onError`.
- [ ] `src/modules/auth/logout.service.js` existe ([07-rutas-y-sesion.md](07-rutas-y-sesion.md#logout)).
- [ ] Decisión escrita sobre `useNotifications`: entra solo si el API expone `notifications`; si entra,
      `use-notifications.js` y `modules/notifications/notifications.service.js` están copiados.
- [ ] `react-router`, `react-hook-form`, `@hookform/resolvers`, `zod`, `sonner` y `react-use` están en
      `package.json`.
- [ ] El override de ESLint con `max-statements` 30 para `use-form.js` y `use-mutation.js` existe.
- [ ] Ninguna pantalla hace `fetch` ni llama a un service dentro de un `useEffect`.
