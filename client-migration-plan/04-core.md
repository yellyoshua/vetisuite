# 04 · Core

## Propósito

Documenta la única puerta de salida al API (`core/service.js`) y los helpers puros de `lib/` que usa
todo el cliente: clases CSS, URL de imágenes, iniciales, logger, etiqueta del dispositivo y formato de
fechas. Se usa en la **Fase 2** (core y hooks), antes de escribir cualquier hook: todos los hooks de
[05-hooks.md](05-hooks.md#useresolver) y todos los services de módulo dependen de esta pieza.

`core/upload.js`, la otra puerta de salida (hacia el bucket), se documenta en
[11-subida-de-archivos.md](11-subida-de-archivos.md#coreuploadjs).

Todo este documento es **base**. `lib/environment.js`, del que dependen `service.js` y `utils.js`,
se crea en la Fase 1: [03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#libenvironmentjs).

## core/service.js

Path: `src/core/service.js`.

```js
import {apiDomain} from '@/lib/environment';
import {useSessionStore} from '@/stores/session.store';

export default function service (path) {
  const base = `${apiDomain}/api/${path}`;

  return {
    get: (query) => send('GET', withQuery(base, query)),
    getOne: async (query) => (await send('GET', withQuery(base, query)))?.[0] ?? null,
    post: (body) => send('POST', base, body),
    put: (body) => send('PUT', base, body),
    remove: (query) => send('DELETE', withQuery(base, query))
  };
}

async function send (method, url, body) {
  const options = bodyOptions(body);

  const response = await fetch(url, {
    method,
    cache: 'no-store',
    credentials: 'include',
    ...options
  }).catch(() => {
    throw {status: 0, error: 'No se pudo conectar con el servidor. Revisa tu conexión a internet.'};
  });

  const envelope = await response.json().catch(() => ({}));

  if (response.status === 401) {
    useSessionStore.getState().clear();
  }

  if (!response.ok || envelope.errors) {
    throw {
      status: response.status,
      error: envelope.errors?.[0] || 'Ocurrió un error inesperado',
      fields: envelope.fields
    };
  }

  return envelope.response;
}

function bodyOptions (body) {
  if (body === undefined) {
    return {};
  }

  if (body instanceof FormData) {
    return {body};
  }

  return {headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)};
}

function withQuery (url, query) {
  const entries = Object.entries(query || {})
  .filter(([, value]) => value !== undefined && value !== null && value !== '');

  if (entries.length === 0) {
    return url;
  }

  return `${url}?${new URLSearchParams(entries).toString()}`;
}
```

Cada feature crea su service con una línea (`export default service('items');`) y el resto del
cliente habla con el API solo a través de esas cinco funciones. El detalle de dónde vive cada service
está en [08-modulos.md](08-modulos.md#service-por-feature).

**Un path, cinco verbos.** `service(path)` apunta a `${apiDomain}/api/${path}`. `get`, `getOne` y
`remove` mandan su argumento como query string; `post` y `put` lo mandan como cuerpo. No hay rutas
anidadas ni ids en el path: el id viaja en el query (`remove({id})`) o en el cuerpo (`put({id, ...})`).
`getOne` es un `get` que devuelve el primer elemento de la lista o `null`, para las pantallas de
detalle y edición que piden un solo registro filtrando por id.

**Desempaqueta el envelope.** El API siempre responde `{response, errors, fields}` (el contrato está en
[01-arquitectura.md](01-arquitectura.md#contrato-del-api)). `send` devuelve solo `envelope.response`,
así que un resolver o un `onSubmit` recibe el dato pelado. Si la respuesta no es `ok` o trae `errors`,
lanza un objeto plano `{status, error, fields}`: `error` es el primer mensaje del API, listo para
mostrarse, y `fields` es la lista de nombres de campos rechazados que usa
[`useForm`](05-hooks.md#useform). Se lanza un objeto y no un `Error` porque los consumidores leen
`failure.error`, no una pila.

**Red caída.** Si `fetch` rechaza (sin red, DNS, CORS) se lanza `{status: 0, error}` con un mensaje en
castellano. `status: 0` distingue "no llegó al server" de cualquier código HTTP.

**Cuerpo que no es JSON.** `response.json().catch(() => ({}))` deja el envelope vacío si el server
responde sin cuerpo o con HTML (un 502 del balanceador): el flujo cae en el mensaje genérico en vez de
romper con un error de parseo.

**401 cierra la sesión local.** Cualquier 401 vacía el store de sesión. Al quedar `profile` en `null`,
`Authorization` cambia al árbol de rutas sin sesión y el usuario ve el login
([07-rutas-y-sesion.md](07-rutas-y-sesion.md#authorization)). No hay redirección manual ni interceptor:
la sesión vencida se resuelve en un solo lugar.

**`credentials: 'include'`.** La credencial es una cookie httpOnly que emite el API en otro subdominio;
sin `include` el navegador no la manda en peticiones cross-origin. El cliente nunca ve ni guarda un
token ([06-stores.md](06-stores.md#sessionstorejs)).

**`cache: 'no-store'`.** Cada lectura va al server. El cliente no tiene capa de caché: los datos se
vuelven a pedir cuando cambia la ruta o el query string ([05-hooks.md](05-hooks.md#useresolver)).

**`FormData` sin `Content-Type`.** Con un `FormData` el navegador arma el header con el `boundary`
del multipart; fijarlo a mano lo rompe. Todo lo demás se serializa como JSON.

**Query sin vacíos.** `withQuery` descarta `undefined`, `null` y `''`. Una pantalla puede pasar
`{search: search.search, page: search.page}` sin preguntar si existen: un buscador vacío no manda
`search=` y la primera página no manda `page`.

## lib/utils.js

Path: `src/lib/utils.js`.

```js
import {clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';
import {apiDomain} from '@/lib/environment';

export function cn (...inputs) {
  return twMerge(clsx(inputs));
}

export function getPictureSrc (picture) {
  if (!picture) {
    return undefined;
  }

  if (['http://', 'https://', 'data:', 'blob:', '/'].some((prefix) => picture.startsWith(prefix))) {
    return picture;
  }

  return `${apiDomain}/api/files/${picture}`;
}

export function getInitials (...parts) {
  return parts
  .flat()
  .filter(Boolean)
  .map((part) => String(part).trim())
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0].toUpperCase())
  .join('');
}
```

**`cn`.** Combina clases condicionales (`clsx`) y resuelve conflictos de Tailwind (`twMerge`: si llegan
`p-2` y `p-4`, gana la última). Es el helper que esperan los componentes de `ui/`
([09-componentes.md](09-componentes.md#ui)).

**`getPictureSrc`.** El API guarda la clave del archivo, no una URL. Esta función la convierte en
`${apiDomain}/api/files/<clave>`, que es el endpoint que sirve el archivo con la sesión de la cookie.
Deja pasar sin tocar lo que ya es una URL (`http://`, `https://`), una vista previa local (`data:`,
`blob:`) o un asset de `public/` (`/`). Con un valor vacío devuelve `undefined`, que hace que
`AvatarImage` no pinte y muestre el fallback. El flujo completo está en
[11-subida-de-archivos.md](11-subida-de-archivos.md#getpicturesrc).

**`getInitials`.** Recibe partes sueltas o arreglos (`getInitials(member.name, member.surname)`),
descarta las vacías y devuelve como máximo dos iniciales en mayúscula. Es el texto del `AvatarFallback`;
si no queda ninguna parte devuelve `''` y la pantalla pone su propia letra por defecto con `||`.

La URL del API sale de `apiDomain` y no se lee dos veces del entorno: `service.js` y `utils.js`
importan la misma constante.

## lib/logger.js

Path: `src/lib/logger.js`.

```js
const logger = {
  warning: (message, context = '') => log('warn', message, context),
  error: (message, context = '') => log('error', message, context),
  info: (message, context = '') => log('info', message, context),
  debug: (message, context = '') => log('debug', message, context)
};

function log (level, message, context) {
  console[level](message, context); // eslint-disable-line no-console
}

export default logger;
```

Un solo lugar escribe en la consola. ESLint prohíbe `console` en todo `src/` con `no-console` como
error (la directiva de esta línea es la única excepción, ver
[03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#eslint)),
así que cualquier traza pasa por aquí y cambiar el destino de los logs es tocar un archivo.

La API es `logger.<nivel>(mensaje, contexto)`. El nivel se llama `warning` y se traduce a
`console.warn`; el resto de los niveles se llama igual que el método de la consola. El mensaje
lleva el prefijo del emisor entre corchetes (`'[useForm] Falló el envío'`) para filtrar en la consola.

El contexto nunca lleva valores sensibles: el cliente corre en un navegador que se comparte en pantalla.
[`useForm`](05-hooks.md#useform) registra solo los nombres de los campos inválidos, nunca sus valores.

## lib/user-agent.js

Path: `src/lib/user-agent.js`.

```js
const UNKNOWN = 'Dispositivo no identificado';

const BROWSERS = [
  ['Edg', 'Edge'],
  ['OPR/', 'Opera'],
  ['Opera', 'Opera'],
  ['SamsungBrowser', 'Samsung Internet'],
  ['FxiOS', 'Firefox'],
  ['Firefox/', 'Firefox'],
  ['CriOS', 'Chrome'],
  ['Chrome/', 'Chrome'],
  ['Safari/', 'Safari']
];

const SYSTEMS = [
  ['iPhone', 'iPhone'],
  ['iPad', 'iPad'],
  ['Android', 'Android'],
  ['Windows', 'Windows'],
  ['CrOS', 'ChromeOS'],
  ['Mac OS X', 'macOS'],
  ['Macintosh', 'macOS'],
  ['Linux', 'Linux']
];

export function deviceLabel (userAgent) {
  if (typeof userAgent !== 'string') {
    return UNKNOWN;
  }

  const parts = [labelFor(BROWSERS, userAgent), labelFor(SYSTEMS, userAgent)].filter(Boolean);

  if (parts.length === 0) {
    return UNKNOWN;
  }

  return parts.join(' en ');
}

function labelFor (signatures, userAgent) {
  return signatures.find(([token]) => userAgent.includes(token))?.[1];
}
```

Convierte el `user-agent` que guarda el server en cada sesión en un texto legible como
`Chrome en macOS`. Lo usa la pantalla de sesiones activas del perfil
([07-rutas-y-sesion.md](07-rutas-y-sesion.md#módulos-de-cuenta-propia)).

**El orden de las listas es la lógica.** `labelFor` devuelve la primera firma que aparece en el texto,
y los navegadores se declaran unos dentro de otros: el user-agent de Edge y el de Opera también
contienen `Chrome/` y `Safari/`, y el de Chrome contiene `Safari/`. Por eso los específicos van arriba
y `Safari/` al final. Lo mismo con los sistemas: el de iPhone dice `like Mac OS X` y el de Android dice
`Linux`, así que `iPhone`, `iPad` y `Android` van antes que `Mac OS X` y `Linux`. Al agregar una firma,
colócala antes de cualquier otra que su user-agent también contenga.

Si falta una de las dos partes se muestra la otra sola; si faltan ambas, o el valor no es un string,
se muestra `Dispositivo no identificado`. No se usa una librería de parseo: la pantalla solo necesita
una etiqueta aproximada.

## lib/date.js

Path: `src/lib/date.js`.

```js
const DEFAULT_LOCALE = 'es-ES';

export function formatDate (value, options = {}) {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(normalizeDateValue(value));
}

export function formatDateTime (value, options = {}) {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(normalizeDateValue(value));
}

function normalizeDateValue (value) {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
}
```

Todas las fechas que se pintan pasan por aquí, con `Intl.DateTimeFormat` y sin librería de fechas.
`DEFAULT_LOCALE` es el locale del destino (placeholder de identidad `es-ES`; se conserva y el destino lo
ajusta). Es una constante del módulo, no un export: nadie fuera de este archivo decide el locale.

`normalizeDateValue` acepta un `Date` o lo que devuelve el API (un ISO string con zona) y siempre
entrega un `Date`. Las fechas se formatean en la zona horaria del navegador: el API guarda instantes
con zona y el cliente los muestra en la hora local de quien mira.

`formatDate` y `formatDateTime` tienen hoy el mismo cuerpo. Se mantienen separadas por intención:
`formatDate` para fechas sin hora (`formatDate(member.createdAt)`) y `formatDateTime` para las que
llevan hora, pasando las `options` que correspondan (`{dateStyle: 'medium', timeStyle: 'short'}`).
Sin `options` ambas usan el formato corto por defecto del locale.

## Reglas de uso

- **Toda petición al API pasa por `service()`.** Nada de `fetch` directo en pantallas, hooks ni
  componentes: se pierde el manejo del 401, el desempaquetado del envelope y la forma del error. La
  única otra puerta a la red es `core/upload.js`, que habla con el bucket
  ([11-subida-de-archivos.md](11-subida-de-archivos.md#coreuploadjs)).
- **Un service por feature, creado a nivel de módulo.** `export default service('items');` en su archivo;
  nunca `service('items')` dentro de un componente o de un render.
- **No captures el error de `service()` para convertirlo en otra cosa.** `useResolver`, `useForm` y
  `useMutation` ya leen `failure.error` y `failure.fields`; envolverlo en un `Error` los rompe.
- **No leas `import.meta.env` fuera de `lib/environment.js`.** La URL del API se importa como
  `apiDomain`.
- **No agregues `Authorization` ni tokens a los headers.** La sesión viaja en la cookie httpOnly con
  `credentials: 'include'`.
- **Nada de `console.*` fuera de `lib/logger.js`**, y nada de valores de formulario, contraseñas ni
  cuerpos de petición como contexto del logger.
- **Las fechas se pintan con `formatDate`/`formatDateTime`.** Nada de `toLocaleString()` suelto ni de
  otro locale escrito a mano en una pantalla.
- **`getPictureSrc` para toda imagen que venga del API.** Nunca concatenes `/api/files/` en un componente.

## Checklist del ejecutor

- [ ] `src/lib/environment.js` existe y exporta `apiDomain` (Fase 1).
- [ ] `src/core/service.js` copiado completo, importando `apiDomain` y `useSessionStore`.
- [ ] `src/lib/utils.js` copiado completo, importando `apiDomain`; `clsx` y `tailwind-merge` declarados
      en `package.json`.
- [ ] `src/lib/logger.js` copiado completo; la directiva `eslint-disable-line no-console` está en la
      línea de `console[level]`.
- [ ] `src/lib/user-agent.js` copiado completo, con el orden de firmas intacto.
- [ ] `src/lib/date.js` copiado con `DEFAULT_LOCALE` fijado al locale del destino.
- [ ] Un `grep -rn "fetch(" src/` solo encuentra `core/service.js` y `core/upload.js`.
- [ ] Un `grep -rn "import.meta.env" src/` solo encuentra `lib/environment.js`.
- [ ] Un `grep -rn "console\." src/` solo encuentra `lib/logger.js`.
