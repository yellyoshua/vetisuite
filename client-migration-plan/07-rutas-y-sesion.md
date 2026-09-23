# 07 · Rutas y sesión

## Propósito

Explica cómo arranca la SPA, cómo elige el árbol de rutas según el rol de la sesión, cómo nace la
sesión (canje OAuth2) y cómo muere (logout), el cromo de cada rol (layout, header, sidebar), la
pantalla de cuenta deshabilitada y los módulos de cuenta propia: login, recuperación de contraseña,
verificación de correo, perfil, edición, cambio de contraseña y sesiones activas.

Se usa en la **Fase 6 · Rutas y sesión**. Presupone las fases anteriores: `core/service.js`
([04-core.md](04-core.md#coreservicejs)), los hooks de
[05-hooks.md](05-hooks.md#useresolver), el store de sesión
([06-stores.md](06-stores.md#sessionstorejs)), los componentes de
[09-componentes.md](09-componentes.md#formularios) y `modalWrapper.jsx`
([10-modales-por-query.md](10-modales-por-query.md#modalwrapperjsx)).

Todo el código de este documento es **base**, salvo las dos secciones marcadas `(opcional)`. El
`dashboard` de cada rol es un stub y su código está en
[13-templates.md](13-templates.md#dashboard-stub).

## main.jsx

`src/main.jsx`

```jsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router';
import App from './App.jsx';
import './globals.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

- **`BrowserRouter` y no un router de datos.** Las rutas se declaran como objetos y se montan con
  `useRoutes` dentro de `Authorization`, porque el árbol depende del rol de la sesión y cambia en
  caliente. Un router de datos (`createBrowserRouter`) fija el árbol al crearse.
- **`StrictMode` queda encendido.** En desarrollo monta dos veces cada efecto; las piezas que no
  pueden repetirse (el canje del code en `OauthCallback`, la confirmación del correo en
  `email-verification/resolvers.js`) se protegen solas, como se explica en sus secciones.
- `globals.css` se importa una sola vez, acá ([03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#globalscss)).

## App.jsx

`src/App.jsx`

```jsx
import {Toaster} from 'sonner';
import {CheckCircleIcon, InfoIcon, TriangleAlertIcon, XCircleIcon} from 'lucide-react';
import Authorization from '@/components/Authorization/Authorization';
import ConfirmationDialog from '@/components/confirmation-dialog';
import ThemeProvider from '@/components/theme-provider';

export default function App () {
  return (
    <ThemeProvider attribute="class" enableSystem={true}>
      <Authorization />
      <Toaster position="top-right" closeButton={true} icons={{
        success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
        error: <XCircleIcon className="w-5 h-5 text-red-500" />,
        warning: <TriangleAlertIcon className="w-5 h-5 text-yellow-500" />,
        info: <InfoIcon className="w-5 h-5 text-blue-500" />
      }} duration={5000} richColors={true} />
      <ConfirmationDialog />
    </ThemeProvider>
  );
}
```

`App.jsx` es la raíz de la SPA y solo tiene el cromo de toda la app: tema, toasts y el diálogo de
confirmación. **El árbol de rutas no se define acá**: lo elige `Authorization` según el rol de la
sesión.

- `ThemeProvider attribute="class" enableSystem` pone la clase `dark` en `<html>` y respeta la
  preferencia del sistema; el detalle está en [09-componentes.md](09-componentes.md#tema).
- La configuración del `Toaster` (arriba a la derecha, botón de cerrar, iconos de `lucide-react`,
  5000 ms, `richColors`) se copia exacta: es la única instancia y todos los toasts de `useForm` y
  `useMutation` pasan por ella ([09-componentes.md](09-componentes.md#toasts)).
- `ConfirmationDialog` se monta una vez y lo abre `useMutation` a través de su store
  ([06-stores.md](06-stores.md#confirmationdialog)).

**Dónde va un modal global.** Un modal por query que debe poder abrirse desde cualquier pantalla se
monta acá, una sola vez, como hermano de `<Authorization />` (entre `<Authorization />` y
`<Toaster />`): `<ModalId />`, importado desde `@/modals/<ModalId>/<ModalId>`. El plan no trae
ninguno base. Un modal que pertenece a una sola pantalla no va acá, va en `components/` de su
módulo. La regla completa está en
[10-modales-por-query.md](10-modales-por-query.md#montaje-global-y-montaje-por-pantalla).

## Authorization

`src/components/Authorization/Authorization.jsx`

```jsx
import {useRoutes} from 'react-router';
import {useSessionStore} from '@/stores/session.store';
import DisabledAccount from '@/components/DisabledAccount/DisabledAccount';
import MemberLayout from '@/components/Member/MemberLayout';
import SuperadminLayout from '@/components/Superadmin/SuperadminLayout';
import memberRoutes from '@/routes/member.routes';
import superadminRoutes from '@/routes/superadmin.routes';
import publicRoutes from '@/routes/public.routes';
import noSessionRoutes from '@/routes/no-session.routes';

const routesByRole = {
  member: memberRoutes,
  superadmin: superadminRoutes
};

const layoutsByRole = {
  member: MemberLayout,
  superadmin: SuperadminLayout
};

export default function Authorization () {
  const profile = useSessionStore((state) => state.profile);
  const role = profile?.user?.role;

  const routes = resolveRoutes(profile, role);

  return useRoutes([...publicRoutes, ...routes]);
}

function resolveRoutes (profile, role) {
  const roleRoutes = routesByRole[role];

  if (!roleRoutes) {
    return noSessionRoutes;
  }

  if (!isAccountBlocked(profile.user)) {
    return roleRoutes;
  }

  const Layout = layoutsByRole[role];

  return [{
    path: '/',
    element: <Layout />,
    children: [
      {index: true, element: <DisabledAccount />},
      {path: '*', element: <DisabledAccount />}
    ]
  }];
}

function isAccountBlocked (user) {
  if (user.disabled) {
    return true;
  }

  return Boolean(user.bannedUntil && new Date(user.bannedUntil) > new Date());
}
```

El ruteo por rol se resuelve en el navegador: se lee el rol de la sesión (`profile.user.role`, ver
[06-stores.md](06-stores.md#sessionstorejs)) y se monta el árbol de rutas de ese rol. El espacio de
URLs es el mismo para todos los roles, por eso los archivos de rutas no llevan prefijo de rol.

- **`useRoutes` no puede ir detrás de un early return.** Es un hook: si se llamara solo en algunas
  ramas, React vería un número distinto de hooks entre renders. Por eso el árbol se elige antes, en
  `resolveRoutes`, y `useRoutes` se llama siempre una vez, con el fallback ya resuelto.
- **`publicRoutes` va primero.** Son las rutas por token del correo y el callback OAuth; existen con
  sesión y sin ella, y al ir delante ganan sobre el `*` de cada panel.
- **Un rol sin árbol cae en `noSessionRoutes`, que es el login.** Nunca en el panel de otro rol. Sin
  sesión, `role` es `undefined` y cae en la misma rama. Un rol nuevo en el destino exige agregar su
  entrada en `routesByRole` **y** en `layoutsByRole`.
- **Cuenta bloqueada = un árbol que solo pinta `DisabledAccount`.** Si `profile.user.disabled` es
  verdadero o `profile.user.bannedUntil` está en el futuro, el árbol del rol se sustituye por uno que
  solo sabe pintar esa pantalla, dentro del layout del rol para que el panel siga siendo
  reconocible. **Lleva ruta índice porque `*` no cubre `/`**: sin ella, un usuario bloqueado que
  entra a la raíz no vería nada.
- **Es solo cromo.** El API vuelve a decidir en cada request y aplica la misma regla del lado del
  server. Que el panel se pinte bloqueado no es lo que protege los datos; el `profile` de
  `localStorage` puede estar viejo o manipulado y no importa.

## Archivos de rutas

Cuatro archivos en `src/routes/`, uno por árbol. Cada ruta de panel se declara como objeto
`{path, element}` hijo del layout del rol.

### `public.routes.jsx`

`src/routes/public.routes.jsx`

```jsx
import OauthCallback from '@/components/OauthCallback/OauthCallback';
import EmailVerification from '@/modules/public/email-verification/page';
import RecoveryPassword from '@/modules/public/recovery-password/page';

const publicRoutes = [
  {path: '/oauth/proyecto', element: <OauthCallback />},
  {path: '/verify/email-verification', element: <EmailVerification />},
  {path: '/verify/recovery-password', element: <RecoveryPassword />}
];

export default publicRoutes;
```

Rutas que no dependen del perfil: se entra por un enlace del correo (con el token en la query) o por
el redirect del Authorization Server, así que existen igual para todos los roles y sin sesión.
`/oauth/proyecto` es el `redirect_uri` registrado en el server: tiene que resolver justamente cuando
todavía no hay sesión, porque es la ruta que la crea.

### `no-session.routes.jsx`

`src/routes/no-session.routes.jsx`

```jsx
import {Navigate} from 'react-router';
import SignIn from '@/modules/public/auth/sign-in/page';
import SignUp from '@/modules/public/auth/sign-up/page';
import ResetPassword from '@/modules/public/auth/reset-password/page';

const noSessionRoutes = [
  {index: true, element: <SignIn />},
  {path: '/sign-in', element: <SignIn />},
  {path: '/sign-up', element: <SignUp />},
  {path: '/reset-password', element: <ResetPassword />},
  {path: '*', element: <Navigate to="/sign-in" replace />}
];

export default noSessionRoutes;
```

Sin sesión, la raíz del panel **es** el login. `/sign-up` no tiene formulario: el alta vive en la
landing y esa ruta solo redirige allá. Cualquier otra ruta sin sesión cae en `/sign-in` (con
`replace`, para no dejar la URL rota en el historial), no en un 404 ni en la landing.

No van en `public.routes.jsx` porque solo tienen sentido sin sesión: con perfil, `Authorization`
no las monta, y un usuario con sesión que entra a `/sign-in` cae en el `*` de su panel.

### `superadmin.routes.jsx`

`src/routes/superadmin.routes.jsx`

```jsx
import SuperadminLayout from '@/components/Superadmin/SuperadminLayout';
import NotFoundScreen from '@/components/NotFoundScreen/NotFoundScreen';
import Dashboard from '@/modules/superadmin/dashboard/page';
import Members from '@/modules/superadmin/members/page';
import MembersCreate from '@/modules/superadmin/members-create/page';
import MembersEdit from '@/modules/superadmin/members-edit/page';
import MembersShow from '@/modules/superadmin/members-show/page';
import MembersPermissionsShow from '@/modules/superadmin/members-permissions-show/page';
import MembersPermissionsEdit from '@/modules/superadmin/members-permissions-edit/page';
import Superadmins from '@/modules/superadmin/superadmins/page';
import SuperadminsCreate from '@/modules/superadmin/superadmins-create/page';
import SuperadminsEdit from '@/modules/superadmin/superadmins-edit/page';
import SuperadminsShow from '@/modules/superadmin/superadmins-show/page';
import SuperadminsPermissionsShow from '@/modules/superadmin/superadmins-permissions-show/page';
import SuperadminsPermissionsEdit from '@/modules/superadmin/superadmins-permissions-edit/page';
import Profile from '@/modules/superadmin/profile/page';
import ProfileEdit from '@/modules/superadmin/profile-edit/page';
import ProfileChangePassword from '@/modules/superadmin/profile-change-password/page';
import ProfileSessions from '@/modules/superadmin/profile-sessions/page';
import DisabledAccount from '@/modules/superadmin/disabled-account/page';

const superadminRoutes = [
  {
    path: '/',
    element: <SuperadminLayout />,
    children: [
      {index: true, element: <Dashboard />},
      {path: 'members', element: <Members />},
      {path: 'members/create', element: <MembersCreate />},
      {path: 'members/edit/:id', element: <MembersEdit />},
      {path: 'members/show/:id', element: <MembersShow />},
      {path: 'members-permissions/show/:id', element: <MembersPermissionsShow />},
      {path: 'members-permissions/edit/:id', element: <MembersPermissionsEdit />},
      {path: 'superadmins', element: <Superadmins />},
      {path: 'superadmins/create', element: <SuperadminsCreate />},
      {path: 'superadmins/edit/:id', element: <SuperadminsEdit />},
      {path: 'superadmins/show/:id', element: <SuperadminsShow />},
      {path: 'superadmins-permissions/show/:id', element: <SuperadminsPermissionsShow />},
      {path: 'superadmins-permissions/edit/:id', element: <SuperadminsPermissionsEdit />},
      {path: 'profile', element: <Profile />},
      {path: 'profile/edit', element: <ProfileEdit />},
      {path: 'profile/change-password', element: <ProfileChangePassword />},
      {path: 'profile/sessions', element: <ProfileSessions />},
      {path: 'disabled-account', element: <DisabledAccount />},
      {path: '*', element: <NotFoundScreen />}
    ]
  }
];

export default superadminRoutes;
```

### `member.routes.jsx`

`src/routes/member.routes.jsx`

```jsx
import MemberLayout from '@/components/Member/MemberLayout';
import NotFoundScreen from '@/components/NotFoundScreen/NotFoundScreen';
import Dashboard from '@/modules/member/dashboard/page';
import Profile from '@/modules/member/profile/page';
import ProfileEdit from '@/modules/member/profile-edit/page';
import ProfileChangePassword from '@/modules/member/profile-change-password/page';
import ProfileSessions from '@/modules/member/profile-sessions/page';
import DisabledAccount from '@/modules/member/disabled-account/page';

const memberRoutes = [
  {
    path: '/',
    element: <MemberLayout />,
    children: [
      {index: true, element: <Dashboard />},
      {path: 'profile', element: <Profile />},
      {path: 'profile/edit', element: <ProfileEdit />},
      {path: 'profile/change-password', element: <ProfileChangePassword />},
      {path: 'profile/sessions', element: <ProfileSessions />},
      {path: 'disabled-account', element: <DisabledAccount />},
      {path: '*', element: <NotFoundScreen />}
    ]
  }
];

export default memberRoutes;
```

### Forma común de los árboles por rol

- **Una sola ruta raíz `/` con el layout del rol** y todas las pantallas como hijas con path
  relativo (sin `/` inicial). El layout pinta sidebar y header una vez y las hijas entran por su
  `<Outlet />`.
- **`index: true` es el dashboard** (stub, ver [13-templates.md](13-templates.md#dashboard-stub)).
- **`*` va último y pinta `NotFoundScreen` dentro del layout**: el usuario sigue viendo su panel.
- **Imports estáticos.** Las pantallas no se cargan con `lazy`/`Suspense`: el bundle base es chico y
  cada pantalla es liviana. Si el destino agrega una pantalla pesada (una librería grande que solo
  usa ella), esa sola puede ir con `lazy` y un `Suspense` con `PageLoading` como fallback.
- **`disabled-account` existe también como ruta normal** del árbol, además del árbol de bloqueo
  que arma `Authorization`, para poder enlazarla directamente.

La carpeta del módulo decide la URL; la tabla completa está en
[02-estructura-de-carpetas.md](02-estructura-de-carpetas.md#convención-de-un-módulo):

| Carpeta en `modules/<rol>/` | Path en el árbol | URL |
|---|---|---|
| `dashboard/` | `index: true` | `/` |
| `members/` | `members` | `/members` |
| `members-create/` | `members/create` | `/members/create` |
| `members-edit/` | `members/edit/:id` | `/members/edit/:id` |
| `members-show/` | `members/show/:id` | `/members/show/:id` |
| `members-permissions-show/` | `members-permissions/show/:id` | `/members-permissions/show/:id` |
| `members-permissions-edit/` | `members-permissions/edit/:id` | `/members-permissions/edit/:id` |
| `profile/` | `profile` | `/profile` |
| `profile-edit/` | `profile/edit` | `/profile/edit` (sin `:id`: el recurso es la sesión) |
| `profile-change-password/` | `profile/change-password` | `/profile/change-password` |
| `profile-sessions/` | `profile/sessions` | `/profile/sessions` |
| `disabled-account/` | `disabled-account` | `/disabled-account` |

`members-permissions-*` es la excepción visible a la regla: la carpeta base `members-permissions/`
no tiene pantalla (solo su service) y sus acciones cuelgan de `/members-permissions/...` y no de
`/members/...`. `superadmins*` sigue exactamente la misma forma. Cómo registrar una pantalla nueva
en el árbol y en el sidebar está en
[08-modulos.md](08-modulos.md#registro-en-rutas-y-sidebar).

## OAuth

La sesión se abre con un flujo OAuth2 de *authorization code* entre la SPA y el API. El token de
sesión **nunca pasa por JavaScript**: vive en una cookie httpOnly que pone el server.

### Secuencia

1. `SignInForm` hace `POST /api/public/auth/signin` con `{email, password}`. El server valida las
   credenciales, emite un code de un solo uso y responde `{authorize_url}`. **No devuelve la
   sesión.**
2. El navegador **navega** a `authorize_url` con `window.location.href`: navegación top-level del
   documento, no `fetch`. Un `fetch` sigue el 302 solo y deja el `Location` ilegible, así que un
   canje iniciado por XHR nunca vería el code. Al ser navegación tampoco interviene CORS.
3. `GET /api/oauth/proyecto/authorize` responde un 302 nativo al `redirect_uri` ligado al code:
   `https://app.dominio.com/oauth/proyecto?code=…`.
4. La SPA arranca en `/oauth/proyecto`, que está en `publicRoutes` y resuelve sin sesión. Monta
   `OauthCallback`.
5. `OauthCallback` canjea el code: `POST /api/oauth/proyecto/token` con
   `{grant_type: 'authorization_code', code}`. El server responde **con la cookie de sesión ya
   puesta** (`Set-Cookie`, httpOnly) y el perfil en el cuerpo. **La sesión nace en el canje**: es
   el único punto donde el server crea la cookie.
6. `OauthCallback` guarda el perfil con `setSession` y navega a `/`. `Authorization` re-renderiza
   con el rol y monta el árbol del panel.

Lo que la SPA guarda en `localStorage` es solo el perfil (rol, bloqueo, nombre), nunca el token.
Todas las llamadas siguientes viajan con la cookie gracias a `credentials: 'include'`
([04-core.md](04-core.md#coreservicejs)).

### `oauth.service.js`

`src/modules/oauth/oauth.service.js`

```js
import service from '@/core/service.js';

const tokenService = service('oauth/proyecto/token');

export function exchangeCode (code) {
  return tokenService.post({grant_type: 'authorization_code', code});
}
```

`POST /api/oauth/proyecto/token` es público del lado del server (su guardia salta `/api/oauth/`):
el code es la credencial, todavía no hay sesión que mandar. `modules/oauth/` no tiene pantalla,
solo el service que consume `OauthCallback`.

### `OauthCallback`

`src/components/OauthCallback/OauthCallback.jsx`

```jsx
import {useEffect, useRef, useState} from 'react';
import {Navigate, useSearchParams} from 'react-router';
import {exchangeCode} from '@/modules/oauth/oauth.service';
import {useSessionStore} from '@/stores/session.store';

export default function OauthCallback () {
  const [searchParams] = useSearchParams();
  const setSession = useSessionStore((state) => state.setSession);
  const [status, setStatus] = useState('claiming');
  const claiming = useRef(false);
  const code = searchParams.get('code');

  useEffect(() => {
    if (claiming.current) {
      return;
    }

    claiming.current = true;

    claimSession(code, setSession).then(setStatus);
  }, [code, setSession]);

  if (status === 'claimed') {
    return <Navigate to="/" replace />;
  }

  if (status === 'failed') {
    return <Navigate to="/sign-in" replace />;
  }

  return <p role="status">Iniciando sesión…</p>;
}

async function claimSession (code, setSession) {
  if (!code) {
    return 'failed';
  }

  try {
    setSession(await exchangeCode(code));

    return 'claimed';
  } catch {
    return 'failed';
  }
}
```

- **`useRef` como candado.** El code es de un solo uso y `StrictMode` monta dos veces en
  desarrollo: sin el candado, el segundo canje sería un 400 y pisaría el éxito del primero.
- **Sin code, o si el canje falla** (expirado, ya usado, cuenta bloqueada, navegador distinto al que
  se autenticó), cae en `/sign-in`. No hay nada que reintentar desde acá: el code se emite validando
  credenciales, y el formulario que las pide es el login.
- **`<Navigate>` y no `window.location`.** El login y el panel son rutas de la misma SPA; basta
  con la navegación de react-router.
- `role="status"` anuncia el estado intermedio a lectores de pantalla.

## Logout

`useLogout` es el único camino para cerrar la sesión propia; su código y su razonamiento están en
[05-hooks.md](05-hooks.md#uselogout). En resumen: pide al server que revoque (mejor esfuerzo) y,
conteste lo que conteste, vacía el store y hace una navegación dura a `/`, que sin sesión es el
login.

`src/modules/auth/logout.service.js`

```js
import service from '@/core/service';

export default service('auth-logout');
```

`modules/auth/` no tiene pantalla: el service lo consume el hook. El server borra la sesión y vence
la cookie httpOnly; la SPA no puede tocar esa cookie y no lo intenta.

Lo usan el header de cada rol, `DisabledAccount` y, con su propia variante, la fila de la sesión
actual en `profile-sessions` (ver más abajo).

## Layouts por rol

Cada rol tiene su cromo en `components/<Rol>/`: un layout con el `<Outlet />`, un header y un
sidebar. **El código se duplica por rol a propósito**: los paneles evolucionan por separado (menús,
colores, acciones del header) y una abstracción común obligaría a llenarla de condiciones por rol.
La regla general está en [08-modulos.md](08-modulos.md#separación-por-rol).

### `components/Superadmin/SuperadminLayout.jsx`

```jsx
import {useState} from 'react';
import {Outlet} from 'react-router';
import Header from './Header';
import Sidebar from './Sidebar';
import {useSessionStore} from '@/stores/session.store';

export default function SuperadminLayout () {
  const profile = useSessionStore((state) => state.profile);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-64">
        <Header setSidebarOpen={setSidebarOpen} profile={profile} />
        <main className="py-6 px-4 sm:px-6 lg:px-8"><Outlet /></main>
      </div>

      {sidebarOpen &&
        <div
          role="presentation"
          aria-hidden="true"
          className="fixed inset-0 bg-gray-900/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      }
    </div>
  );
}
```

### `components/Superadmin/Header.jsx`

```jsx
import {MenuIcon, MoonIcon, SunIcon} from 'lucide-react';
import {useState} from 'react';
import {useTheme} from 'next-themes';
import useLogout from '@/hooks/use-logout';

export default function Header ({setSidebarOpen, profile}) {
  const {resolvedTheme, setTheme} = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, handleLogout] = useLogout();

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú de navegación"
          className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        <div className="hidden lg:block">
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            Panel de Administración
          </p>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
              aria-label="Abrir menú de la cuenta"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {profile.name?.[0]?.toUpperCase() || '-'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {profile.name || '-'}
              </span>
            </button>

            {isDropdownOpen && (
              <>
                <div
                  role="presentation"
                  aria-hidden="true"
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {profile.name || '-'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={profile.user.email}>
                      {profile.user.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {resolvedTheme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                    {resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                  </button>
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={() => handleLogout()}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
```

### `components/Superadmin/Sidebar.jsx`

```jsx
import {Link, useLocation} from 'react-router';
import {LayoutDashboardIcon, UsersIcon, UserIcon, ShieldIcon} from 'lucide-react';

export default function Sidebar ({sidebarOpen, setSidebarOpen}) {
  const {pathname} = useLocation();

  const menuItems = [
    {
      name: 'Panel general',
      href: '/',
      icon: <LayoutDashboardIcon className="w-6 h-6" />
    },
    {
      name: 'Superadmins',
      href: '/superadmins',
      icon: <ShieldIcon className="w-6 h-6" />
    },
    {
      name: 'Miembros',
      href: '/members',
      icon: <UsersIcon className="w-6 h-6" />
    },
    {
      name: 'Perfil',
      href: '/profile',
      icon: <UserIcon className="w-6 h-6" />
    }
  ];

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div role="img" aria-label="Proyecto" className="flex items-center shrink-0 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <img
              src="/assets/images/logo-white.png"
              alt=""
              className="dark:block hidden h-14 w-auto"
            />
            <img
              src="/assets/images/logo-base.png"
              alt=""
              className="dark:hidden block h-14 w-auto"
            />
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150
                    ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
                  `}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <img
              src="/assets/images/logo-white.png"
              alt="Proyecto"
              className="h-14 w-auto"
            />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú de navegación"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150
                    ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
                  `}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
```

### `components/Member/MemberLayout.jsx`

```jsx
import {useState} from 'react';
import {Outlet} from 'react-router';
import Header from './Header';
import Sidebar from './Sidebar';
import {useSessionStore} from '@/stores/session.store';

export default function MemberLayout () {
  const profile = useSessionStore((state) => state.profile);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-64">
        <Header setSidebarOpen={setSidebarOpen} profile={profile} />
        <main className="py-6 px-4 sm:px-6 lg:px-8"><Outlet /></main>
      </div>

      {sidebarOpen &&
        <div
          role="presentation"
          aria-hidden="true"
          className="fixed inset-0 bg-gray-900/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      }
    </div>
  );
}
```

### `components/Member/Header.jsx`

```jsx
import {useTheme} from 'next-themes';
import {LogOutIcon, MoonIcon, SunIcon} from 'lucide-react';
import {Link} from 'react-router';
import {useState} from 'react';
import useLogout from '@/hooks/use-logout';

export default function Header ({setSidebarOpen, profile}) {
  const [loading, logout] = useLogout();
  const {resolvedTheme, setTheme} = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 h-16 min-w-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú de navegación"
          className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-start">
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            Panel de Miembro
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen(!profileOpen);
              }}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label="Abrir menú de la cuenta"
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {profile.user.email.charAt(0).toUpperCase() || 'U'}
              </div>
              <svg aria-hidden="true" className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileOpen && (
              <>
                <div
                  role="presentation"
                  aria-hidden="true"
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={profile.user.email}>
                      {profile.user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{[profile.name, profile.surname].join(' ')}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    Mi Perfil
                    </Link>
                    <button
                      type="button"
                      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 w-full text-left cursor-pointer"
                    >
                      {resolvedTheme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                      {resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                    </button>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => logout()}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 w-full text-left cursor-pointer disabled:opacity-50"
                    >
                      <LogOutIcon className="w-5 h-5" />
                      {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
```

### `components/Member/Sidebar.jsx`

```jsx
import {HouseIcon, UserIcon} from 'lucide-react';
import {Link, useLocation} from 'react-router';
import {twMerge} from 'tailwind-merge';

export default function Sidebar ({sidebarOpen, setSidebarOpen}) {
  const {pathname} = useLocation();

  const menuItems = [
    {
      name: 'Panel general',
      href: '/',
      icon: <HouseIcon className="w-6 h-6" />
    },
    {
      name: 'Perfil',
      href: '/profile',
      icon: <UserIcon className="w-6 h-6" />
    }
  ];

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div role="img" aria-label="Proyecto" className="flex items-center shrink-0 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <img
              src="/assets/images/logo-white.png"
              alt=""
              className="dark:block hidden h-14 w-auto"
            />
            <img
              src="/assets/images/logo-base.png"
              alt=""
              className="dark:hidden block h-14 w-auto"
            />
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={twMerge(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <img
              src="/assets/images/logo-white.png"
              alt="Proyecto"
              className="h-14 w-auto"
            />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú de navegación"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150
                    ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
                  `}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
```

### Por qué el cromo tiene esta forma

- **El perfil sale del store de sesión**, no de una llamada al API: el layout lo lee con un
  selector y se lo pasa al header. Es el perfil que escribió el canje OAuth
  ([06-stores.md](06-stores.md#sessionstorejs)).
- **Sidebar doble.** Uno fijo para escritorio (`lg:`) y otro deslizable para móvil que abre el
  botón de hamburguesa del header. El overlay del layout cierra el móvil al tocar fuera; cada
  enlace del móvil también lo cierra al navegar.
- **Logo con dos imágenes y un solo nombre accesible.** El contenedor lleva `role="img"` y
  `aria-label="Proyecto"`; las dos imágenes (`logo-white.png` para modo oscuro, `logo-base.png` para
  modo claro) tienen `alt=""` para que el lector de pantalla no anuncie el logo dos veces. En el
  sidebar móvil hay una sola imagen, con `alt="Proyecto"`.
- **Activo del menú.** En superadmin, un ítem está activo si la ruta coincide o empieza por su
  `href` (así `/members/edit/…` resalta "Miembros"); `/` se excluye del prefijo porque todo empieza
  por `/`. En member se compara igualdad exacta: su menú no tiene subrutas que resaltar.
- **Menú de la cuenta.** Un botón con `aria-haspopup="menu"` y `aria-expanded` abre un
  desplegable; una capa `fixed inset-0` invisible debajo lo cierra al hacer clic fuera. Contiene el
  cambio de tema (`useTheme` de `next-themes`) y el logout con su estado de carga.
- **Ítems del menú.** Siempre `{name, href, icon: <XIcon className="w-6 h-6" />}` dentro de
  `const menuItems = [...]`, con iconos de `lucide-react`. Agregar un ítem es agregar un objeto; el
  procedimiento está en [08-modulos.md](08-modulos.md#registro-en-rutas-y-sidebar).

## NotFoundScreen

`src/components/NotFoundScreen/NotFoundScreen.jsx`

```jsx
import {Link} from 'react-router';
import {Home} from 'lucide-react';

export default function NotFoundScreen ({
  title = '¡Ups! Página no encontrada',
  description = 'Parece que te has perdido en el espacio.',
  redirectPath = '/',
  buttonText = 'Volver al inicio',
  icon: Icon = Home
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-[340px] sm:max-w-md text-center space-y-6 sm:space-y-8 animate-fade-in">

        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--accent-green)] opacity-20 blur-xl rounded-full animate-pulse-gentle"></div>
          <Icon aria-hidden="true" className="site-icon w-16 h-16 text-[var(--accent-green)] relative z-10 animate-bounce-gentle" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight dark:text-[var(--text-primary)] text-gray-700 font-[family-name:var(--font-chakra-petch)] uppercase">
            {title}
          </h1>
          <p className="text-gray-700 dark:text-[var(--text-primary)] text-base sm:text-lg text-balance">
            {description}
          </p>
        </div>

        <Link to={redirectPath} className="flex justify-center items-center gap-2 group bg-[var(--accent-green)] text-[var(--bg-primary)] px-6 py-3 rounded-xl">
          <Icon aria-hidden="true" className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>{buttonText}</span>
        </Link>
      </div>
    </div>
  );
}
```

Es el `*` de cada árbol por rol y se pinta dentro del layout: el usuario no pierde el sidebar. Todas
las props tienen valor por defecto, así que el árbol lo monta sin argumentos; una pantalla que
necesite un "no encontrado" propio (un recurso borrado, por ejemplo) puede reutilizarlo cambiando
`title`, `description`, `redirectPath`, `buttonText` o `icon`.

Las clases `animate-fade-in`, `animate-pulse-gentle` y `animate-bounce-gentle` vienen de
`globals.css`. Las variables `--accent-green`, `--text-primary`, `--bg-primary` y
`--font-chakra-petch` y la clase `site-icon` **no están definidas** en el `globals.css` que
transporta el plan: el componente se transporta tal cual y el destino decide si las define en su
`globals.css` o reemplaza esas clases por colores de su tema.

## Cuenta deshabilitada

### `constants/support.js`

`src/constants/support.js`

```js
export const supportEmail = 'soporte@dominio.com';
```

Un solo canal de contacto: el correo. Es la constante que muestran las pantallas que mandan al
usuario a soporte.

### `DisabledAccount`

`src/components/DisabledAccount/DisabledAccount.jsx`

```jsx
import {ShieldOffIcon, MailIcon} from 'lucide-react';
import useLogout from '@/hooks/use-logout';
import {supportEmail} from '@/constants/support';

export default function DisabledAccount () {
  const [loading, logout] = useLogout();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full">

        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ShieldOffIcon className="w-12 h-12 text-red-500 dark:text-red-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 animate-ping opacity-60" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Tu cuenta ha sido deshabilitada
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            El acceso a tu cuenta ha sido temporalmente suspendido por un administrador.
            Si crees que esto es un error, ponte en contacto con nuestro equipo de soporte.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            ¿Qué puedo hacer?
          </h2>

          <div className="space-y-3">
            <Step
              icon={<MailIcon className="w-4 h-4" />}
              text="Escríbenos a"
              action={
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {supportEmail}
                </a>
              }
            />
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => logout()}
            disabled={loading}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors underline underline-offset-2 disabled:opacity-50"
          >
            {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </button>
        </div>

      </div>
    </div>
  );
}

function Step ({icon, text, action}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
        {icon}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {text}{' '}
        {action}
      </p>
    </div>
  );
}
```

Pantalla compartida por todos los paneles: `Authorization` la pinta en todo el árbol de una cuenta
bloqueada. No lee del API (el bloqueo ya lo sabe la sesión) y solo ofrece dos salidas: escribir a
soporte o cerrar sesión con `useLogout`. `Step` queda como componente aunque haya un solo paso: es
la forma en que el destino agrega otro canal de contacto si lo tiene.

### `modules/<rol>/disabled-account/`

`src/modules/superadmin/disabled-account/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import DisabledAccount from '@/components/DisabledAccount/DisabledAccount';
import resolvers from './resolvers';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <DisabledAccount {...data} />;
}
```

`src/modules/superadmin/disabled-account/resolvers.js`

```js
export default {};
```

`src/modules/member/disabled-account/page.jsx` y `src/modules/member/disabled-account/resolvers.js`
son **idénticos** a los de superadmin. Se duplican igual: cada rol tiene su carpeta.

Es la ruta `/disabled-account` de cada árbol. La pantalla ya es un componente compartido, así que el
módulo no tiene `components/`: solo instancia `DisabledAccount`. `resolvers.js` existe vacío para
que toda pantalla tenga la misma forma (`page.jsx` + `resolvers.js`); con cero claves `useResolver`
no pinta loading.

## Módulos de cuenta propia

Son las pantallas con las que el usuario entra, recupera el acceso y administra su propia cuenta.
Las de `modules/public/` no dependen del rol. Las de perfil existen **una vez por rol**, duplicadas:
cada rol tiene su `profile*` en `modules/<rol>/` y nunca importa del otro.

### `public/auth` — schema y service

`src/modules/public/auth/auth.schema.js`

```js
import zod from 'zod';

export const signInSchema = zod.object({
  email: zod.email('Correo electrónico no válido'),
  password: zod.string().min(1, 'Contraseña no válida')
});

export const resetPasswordSchema = zod.object({
  email: zod.email('El email debe ser válido')
});
```

La contraseña del login se valida **solo por presencia**. El mínimo de 6 es regla del alta y del
cambio de contraseña; exigirlo en el login delataría el formato de las contraseñas ante quien prueba
credenciales, y rechazaría contraseñas viejas creadas con otra regla.

`src/modules/public/auth/auth.service.js`

```js
import service from '@/core/service';

export const signInService = service('public/auth/signin');

export const forgotPasswordService = service('public/auth/forgot-password');
```

Las dos rutas del login son públicas (`api/public/**`): todavía no hay sesión que mandar. `signin`
no devuelve la sesión sino `{authorize_url}`, el arranque del flujo de la sección [OAuth](#oauth).

### `public/auth/components`

`src/modules/public/auth/components/AuthLayout.jsx`

```jsx
export default function AuthLayout ({children}) {
  return (
    <main className="min-h-dvh bg-gray-50 flex flex-col items-center justify-center gap-6 p-4 py-10">
      {children}
    </main>
  );
}
```

Cromo de las pantallas sin sesión: no hay panel detrás, así que el contenido se centra sobre el
documento entero. Solo centra y apila; el ancho lo pone cada tarjeta. Por eso otra tarjeta (el
listado de cuentas demo, si el destino lo usa) puede montarse debajo sin que la pantalla sepa nada
de ella.

`src/modules/public/auth/components/AuthSplitCard.jsx`

```jsx
export default function AuthSplitCard ({children}) {
  return (
    <section className="w-full max-w-5xl">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row md:h-[680px]">

        <div className="hidden md:block md:w-5/12 flex-none">
          <div className="relative w-full h-full">
            <img
              src="/assets/images/login-side.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center py-10 px-3">
          <div className="w-1.5 h-full bg-orange-500 rounded-full" />
        </div>

        <div className="flex-1 flex flex-col justify-center p-6 md:p-10 md:pl-4 md:overflow-y-auto">
          {children}
        </div>

      </div>
    </section>
  );
}
```

Tarjeta partida: ilustración de marca (`login-side.png`) a la izquierda, contenido a la derecha.
- **En móvil la ilustración se oculta entera** en vez de encogerse: encima de un formulario de dos
  campos solo empuja el botón de envío fuera de la pantalla, y es una imagen pesada.
- **La imagen es decorativa (`alt=""`)**: no aporta nada que el formulario no diga, y anunciarla
  obligaría al lector de pantalla a atravesarla antes de llegar al campo de correo.

`src/modules/public/auth/components/PasswordInput.jsx`

```jsx
import {useState} from 'react';
import {useController} from 'react-hook-form';
import {Eye, EyeOff} from 'lucide-react';
import {Field, FieldError, FieldLabel} from '@/components/ui/field';
import {Input} from '@/components/ui/input';

export default function PasswordInput ({control, name, label, placeholder, autoComplete}) {
  const {field, fieldState} = useController({name, control});
  const [visible, setVisible] = useState(false);
  const ToggleIcon = visible ? EyeOff : Eye;

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <div className="relative">
        <Input
          {...field}
          id={name}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={fieldState.invalid}
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ToggleIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
```

Campo de contraseña con el botón para mostrarla. **No es un `FormInput` de `components/form/`**:
aquel no admite adornos dentro del campo, y agregarle la variante obligaría a tocar el formulario
compartido por todas las pantallas para un detalle que solo usa el login. Usa las mismas piezas
(`useController`, `Field`, `Input`) para verse y validar igual.

`src/modules/public/auth/components/SignInForm.jsx`

```jsx
import {Link} from 'react-router';
import {ShieldCheck} from 'lucide-react';
import useForm from '@/hooks/use-form';
import Form, {FormInput} from '@/components/form/Form';
import {landingDomain} from '@/lib/environment';
import PasswordInput from './PasswordInput';
import {signInService} from '../auth.service';
import {signInSchema} from '../auth.schema';

const SIGNUP_URL = `${landingDomain}/?modal=signup`;

const defaultValues = {email: '', password: ''};

export default function SignInForm () {
  const {control, error, isSubmitting, handleSubmit} = useForm(defaultValues, {
    onSubmit: (body) => signInService.post(body),
    schema: signInSchema,
    onSuccess: (response) => {
      window.location.href = response.authorize_url;
    },
    disableToast: true
  });

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Iniciar Sesión</h1>

      <div className="bg-white border-2 border-gray-300 rounded-2xl p-4 mb-6 flex items-start shadow-[0_3px_0_rgba(0,0,0,0.08)]">
        <ShieldCheck className="h-5 w-5 text-gray-800 mr-3 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-sm text-gray-700">
          Inicia sesión para garantizar una experiencia segura y personalizada.
        </p>
      </div>

      <div className="flex bg-white border-2 border-gray-300 rounded-2xl p-1.5 mb-6 shadow-[0_3px_0_rgba(0,0,0,0.08)]">
        <span className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-center bg-[#15c28f] text-white shadow-[0_2px_0_rgba(0,0,0,0.2)]">
          Iniciar Sesión
        </span>
        <a
          href={SIGNUP_URL}
          className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors text-center text-gray-600 hover:text-gray-900"
        >
          Crear cuenta
        </a>
      </div>

      <Form onSubmit={handleSubmit} className="space-y-4">

        <FormInput
          control={control}
          name="email"
          label="Email"
          type="email"
          placeholder="correo@ejemplo.com"
          autoComplete="email"
        />

        <PasswordInput
          control={control}
          name="password"
          label="Contraseña"
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <div className="text-right">
          <Link to="/reset-password" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-[#15c28f] hover:bg-[#14b087] text-white font-semibold transition-colors rounded-xl shadow-[0_3px_0_rgba(0,0,0,0.18)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Ingresando…' : 'Iniciar Sesión'}
        </button>

      </Form>

      <div className="mt-6 text-center text-sm text-gray-600">
        ¿Aún no tienes cuenta?{' '}
        <a href={SIGNUP_URL} className="text-blue-600 hover:text-blue-700 font-semibold">
          Crear cuenta
        </a>
      </div>
    </>
  );
}
```

- **El login no termina en una navegación de react-router.** `onSuccess` recibe `{authorize_url}` y
  sale del documento con `window.location.href`: quien hace el 302 de vuelta al panel es
  `/api/oauth/proyecto/authorize`, y un `fetch` lo seguiría solo dejando el `Location` ilegible.
- **`disableToast: true`**: el error del login se pinta bajo el formulario (`error.message` de
  `useForm`), no en un toast, para que quede junto a los campos que lo causaron.
- **El alta vive en la landing**, que es otro origen: `SIGNUP_URL` se arma con `landingDomain`
  ([03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#libenvironmentjs)) y se navega con
  un `<a href>` normal, no con `<Link>`.
- La tarjeta y el ancho los pone `AuthSplitCard`: el formulario solo trae el contenido del panel
  derecho.

`src/modules/public/auth/components/ResetPasswordForm.jsx`

```jsx
import {useState} from 'react';
import {Link} from 'react-router';
import {ArrowLeft, Mail} from 'lucide-react';
import useForm from '@/hooks/use-form';
import Form, {FormInput} from '@/components/form/Form';
import {forgotPasswordService} from '../auth.service';
import {resetPasswordSchema} from '../auth.schema';

const defaultValues = {email: ''};

export default function ResetPasswordForm () {
  const [sent, setSent] = useState(false);
  const {control, error, isSubmitting, handleSubmit} = useForm(defaultValues, {
    onSubmit: (body) => forgotPasswordService.post(body),
    schema: resetPasswordSchema,
    onSuccess: () => setSent(true),
    disableToast: true
  });

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-blue-600" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Revisa tu correo</h1>
        <p className="text-sm text-gray-600 mb-6">
          Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña en breve.
        </p>
        <BackToSignIn />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Recuperar Contraseña</h1>

      <p className="text-sm text-gray-600 mb-6">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <Form onSubmit={handleSubmit} className="space-y-4">

        <FormInput
          control={control}
          name="email"
          label="Correo Electrónico"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
        />

        {error && (
          <p className="text-sm text-red-600 text-center">{error.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-[#15c28f] hover:bg-[#14b087] text-white font-semibold transition-colors rounded-xl shadow-[0_3px_0_rgba(0,0,0,0.18)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando…' : 'Enviar Enlace de Recuperación'}
        </button>

      </Form>

      <div className="mt-6 text-center">
        <BackToSignIn />
      </div>
    </>
  );
}

function BackToSignIn () {
  return (
    <Link to="/sign-in" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium">
      <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
      Volver a Iniciar Sesión
    </Link>
  );
}
```

Pide el correo y dispara `POST /api/public/auth/forgot-password`. Tiene dos estados: el formulario y
"revisa tu correo". El server responde igual exista o no la cuenta, para no revelar qué correos
están registrados, y el mensaje de éxito está redactado en condicional por la misma razón. El
botón primario es el mismo que el del login: son dos pantallas de la misma app. El flujo termina en
el correo: el enlace lleva a `/verify/recovery-password`, donde se escribe la contraseña nueva.

### `public/auth` — pantallas

`src/modules/public/auth/sign-in/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import AuthLayout from '../components/AuthLayout';
import AuthSplitCard from '../components/AuthSplitCard';
import SignInForm from '../components/SignInForm';

export default function Page () {
  const {error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return (
    <AuthLayout>
      <AuthSplitCard>
        <SignInForm />
      </AuthSplitCard>
    </AuthLayout>
  );
}
```

`src/modules/public/auth/sign-in/resolvers.js`

```js
export default {};
```

`src/modules/public/auth/reset-password/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import AuthLayout from '../components/AuthLayout';
import AuthSplitCard from '../components/AuthSplitCard';
import ResetPasswordForm from '../components/ResetPasswordForm';

export default function Page () {
  const {error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return (
    <AuthLayout>
      <AuthSplitCard>
        <ResetPasswordForm />
      </AuthSplitCard>
    </AuthLayout>
  );
}
```

`src/modules/public/auth/reset-password/resolvers.js`

```js
export default {};
```

`src/modules/public/auth/sign-up/page.jsx`

```jsx
import {useEffect} from 'react';
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import {landingDomain} from '@/lib/environment';
import resolvers from './resolvers';

const SIGNUP_URL = `${landingDomain}/?modal=signup`;

export default function Page () {
  const {error} = useResolver(resolvers);

  useEffect(() => {
    window.location.href = SIGNUP_URL;
  }, []);

  if (error) {
    return <PageError message={error} />;
  }

  return <PageLoading />;
}
```

`src/modules/public/auth/sign-up/resolvers.js`

```js
export default {};
```

- Las tres pantallas siguen la forma `page.jsx` + `resolvers.js` aunque no lean del API: el
  `resolvers.js` vacío hace que toda pantalla se vea igual, y con cero claves `useResolver` no pinta
  loading. Sus componentes viven en `public/auth/components/`, compartidos por las tres.
- **`sign-up` solo redirige.** El panel no crea cuentas: el alta es el modal `?modal=signup` de la
  landing. La ruta existe para que el enlace tenga a dónde apuntar (marcadores, correos, el
  `/sign-up` que se espera junto a `/sign-in`). Sale con `window.location` y no con `navigate()`
  porque es otro origen; mientras el documento se va, lo único que se pinta es el spinner.

### `public/recovery-password`

`src/modules/public/recovery-password/recovery-password.service.js`

```js
import service from '@/core/service';

export default service('public/auth/recovery-password');
```

`src/modules/public/recovery-password/recovery-password.schema.js`

```js
import zod from 'zod';

const recoveryPasswordSchema = zod.object({
  token: zod.string().min(1, 'Token requerido'),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: zod.string().min(1, 'Confirma tu contraseña')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

export default recoveryPasswordSchema;
```

`src/modules/public/recovery-password/resolvers.js`

```js
export default {
  token: async (params, search) => search.token || ''
};
```

`src/modules/public/recovery-password/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import RecoveryPassword from './components/RecoveryPassword';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <RecoveryPassword {...data} />;
}
```

`src/modules/public/recovery-password/components/RecoveryPassword.jsx`

```jsx
import {Link} from 'react-router';
import useForm from '@/hooks/use-form';
import Form, {FormInput} from '@/components/form/Form';
import recoveryPasswordService from '../recovery-password.service';
import recoveryPasswordSchema from '../recovery-password.schema';

const defaultValues = (token) => ({
  token,
  password: '',
  confirmPassword: ''
});

export default function RecoveryPassword ({token}) {
  const {control, error, isSubmitting, handleSubmit} = useForm(
    defaultValues(token),
    {
      onSubmit: (body) => recoveryPasswordService.post(body),
      schema: recoveryPasswordSchema,
      successMessage: 'Contraseña restablecida correctamente',
      redirectTo: '/'
    }
  );

  if (!token) {
    return (
      <TokenFlowCard>
        <div className="w-28 h-28 mx-auto mb-8 bg-slate-100 rounded-full flex items-center justify-center text-6xl">🤔</div>
        <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Enlace inválido</h1>
        <p className="text-lg text-slate-500 mb-10 font-bold">
          El enlace de restablecimiento no es válido o ha expirado.
        </p>
        <Link to="/" className="inline-block bg-slate-200 text-slate-800 font-bold px-10 py-4 rounded-xl w-full">
          Volver al inicio
        </Link>
      </TokenFlowCard>
    );
  }

  return (
    <TokenFlowCard>
      <div className="w-28 h-28 mx-auto mb-8 bg-amber-100 rounded-full flex items-center justify-center text-6xl">🔑</div>
      <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Nueva contraseña</h1>
      <p className="text-base text-slate-500 mb-8 font-semibold">
        Elige una contraseña segura para tu cuenta.
      </p>

      <Form onSubmit={handleSubmit} className="text-left space-y-4">

        <FormInput
          control={control}
          name="password"
          label="Contraseña"
          placeholder="Mínimo 6 caracteres"
          type="password"
        />

        <FormInput
          control={control}
          name="confirmPassword"
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          type="password"
        />

        {error && (
          <p className="text-destructive text-sm font-semibold text-center">{error.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 text-white font-bold px-10 py-4 rounded-xl hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-md mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {isSubmitting ? 'Procesando...' : 'Restablecer contraseña →'}
        </button>

      </Form>
    </TokenFlowCard>
  );
}

function TokenFlowCard ({children}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-sm p-10 text-center"
        style={{border: '2px solid #e2e8f0', borderBottomWidth: '6px'}}>
        {children}
      </div>
    </div>
  );
}
```

- **Ruta pública**: la credencial es el token del correo, no la sesión. El service envía
  `{token, password, confirmPassword}`.
- **El token se resuelve en `resolvers.js`**, no con `useSearchParams` dentro del componente, para
  que la pantalla siga recibiendo todo por props como el resto. Es cadena vacía y no `undefined`:
  el componente distingue "sin token" (tarjeta de enlace inválido) y el schema exige un string.
- **`TokenFlowCard` se repite** en `email-verification`: los flujos por token son dos pantallas y
  repetir la tarjeta sale más barato que un nivel de rutas anidadas para envolverlas.
- Al terminar, `redirectTo: '/'` lleva a la raíz: sin sesión es el login.

### `public/email-verification`

`src/modules/public/email-verification/email-verification.service.js`

```js
import service from '@/core/service';

export default service('public/auth/email-verification');
```

`src/modules/public/email-verification/resolvers.js`

```js
import emailVerificationService from './email-verification.service';

const INVALID_LINK = 'El enlace de verificación no es válido.';

const verifications = new Map();

export default {
  verification: (params, search) => verify(search.token)
};

function verify (token) {
  if (!token) {
    return Promise.resolve({status: 'error', message: INVALID_LINK});
  }

  if (!verifications.has(token)) {
    verifications.set(token, confirmEmail(token));
  }

  return verifications.get(token);
}

async function confirmEmail (token) {
  try {
    await emailVerificationService.post({token});

    return {status: 'success'};
  } catch (failure) {
    return {status: 'error', message: failure.error || failure.message || INVALID_LINK};
  }
}
```

`src/modules/public/email-verification/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import EmailVerification from './components/EmailVerification';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <EmailVerification {...data} />;
}
```

`src/modules/public/email-verification/components/EmailVerification.jsx`

```jsx
import {Link} from 'react-router';

export default function EmailVerification ({verification}) {
  const isSuccess = verification.status === 'success';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-sm p-10 text-center"
        style={{border: '2px solid #e2e8f0', borderBottomWidth: '6px'}}>

        <div className={`w-28 h-28 mx-auto mb-8 rounded-full flex items-center justify-center text-6xl
          ${isSuccess ? 'bg-green-100' : 'bg-slate-100'}`}>
          {isSuccess ? '✨' : '🤔'}
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">
          {isSuccess ? '¡Genial!' : '¡Ups!'}
        </h1>

        <p className="text-lg text-slate-500 mb-10 font-bold leading-relaxed">
          {isSuccess
            ? 'Tu correo ha sido verificado exitosamente. ¡Ya puedes usar tu cuenta!'
            : verification.message}
        </p>

        <Link
          to="/"
          className={`inline-block font-bold px-10 py-4 rounded-xl w-full
            ${isSuccess
      ? 'bg-slate-900 text-white hover:bg-slate-800'
      : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>
          {isSuccess ? 'Ir al inicio' : 'Volver al inicio'}
        </Link>
      </div>
    </div>
  );
}
```

- **Pública**: quien la usa todavía no tiene la cuenta verificada y el token de un solo uso es la
  credencial. El server expone `POST /api/public/auth/email-verification` con `{token}`.
- **La verificación se dispara al montar** porque el resultado **es** el contenido de la pantalla.
- **La promesa se memoriza por token** en un `Map` de módulo. El server quema el token al
  confirmarlo; sin la memoria, el doble montaje de `StrictMode` o un refetch mandaría una segunda
  petición con el token ya revocado y pintaría el error encima de una verificación que salió bien.
- **El fallo no se deja escapar**: un token vencido no es un error de carga sino una de las dos
  caras de la pantalla (la tarjeta "¡Ups!"). Si el resolver lanzara, `page.jsx` pintaría el
  `PageError` genérico. `service()` lanza `{status, error}` con el mensaje del API; un fallo de
  transporte puede traer solo `message`, y el último recurso es `INVALID_LINK`.
- "Volver al inicio" apunta a `/`: sin sesión es el login; con sesión, el panel del rol.

### `SendEmailVerificationButton`

`src/components/SendEmailVerificationButton/SendEmailVerificationButton.jsx`

```jsx
import useMutation from '@/hooks/use-mutation';

export default function SendEmailVerificationButton ({request}) {
  const [isSending, sendEmailVerification] = useMutation(request, {
    skipConfirm: true,
    successMessage: 'Correo de verificación enviado'
  });

  return (
    <button
      type="button"
      onClick={() => sendEmailVerification({})}
      disabled={isSending}
      className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors inline-block text-center disabled:opacity-60 disabled:cursor-not-allowed">
      {isSending ? 'Enviando...' : 'Verificar correo'}
    </button>
  );
}
```

Botón compartido por los perfiles de todos los roles. `request` es la llamada HTTP que devuelve lo
de `service()`, por ejemplo `(body) => emailVerificationService.post(body)`: así el componente no
importa de ningún `modules/<rol>/` y cada rol le pasa su propio service. `skipConfirm` porque el
reenvío no pide confirmación; el mensaje de éxito lo fija el componente porque es el mismo para
todos los roles.

### `superadmin/profile`

`src/modules/superadmin/profile/profile.service.js`

```js
import service from '@/core/service';

export default service('profile');
```

`src/modules/superadmin/profile/email-verification.service.js`

```js
import service from '@/core/service';

export default service('profile-email-verification');
```

`src/modules/superadmin/profile/profile.schema.js`

```js
import zod from 'zod';

export const updateProfileSchema = zod.object({
  name: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  picture: zod.string().optional().nullable(),
  email: zod.email('Email inválido')
});

export const changePasswordSchema = zod.object({
  currentPassword: zod.string().min(1, 'Debes ingresar tu contraseña actual'),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: zod.string().min(1, 'Debes confirmar la nueva contraseña')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});
```

`src/modules/superadmin/profile/resolvers.js`

```js
import profileService from '@/modules/superadmin/profile/profile.service';

export default {
  profile: () => profileService.get()
};
```

`src/modules/superadmin/profile/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import Profile from './components/Profile';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <Profile {...data} />;
}
```

`src/modules/superadmin/profile/components/Profile.jsx`

```jsx
import {Link} from 'react-router';
import {CheckCircleIcon, XCircleIcon} from 'lucide-react';
import {getPictureSrc} from '@/lib/utils';
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import SendEmailVerificationButton from '@/components/SendEmailVerificationButton/SendEmailVerificationButton';
import {formatDate} from '@/lib/date';
import emailVerificationService from '../email-verification.service';

export default function Profile ({profile}) {
  const lastSignIn = profile.user.lastSignInAt
    ? formatDate(profile.user.lastSignInAt)
    : 'Nunca';

  return (
    <CustomPage title="Mi Perfil" description="Gestiona tu información de cuenta">
      <CustomPageContainer>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link to="/profile/edit">
            <Avatar className="w-24 h-24">
              <AvatarImage src={getPictureSrc(profile.picture)} alt={`Foto de perfil de ${profile.name}`} />
              <AvatarFallback className="text-white text-3xl font-bold bg-linear-to-br from-blue-400 to-blue-600">
                {profile.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{profile.user.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                Superadmin
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {!profile.user.emailConfirmed && <SendEmailVerificationButton request={(body) => emailVerificationService.post(body)} />}
            <Link
              to="/profile/change-password"
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-block text-center"
            >
              Cambiar contraseña
            </Link>
            <Link
              to="/profile/sessions"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-block text-center"
            >
              Sesiones activas
            </Link>
            <Link
              to="/profile/edit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-block text-center"
            >
              Editar perfil
            </Link>
          </div>
        </div>
      </CustomPageContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomPageContainer>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información de la cuenta
          </h3>
          <div className="space-y-4">
            <InfoRow label="Nombre completo" value={profile.name} />
            <InfoRow label="Email" value={profile.user.email} />
            <InfoRow label="Rol" value="Superadmin" />
            <InfoRow label="Fecha de registro" value={formatDate(profile.user.createdAt)} />
            <InfoRow label="Último acceso" value={lastSignIn} />
          </div>
        </CustomPageContainer>

        <CustomPageContainer>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estado de la cuenta
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Email verificado</span>
              {profile.user.emailConfirmed
                ? <span className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                  <CheckCircleIcon className="w-4 h-4" />
                  {formatDate(profile.user.emailConfirmedAt)}
                </span>
                : <span className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <XCircleIcon className="w-4 h-4" />
                  No verificado
                </span>
              }
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Estado</span>
              {profile.user.disabled
                ? <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                  Deshabilitado
                </span>
                : <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  Activo
                </span>
              }
            </div>
            {profile.user.bannedUntil &&
              <InfoRow
                label="Baneado hasta"
                value={formatDate(profile.user.bannedUntil)}
              />
            }
          </div>
        </CustomPageContainer>
      </div>
    </CustomPage>
  );
}

function InfoRow ({label, value}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
```

- **Una sola ruta de perfil para todos los roles.** `service('profile')` apunta a
  `/api/profile`, que ramifica por la sesión. El `GET` devuelve el perfil de la sesión (un objeto,
  no una lista): se lee con `get()`, no con `getOne()`. El `PUT` va sin id.
- **El perfil se lee del API en cada montaje, no del store.** El store lo escribe el canje OAuth y
  no se refresca solo: leído de ahí, confirmar el correo no se vería hasta el próximo login y la
  pantalla seguiría ofreciendo "Verificar correo" sobre una cuenta verificada.
- **La respuesta no se vuelca al store.** Es el recorte que pinta esta pantalla, no el perfil
  completo de la sesión; el store es de donde salen el rol y el bloqueo con los que
  `Authorization` arma el árbol, y pisarlo con un recorte los rompería.
- **`id` no está en `updateProfileSchema` a propósito.** `PUT /api/profile` deriva el perfil de la
  sesión y nunca del body; además, una clave no registrada en el formulario no tiene dónde pintar su
  error, y un id ausente abortaría el envío sin que el usuario viera nada. Regla general: el schema
  de un formulario solo lleva los campos que el formulario registra.
- **En superadmin, `profile.schema.js` vive en `profile/`** y lo importan `profile-edit` y
  `profile-change-password`: la carpeta base del recurso es dueña de lo compartido.
- La foto usa `getPictureSrc` ([11-subida-de-archivos.md](11-subida-de-archivos.md#getpicturesrc)) y
  las fechas `formatDate` ([04-core.md](04-core.md#libdatejs)).

### `superadmin/profile-edit`

`src/modules/superadmin/profile-edit/resolvers.js`

```js
import profileService from '@/modules/superadmin/profile/profile.service';

export default {
  profile: () => profileService.get()
};
```

`src/modules/superadmin/profile-edit/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import EditProfile from './components/EditProfile';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <EditProfile {...data} />;
}
```

`src/modules/superadmin/profile-edit/components/EditProfile.jsx`

```jsx
import useForm from '@/hooks/use-form';
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import Form, {FormInput, FormUploadAvatar} from '@/components/form/Form';
import {useSessionStore} from '@/stores/session.store';
import profileService from '../../profile/profile.service';
import {updateProfileSchema} from '../../profile/profile.schema';

export default function EditProfile ({profile}) {
  const form = useForm({...profile, email: profile.user.email}, {
    onSubmit: saveProfile,
    schema: updateProfileSchema,
    successMessage: 'Perfil actualizado correctamente',
    redirectTo: '/profile'
  });

  return (
    <CustomPage title="Editar Perfil" description="Actualiza tu información de cuenta" goBackPath="/profile">
      <CustomPageContainer className="p-6">
        <Form onSubmit={form.handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información de cuenta
            </h3>
            <FormUploadAvatar
              control={form.control}
              name="picture"
              label="Foto de perfil"
              disabled={form.isSubmitting}
              className="w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                control={form.control}
                name="name"
                label="Nombre"
                placeholder="Nombre"
              />
              <FormInput
                control={form.control}
                name="email"
                label="Email"
                placeholder="Email"
                type="email"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="submit" disabled={form.isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors cursor-pointer">
              {form.isSubmitting ? 'Actualizando...' : 'Guardar cambios'}
            </button>
          </div>
        </Form>
      </CustomPageContainer>
    </CustomPage>
  );
}

async function saveProfile (body) {
  const response = await profileService.put(body);
  const {profile} = useSessionStore.getState();
  const emailChanged = body.email !== profile.user.email;

  useSessionStore.setState({
    profile: {
      ...profile,
      name: body.name,
      picture: response.picture,
      user: {
        ...profile.user,
        email: body.email,
        ...(emailChanged ? {emailConfirmed: false, emailConfirmedAt: null} : {})
      }
    }
  });

  return response;
}
```

- **Se siembra con el mismo `GET /api/profile`** que la pantalla de perfil: el recorte que devuelve
  trae justo los campos que el formulario registra. Sembrarlo con el store daría datos viejos.
- **`saveProfile` actualiza el store a mano** después del `PUT`, porque el header y el sidebar leen
  nombre, foto y correo de ahí. Solo toca esos campos y conserva el resto (`role`, `disabled`,
  `bannedUntil`). Si el correo cambió, marca `emailConfirmed: false`: el server exige confirmar el
  correo nuevo.
- La foto se sube con `FormUploadAvatar` ([11-subida-de-archivos.md](11-subida-de-archivos.md#formuploadavatar)).

### `superadmin/profile-change-password`

`src/modules/superadmin/profile-change-password/profile-password.service.js`

```js
import service from '@/core/service';

export default service('profile-password');
```

`src/modules/superadmin/profile-change-password/resolvers.js`

```js
export default {};
```

`src/modules/superadmin/profile-change-password/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import ChangePassword from './components/ChangePassword';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <ChangePassword {...data} />;
}
```

`src/modules/superadmin/profile-change-password/components/ChangePassword.jsx`

```jsx
import useForm from '@/hooks/use-form';
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import Form, {FormInput} from '@/components/form/Form';
import {changePasswordSchema} from '../../profile/profile.schema';
import profilePasswordService from '../profile-password.service';

export default function ChangePassword () {
  const form = useForm({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  }, {
    onSubmit: (body) => profilePasswordService.put(body),
    schema: changePasswordSchema,
    successMessage: 'Contraseña actualizada correctamente',
    redirectTo: '/profile'
  });

  return (
    <CustomPage
      title="Cambiar contraseña"
      description="Actualiza tu contraseña para mantener segura tu cuenta de administración"
      goBackPath="/profile"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <CustomPageContainer className="xl:col-span-2 p-6 lg:p-8">
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                  Seguridad administrativa
                </span>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Protege el acceso al panel de administración
                </h2>
                <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                  Cambia tu contraseña desde aquí para asegurar el acceso a la gestión de cuentas y configuración general.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Política activa
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">6+</p>
                </div>
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    Validación
                  </p>
                  <p className="mt-2 text-sm font-medium text-blue-800 dark:text-blue-200">
                    Requiere contraseña actual
                  </p>
                </div>
              </div>
            </div>

            <Form onSubmit={form.handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Confirmación de identidad
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Antes de guardar el cambio, valida tu identidad con la contraseña actual de tu cuenta superadmin.
                    </p>
                  </div>

                  <FormInput
                    control={form.control}
                    name="currentPassword"
                    label="Contraseña actual"
                    placeholder="Ingresa tu contraseña actual"
                    type="password"
                    disabled={form.isSubmitting}
                  />
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Nueva contraseña
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Define una nueva clave para tu acceso diario al entorno administrativo.
                    </p>
                  </div>

                  <FormInput
                    control={form.control}
                    name="password"
                    label="Nueva contraseña"
                    placeholder="Escribe tu nueva contraseña"
                    type="password"
                    disabled={form.isSubmitting}
                  />
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Confirmación final
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Repite la nueva contraseña para asegurarte de que el cambio se guarde correctamente.
                    </p>
                  </div>

                  <FormInput
                    control={form.control}
                    name="confirmPassword"
                    label="Confirmar nueva contraseña"
                    placeholder="Repite tu nueva contraseña"
                    type="password"
                    disabled={form.isSubmitting}
                  />
                </div>
              </div>

              {form.error?.message && (
                <div
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
                  role="alert"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">{form.error.message}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  El cambio se aplica de inmediato y protege tus próximos accesos al panel.
                </p>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={form.isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    {form.isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </div>
              </div>
            </Form>
          </div>
        </CustomPageContainer>

        <div className="space-y-6">
          <CustomPageContainer className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reglas del cambio
            </h3>
            <div className="mt-4 space-y-4">
              <SecurityItem
                title="Mínimo 6 caracteres"
                description="La nueva contraseña debe respetar la política vigente del sistema."
              />
              <SecurityItem
                title="Sin repetir la actual"
                description="No puedes volver a guardar la misma contraseña que ya está activa."
              />
              <SecurityItem
                title="Confirmación obligatoria"
                description="Debes validar la contraseña actual antes de aplicar el cambio."
              />
            </div>
          </CustomPageContainer>

          <CustomPageContainer className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Buenas prácticas
            </h3>
            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Usa una contraseña exclusiva para tu acceso administrativo y no la reutilices en otros servicios.
              </p>
              <p>
                Evita guardar credenciales en equipos compartidos o navegadores que no controles.
              </p>
              <p>
                Si administras desde varios dispositivos, revisa periódicamente quién tiene acceso a tus sesiones.
              </p>
            </div>
          </CustomPageContainer>
        </div>
      </div>
    </CustomPage>
  );
}

function SecurityItem ({title, description}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <p className="font-medium text-gray-900 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
```

`PUT /api/profile-password` con `{currentPassword, password, confirmPassword}`. La contraseña actual
es obligatoria: una sesión robada no alcanza para cambiarla. El formulario arranca vacío, así que
`resolvers.js` es `export default {}`. El error del server se pinta en un `role="alert"` además del
toast de `useForm`.

### `superadmin/profile-sessions`

`src/modules/superadmin/profile-sessions/profile-sessions.service.js`

```js
import service from '@/core/service';

export default service('profile-sessions');
```

`src/modules/superadmin/profile-sessions/resolvers.js`

```js
import profileSessionsService from '@/modules/superadmin/profile-sessions/profile-sessions.service';

export default {
  sessions: () => profileSessionsService.get()
};
```

`src/modules/superadmin/profile-sessions/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import {Button} from '@/components/ui/button';
import resolvers from './resolvers';
import Sessions from './components/Sessions';

export default function Page () {
  const {data, error, isLoading, refetch} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <PageError message={error} />
        <Button type="button" variant="outline" className="cursor-pointer" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return <Sessions sessions={data.sessions} refetch={refetch} />;
}
```

`src/modules/superadmin/profile-sessions/components/Sessions.jsx`

```jsx
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import SessionRow from './SessionRow';

export default function Sessions ({sessions, refetch}) {
  return (
    <CustomPage
      title="Sesiones activas"
      description="Dispositivos con la sesión abierta en tu cuenta de superadmin. Cierra el que no reconozcas."
      goBackPath="/profile"
    >
      {sessions.length === 0
        ? <CustomPageContainer>
          <p className="text-gray-600 dark:text-gray-400">No hay sesiones activas en tu cuenta.</p>
        </CustomPageContainer>
        : <CustomPageContainer className="p-0">
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {sessions.map((session, index) => <SessionRow key={session.id} session={session} position={index + 1} total={sessions.length} refetch={refetch} />)}
          </ul>
        </CustomPageContainer>}
    </CustomPage>
  );
}
```

`src/modules/superadmin/profile-sessions/components/SessionRow.jsx`

```jsx
import {Button} from '@/components/ui/button';
import useMutation from '@/hooks/use-mutation';
import {useSessionStore} from '@/stores/session.store';
import {formatDate} from '@/lib/date';
import {deviceLabel} from '@/lib/user-agent';
import profileSessionsService from '@/modules/superadmin/profile-sessions/profile-sessions.service';

const STARTED_AT_FORMAT = {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'};

export default function SessionRow ({session, position, total, refetch}) {
  const device = deviceLabel(session.userAgent);
  const startedAt = formatDate(session.createdAt, STARTED_AT_FORMAT);
  const [isLoading, submit] = useMutation(
    () => profileSessionsService.remove({id: session.id}),
    session.isCurrent ? currentSessionOptions() : otherSessionOptions(refetch)
  );

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">{device}</span>
          {session.isCurrent
            ? <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
              Actual
            </span>
            : null}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Inicio: {startedAt}</p>
      </div>
      <Button
        type="button"
        variant="destructive"
        className="cursor-pointer w-full sm:w-auto"
        disabled={isLoading}
        aria-label={`Cerrar sesión de ${device} iniciada el ${startedAt} (${position} de ${total})`}
        onClick={() => submit()}
      >
        Cerrar sesión
      </Button>
    </li>
  );
}

function currentSessionOptions () {
  return {
    confirm: {
      title: '¿Cerrar la sesión actual?',
      description: 'Es la sesión que estás usando: se cerrará y saldrás de la aplicación. Tendrás que iniciar sesión de nuevo.',
      confirmText: 'Cerrar y salir'
    },
    successMessage: 'Sesión cerrada correctamente',
    onSuccess: endSession,
    onError: endSession
  };
}

function otherSessionOptions (refetch) {
  return {
    skipConfirm: true,
    successMessage: 'Sesión cerrada correctamente',
    onSuccess: () => refetch(),
    onError: () => refetch()
  };
}

function endSession () {
  useSessionStore.getState().clear();
  window.location.assign('/');
}
```

- **`GET /api/profile-sessions`** lista las sesiones abiertas de la cuenta; cada una trae `id`,
  `userAgent`, `createdAt` e `isCurrent`. **`DELETE`** con `{id}` cierra una.
- **Etiqueta legible del dispositivo** con `deviceLabel(userAgent)`
  ([04-core.md](04-core.md#libuser-agentjs)) y fecha de inicio con `formatDate` y un formato que
  incluye hora ([04-core.md](04-core.md#libdatejs)).
- **La sesión actual es distinta.** Cerrarla es salir: pide confirmación y, conteste lo que conteste
  el server, vacía el store y navega a `/` (el mismo `endSession` incondicional de `useLogout`).
  Cerrar otra no pide confirmación y siempre refresca la lista, también si falla, para no dejar en
  pantalla una fila que ya no existe.
- **`aria-label` completo en cada botón.** Todos dicen "Cerrar sesión"; el lector de pantalla
  necesita el dispositivo, la fecha y la posición para distinguirlos.
- **Error con "Reintentar"**: esta pantalla es la herramienta para echar a un intruso; si la carga
  falla, el usuario tiene que poder reintentar sin recargar.

### `member/profile*`

El código de `member` se escribe en `modules/member/` duplicado, sin importar nada de
`modules/superadmin/`. Los campos del perfil de `member` son `name`, `surname`, `email`, `phone`,
`birthdate` y la foto (`picture`, con `FormUploadAvatar`).

#### Archivos idénticos salvo el rol en el import

| Archivo en `modules/member/` | Diferencia exacta con el de `modules/superadmin/` |
|---|---|
| `profile/profile.service.js` | Ninguna. |
| `profile/email-verification.service.js` | Ninguna. |
| `profile/page.jsx` | Ninguna. |
| `profile/resolvers.js` | Importa `@/modules/member/profile/profile.service`. |
| `profile-edit/resolvers.js` | Importa `@/modules/member/profile/profile.service`. |
| `profile-edit/page.jsx` | Importa y pinta `EditProfileForm` desde `./components/EditProfileForm` en vez de `EditProfile`. |
| `profile-change-password/profile-password.service.js` | Ninguna. |
| `profile-change-password/resolvers.js` | Ninguna (`export default {}`). |
| `profile-change-password/page.jsx` | Ninguna. |
| `profile-sessions/profile-sessions.service.js` | Ninguna. |
| `profile-sessions/page.jsx` | Ninguna. |
| `profile-sessions/resolvers.js` | Importa `@/modules/member/profile-sessions/profile-sessions.service`. |
| `profile-sessions/components/Sessions.jsx` | `description="Estos son los dispositivos con la sesión abierta en tu cuenta. Cierra el que no reconozcas."` |
| `profile-sessions/components/SessionRow.jsx` | Importa `@/modules/member/profile-sessions/profile-sessions.service`; la insignia "Actual" usa `bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400` en vez de las clases `blue`. |
| `disabled-account/page.jsx` y `disabled-account/resolvers.js` | Ninguna. |

En `member` no hay `profile/profile.schema.js`: el schema de edición vive en `profile-edit/` y el de
cambio de contraseña en `profile-change-password/`, cada uno junto a la única pantalla que lo usa.

#### `member/profile/components/Profile.jsx`

`src/modules/member/profile/components/Profile.jsx`

```jsx
import {Link} from 'react-router';
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import SendEmailVerificationButton from '@/components/SendEmailVerificationButton/SendEmailVerificationButton';
import emailVerificationService from '@/modules/member/profile/email-verification.service';
import {getPictureSrc} from '@/lib/utils';

export default function Profile ({profile}) {
  const names = [profile.name, profile.surname].filter(Boolean).join(' ');

  return (
    <CustomPage title="Mi Perfil" description="Gestiona tu información personal">
      <CustomPageContainer>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link to="/profile/edit" aria-label="Editar perfil">
            <Avatar className="w-24 h-24">
              <AvatarImage src={getPictureSrc(profile.picture)} alt={`Foto de perfil de ${names}`} />
              <AvatarFallback className="text-white text-3xl font-bold bg-linear-to-br from-green-400 to-green-600">
                {profile.name?.[0]?.toUpperCase()}{profile.surname?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{names}</h2>
            <p className="text-gray-600 dark:text-gray-400">{profile.user.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                Miembro activo
              </span>
            </div>
          </div>
          {!profile.user.emailConfirmed && <SendEmailVerificationButton request={(body) => emailVerificationService.post(body)} />}
          <Link
            to="/profile/change-password"
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-block text-center"
          >
            Cambiar contraseña
          </Link>
          <Link
            to="/profile/sessions"
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors inline-block text-center"
          >
            Sesiones activas
          </Link>
          <Link
            to="/profile/edit"
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors inline-block text-center"
          >
            Editar perfil
          </Link>
        </div>
      </CustomPageContainer>

      <CustomPageContainer>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Información personal
        </h3>
        <div className="space-y-4">
          <InfoRow label="Nombre completo" value={names} />
          <InfoRow label="Email" value={profile.user.email} />
          <InfoRow label="Teléfono" value={profile.phone || 'N/A'} />
          <InfoRow label="Fecha de nacimiento" value={profile.birthdate ? new Date(profile.birthdate).toLocaleDateString('es-ES') : 'N/A'} />
          <InfoRow label="Fecha de registro" value={new Date(profile.createdAt).toLocaleDateString('es-ES')} />
          <InfoRow label="Correo confirmado" value={profile.user.emailConfirmed ? 'Sí' : 'No'} />
        </div>
      </CustomPageContainer>
    </CustomPage>
  );
}

function InfoRow ({label, value}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
```

El nombre completo se arma con `[name, surname].filter(Boolean).join(' ')`: omite la parte vacía
sin dejar un espacio suelto. Las fechas de esta pantalla usan `toLocaleDateString('es-ES')`
directo; el locale es el mismo `es-ES` de `lib/date.js` y se ajusta junto con él.

#### `member/profile-edit`

`src/modules/member/profile-edit/profile.schema.js`

```js
import zod from 'zod';

export const updateProfileSchema = zod.object({
  picture: zod.string().optional().nullable(),
  name: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  surname: zod.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: zod.email('Email inválido'),
  phone: zod.string().optional().nullable(),
  birthdate: zod.date('Fecha de nacimiento requerida').or(zod.string('Fecha de nacimiento requerida')).optional().nullable()
});
```

`src/modules/member/profile-edit/components/EditProfileForm.jsx`

```jsx
import CustomPage from '@/components/CustomPage/CustomPage';
import Form, {FormInput, FormInputDatePicker, FormUploadAvatar} from '@/components/form/Form';
import useForm from '@/hooks/use-form';
import {useSessionStore} from '@/stores/session.store';
import profileService from '@/modules/member/profile/profile.service';
import {updateProfileSchema} from '@/modules/member/profile-edit/profile.schema';

export default function EditProfileForm ({profile}) {
  const form = useForm({
    ...profile,
    email: profile.user.email,
    birthdate: profile.birthdate ? new Date(profile.birthdate) : null
  }, {
    onSubmit: async (body) => {
      const response = await profileService.put(body);

      syncSession(body, response.picture);

      return response;
    },
    schema: updateProfileSchema,
    successMessage: 'Perfil actualizado correctamente',
    redirectTo: '/profile'
  });

  return (
    <CustomPage title="Editar Perfil" description="Actualiza tu información personal" goBackPath="/profile">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <Form onSubmit={form.handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información Personal
            </h3>
            <FormUploadAvatar
              control={form.control}
              name="picture"
              label="Foto de perfil"
              disabled={form.isSubmitting}
              className="w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                control={form.control}
                name="name"
                label="Nombre"
                placeholder="Nombre"
              />
              <FormInput
                control={form.control}
                name="surname"
                label="Apellido"
                placeholder="Apellido"
              />
              <FormInput
                control={form.control}
                name="email"
                label="Email"
                placeholder="Email"
              />
              <FormInput
                control={form.control}
                name="phone"
                label="Teléfono"
                placeholder="Teléfono"
              />
              <FormInputDatePicker
                control={form.control}
                name="birthdate"
                label="Fecha de nacimiento"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="submit" disabled={form.isSubmitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors cursor-pointer">
              {form.isSubmitting ? 'Actualizando...' : 'Guardar cambios'}
            </button>
          </div>
        </Form>
      </div>
    </CustomPage>
  );
}

function syncSession ({email, ...values}, picture) {
  const {profile} = useSessionStore.getState();

  useSessionStore.setState({
    profile: {
      ...profile,
      ...values,
      picture,
      user: nextUser(profile.user, email)
    }
  });
}

function nextUser (user, email) {
  if (email === user.email) {
    return user;
  }

  return {...user, email, emailConfirmed: false, emailConfirmedAt: null};
}
```

- `birthdate` llega como string ISO y se convierte a `Date` para `FormInputDatePicker`; el schema
  acepta `Date` o string porque el campo puede no haberse tocado.
- `syncSession` cumple el mismo papel que `saveProfile` en superadmin: vuelca al store los campos
  editados (menos `email`, que va dentro de `user`) y marca el correo como no confirmado si cambió.
  El header de `member` lee `name`, `surname` y `user.email` del store.

#### `member/profile-change-password`

`src/modules/member/profile-change-password/profile-password.schema.js`

```js
import zod from 'zod';

export const changePasswordSchema = zod.object({
  currentPassword: zod.string().min(1, 'Debes ingresar tu contraseña actual'),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: zod.string().min(1, 'Debes confirmar la nueva contraseña')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});
```

`src/modules/member/profile-change-password/components/ChangePassword.jsx`

```jsx
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import Form, {FormInput} from '@/components/form/Form';
import useForm from '@/hooks/use-form';
import profilePasswordService from '@/modules/member/profile-change-password/profile-password.service';
import {changePasswordSchema} from '@/modules/member/profile-change-password/profile-password.schema';

export default function ChangePassword () {
  const form = useForm({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  }, {
    onSubmit: (body) => profilePasswordService.put(body),
    schema: changePasswordSchema,
    successMessage: 'Contraseña actualizada correctamente',
    redirectTo: '/profile'
  });

  return (
    <CustomPage
      title="Cambiar contraseña"
      description="Actualiza tu contraseña para mantener segura tu cuenta"
      goBackPath="/profile"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <CustomPageContainer className="xl:col-span-2 p-6 lg:p-8">
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                  Seguridad de la cuenta
                </span>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Actualiza tus credenciales de acceso
                </h2>
                <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                  Confirma tu contraseña actual y define una nueva clave para proteger tu cuenta.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Longitud mínima
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">6</p>
                </div>
                <div className="rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-950/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-green-700 dark:text-green-300">
                    Verificación
                  </p>
                  <p className="mt-2 text-sm font-medium text-green-800 dark:text-green-200">
                    Contraseña actual obligatoria
                  </p>
                </div>
              </div>
            </div>

            <Form onSubmit={form.handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Validación de identidad
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Necesitamos tu contraseña actual para confirmar que eres tú quien realiza el cambio.
                    </p>
                  </div>

                  <FormInput
                    control={form.control}
                    name="currentPassword"
                    label="Contraseña actual"
                    placeholder="Ingresa tu contraseña actual"
                    type="password"
                    disabled={form.isSubmitting}
                  />
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Nueva contraseña
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Usa una clave distinta a la actual y fácil de recordar para ti.
                    </p>
                  </div>

                  <FormInput
                    control={form.control}
                    name="password"
                    label="Nueva contraseña"
                    placeholder="Escribe tu nueva contraseña"
                    type="password"
                    disabled={form.isSubmitting}
                  />
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Confirmación
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Repite exactamente la nueva contraseña para evitar errores.
                    </p>
                  </div>

                  <FormInput
                    control={form.control}
                    name="confirmPassword"
                    label="Confirmar nueva contraseña"
                    placeholder="Repite tu nueva contraseña"
                    type="password"
                    disabled={form.isSubmitting}
                  />
                </div>
              </div>

              {form.error?.message && (
                <div
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
                  role="alert"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">{form.error.message}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Al guardar, tu nueva contraseña quedará activa de inmediato.
                </p>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={form.isSubmitting}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    {form.isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </div>
              </div>
            </Form>
          </div>
        </CustomPageContainer>

        <div className="space-y-6">
          <CustomPageContainer className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reglas del cambio
            </h3>
            <div className="mt-4 space-y-4">
              <SecurityItem
                title="Mínimo 6 caracteres"
                description="La nueva contraseña debe cumplir la política actual del sistema."
              />
              <SecurityItem
                title="Sin reutilizar la clave"
                description="No puedes guardar una contraseña idéntica a la que usas hoy."
              />
              <SecurityItem
                title="Confirmación obligatoria"
                description="Debes repetir la nueva contraseña para completar el cambio."
              />
            </div>
          </CustomPageContainer>

          <CustomPageContainer className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recomendaciones
            </h3>
            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Evita usar datos personales evidentes como tu nombre o fecha de nacimiento.
              </p>
              <p>
                Si compartes dispositivos, cierra sesión cuando termines.
              </p>
              <p>
                Mantén una contraseña única para Proyecto y no la reutilices en otros servicios.
              </p>
            </div>
          </CustomPageContainer>
        </div>
      </div>
    </CustomPage>
  );
}

function SecurityItem ({title, description}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <p className="font-medium text-gray-900 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
```

## DevAccounts (opcional)

**Condición para transportarlo:** el destino tiene cuentas demo **no productivas** con una
contraseña compartida conocida (fixtures de desarrollo) y quiere entrar con un clic en
desarrollo. Si no las tiene, este archivo no entra.

> **Advertencia.** `DevAccounts.jsx` empaqueta la contraseña de las cuentas demo en el bundle
> público: cualquiera que abra el JavaScript del panel la lee. El archivo vive aislado y se monta con
> una sola línea para que pueda quitarse antes de publicar, pero **el plan no trae ningún paso de
> build que lo quite**. Si el destino lo transporta, debe asegurarse por su cuenta de que no llega a
> producción (no montarlo en la rama que se despliega, o quitar el import y la línea en el build), y
> de que esas cuentas no existen en la base productiva.

`src/modules/public/auth/components/DevAccounts.jsx`

```jsx
import {useState} from 'react';
import {ShieldCheck, User, Users} from 'lucide-react';
import {signInService} from '../auth.service';

const PASSWORD = 'proyectodotcom';

const SECTIONS = [
  {
    title: 'Superadministradores',
    icon: ShieldCheck,
    iconColor: 'text-orange-500',
    avatarBg: 'bg-orange-100',
    users: [
      {name: 'Superadmin', email: 'demo+superadmin@dominio.com'}
    ]
  },
  {
    title: 'Miembros',
    icon: Users,
    iconColor: 'text-[#15c28f]',
    avatarBg: 'bg-[#15c28f]/10',
    users: [
      {name: 'Miembro', email: 'demo+member@dominio.com'}
    ]
  }
];

export default function DevAccounts () {
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');

  const quickSignIn = async (email) => {
    setError('');
    setPending(email);

    try {
      const {authorize_url: authorizeUrl} = await signInService.post({email, password: PASSWORD});

      window.location.href = authorizeUrl;
    } catch (failure) {
      setError(failure?.error || 'No se pudo iniciar sesión');
      setPending('');
    }
  };

  return (
    <section className="w-full max-w-5xl">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-orange-500" aria-hidden="true" />
            Dev Login Helper
          </h2>
          <p className="text-sm text-gray-500">Selecciona un perfil de prueba para ingresar instantáneamente.</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {SECTIONS.map((section) => (
            <DevSection key={section.title} section={section} pending={pending} onPick={quickSignIn} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DevSection ({section, pending, onPick}) {
  const SectionIcon = section.icon;

  return (
    <section aria-label={section.title} className="mb-6 last:mb-0">
      <div className="flex items-center mb-3">
        <SectionIcon className={`h-5 w-5 mr-2 ${section.iconColor}`} aria-hidden="true" />
        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">{section.title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {section.users.map((user) => (
          <button
            key={user.email}
            type="button"
            disabled={pending !== ''}
            onClick={() => onPick(user.email)}
            className="flex items-center p-3 text-left border-2 border-gray-100 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 ${section.avatarBg}`}>
              <User className={`h-4 w-4 ${section.iconColor}`} aria-hidden="true" />
            </span>
            <span className="overflow-hidden">
              <span className="block text-sm font-semibold text-gray-800 truncate">{user.name}</span>
              <span className="block text-[10px] text-gray-500 truncate">{user.email}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
```

- **Mismo camino que el formulario**: `signin` → `authorize_url` → navegación del documento. No hay
  atajo que salte el flujo OAuth; solo se ahorra escribir credenciales.
- **`<section aria-label>` por grupo** y no un `<div>`: cada grupo queda como landmark con nombre
  accesible, y se puede elegir un grupo por su nombre sin depender de las clases del markup.
- Mientras un ingreso está en curso, todos los botones quedan deshabilitados (`pending !== ''`).

Para montarlo, `sign-in/page.jsx` cambia en dos líneas (solo el bloque que cambia; el resto del
archivo queda igual al de la sección anterior):

```jsx
import DevAccounts from '../components/DevAccounts';
```

```jsx
    <AuthLayout>
      <AuthSplitCard>
        <SignInForm />
      </AuthSplitCard>
      <DevAccounts />
    </AuthLayout>
```

El listado va debajo de la tarjeta, como una tarjeta más dentro de `AuthLayout`, que ya apila con
`gap-6`. Mantener el montaje en **una sola línea** más su import es lo que permite quitarlo con un
paso de build o a mano sin tocar nada más.

## Notificaciones (opcional)

**Condición para transportarlo:** el API del destino expone el endpoint de notificaciones
(`GET /api/notifications` y `PUT /api/notifications` para marcarlas leídas). El hook
`useNotifications` y su service están en
[05-hooks.md](05-hooks.md#usenotifications-opcional). Sin ese endpoint, nada de esta sección entra y
los headers quedan como en la sección de layouts.

`src/components/Notifications/notifications-listener.jsx`

```jsx
import {useState} from 'react';
import {Bell, Check} from 'lucide-react';
import useNotifications from '@/hooks/use-notifications';
import useMutation from '@/hooks/use-mutation';
import notificationsService from '@/modules/notifications/notifications.service';

export default function NotificationsListener () {
  const [open, setOpen] = useState(false);
  const {notifications, unreadCount, refresh} = useNotifications();
  const [, markRead] = useMutation((body) => notificationsService.put(body), {
    skipConfirm: true,
    disableToast: true,
    onSuccess: refresh
  });

  const handleMarkAll = () => {
    markRead({ids: notifications.filter((item) => !item.readAt).map((item) => item.id)});
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notificaciones (${unreadCount} sin leer)` : 'Notificaciones'}
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            role="presentation"
            aria-hidden="true"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-4 right-4 top-16 max-h-[70vh] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <p className="font-semibold text-gray-900 dark:text-white">Notificaciones</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline shrink-0"
                >
                  <Check className="w-3 h-3" />
                  Marcar leídas
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No tienes notificaciones
              </p>
            ) : (
              <ul>
                {notifications.map((item) => (
                  <li
                    key={item.id}
                    className={`p-3 border-b border-gray-100 dark:border-gray-700/50 ${item.readAt ? 'opacity-60' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">{item.title}</p>
                    {item.body && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 break-words">{item.body}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

- Es cromo del panel (la campana del header), no una ruta: por eso vive en `components/` y su
  service en `modules/notifications/`, sin pantalla.
- "Marcar leídas" manda los ids no leídos con `PUT` al path base (sin id en la URL: marca las del
  usuario de la sesión), sin confirmación ni toast, y refresca la lista al terminar.
- En móvil el panel es `fixed` a lo ancho bajo el header; desde `sm:` es un desplegable anclado a
  la campana.
- El contador se corta en `9+` para no romper el círculo.

Para montarlo, cada header agrega dos líneas (solo el bloque que cambia):

`components/Superadmin/Header.jsx`

```jsx
import NotificationsListener from '@/components/Notifications/notifications-listener';
```

```jsx
        <div className="flex items-center gap-4 ml-auto">
          <NotificationsListener />

          <div className="relative">
```

`components/Member/Header.jsx`

```jsx
import NotificationsListener from '@/components/Notifications/notifications-listener';
```

```jsx
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <NotificationsListener />

          <div className="relative">
```

En ambos casos la campana queda a la izquierda del menú de la cuenta, dentro del mismo contenedor
flex. El polling lo hace el hook, así que montar el listener en el header (que está en todas las
pantallas del panel) basta para que el contador se mantenga al día.

## Reglas de uso

- **El rol decide el árbol en un solo lugar: `Authorization`.** Ninguna pantalla pregunta por el rol
  para decidir si se muestra; si una pantalla no debe verse para un rol, no se registra en su
  archivo de rutas. Evita pantallas que "se esconden" con condicionales y quedan accesibles por URL.
- **Un rol nuevo = una entrada en `routesByRole`, otra en `layoutsByRole`, su archivo
  `<rol>.routes.jsx` y su carpeta `components/<Rol>/`.** Si falta la entrada de `layoutsByRole`, una
  cuenta bloqueada de ese rol rompe el render.
- **Nunca pongas el bloqueo como única defensa.** El árbol de `DisabledAccount` es cromo; la
  autorización real está en el API. No saltees la validación del server porque "el cliente ya no deja
  entrar".
- **Nunca guardes el token en JavaScript.** La sesión vive en la cookie httpOnly que pone el canje;
  el store solo guarda el perfil. No agregues un header `Authorization` ni leas `document.cookie`.
- **El login sale por navegación del documento, nunca por `fetch` al `authorize`.** Seguir el 302
  con `fetch` pierde el code.
- **El logout es incondicional.** Usa siempre `useLogout` (o el `endSession` de la sesión actual en
  `profile-sessions`): salir del panel no depende de que el server conteste.
- **Rutas públicas por token van en `public.routes.jsx`; rutas que solo existen sin sesión, en
  `no-session.routes.jsx`.** Mezclarlas hace que un usuario con sesión no pueda abrir el enlace de
  su correo, o que vea el login estando dentro.
- **El perfil se lee del API en las pantallas de perfil**, y el store solo se actualiza a mano con
  los campos editados después de guardar. No vuelques respuestas recortadas al store.
- **Duplica el cromo y los módulos de perfil por rol.** No crees un `ProfileBase` compartido ni un
  layout parametrizado por rol; lo único compartido entre roles son los componentes de
  `components/` que no conocen el rol (`DisabledAccount`, `SendEmailVerificationButton`,
  `NotFoundScreen`, `components/form/`).
- **Las piezas opcionales solo entran si se cumple su condición.** `DevAccounts` nunca llega a
  producción; `NotificationsListener` solo si existe el endpoint.

## Checklist del ejecutor

- [ ] `main.jsx` monta `App` dentro de `StrictMode` y `BrowserRouter`, e importa `globals.css`.
- [ ] `App.jsx` tiene solo `ThemeProvider`, `Authorization`, `Toaster` (configuración exacta) y
      `ConfirmationDialog`; los modales globales, si hay, van entre `Authorization` y `Toaster`.
- [ ] `Authorization.jsx` tiene `routesByRole` y `layoutsByRole` con una entrada por cada rol del
      destino y llama `useRoutes` una sola vez, sin early return.
- [ ] El árbol de cuenta bloqueada tiene ruta índice y `*`, ambos con `DisabledAccount`.
- [ ] `public.routes.jsx` registra `/oauth/proyecto` con el slug del destino y coincide con el
      `redirect_uri` registrado en el server.
- [ ] `no-session.routes.jsx` tiene índice, `/sign-in`, `/sign-up`, `/reset-password` y `*` →
      `/sign-in`.
- [ ] Cada `<rol>.routes.jsx` tiene layout en `/`, dashboard como índice, las pantallas de perfil,
      `disabled-account` y `*` con `NotFoundScreen` al final.
- [ ] `oauth.service.js` usa `service('oauth/proyecto/token')` y `logout.service.js` usa
      `service('auth-logout')`.
- [ ] Se probó a mano el flujo completo: login → navegación a `authorize_url` → 302 a
      `/oauth/proyecto` → canje → panel; y que el token no aparece en `localStorage`.
- [ ] Cada rol tiene `components/<Rol>/{<Rol>Layout,Header,Sidebar}.jsx`, con el logo
      `logo-white.png`/`logo-base.png` y `aria-label="Proyecto"`.
- [ ] Los sidebars tienen exactamente los ítems base: superadmin (Panel general, Superadmins,
      Miembros, Perfil) y member (Panel general, Perfil).
- [ ] `constants/support.js` exporta solo `supportEmail` con el correo real de soporte del destino.
- [ ] `DisabledAccount` muestra el correo de soporte y el botón de cerrar sesión.
- [ ] Las variables CSS que usa `NotFoundScreen` están definidas en el `globals.css` del destino o
      se reemplazaron por colores del tema.
- [ ] `SignInForm.jsx` y `sign-up/page.jsx` arman `SIGNUP_URL` con `landingDomain`.
- [ ] `login-side.png`, `logo-base.png` y `logo-white.png` están en `public/assets/images/`.
- [ ] `modules/superadmin/` y `modules/member/` tienen `profile`, `profile-edit`,
      `profile-change-password`, `profile-sessions` y `disabled-account`, cada una con `page.jsx` y
      `resolvers.js`, y ninguna importa del otro rol.
- [ ] El perfil de `member` registra solo `name`, `surname`, `email`, `phone`, `birthdate` y
      `picture`.
- [ ] Se decidió por escrito si entra `DevAccounts`; si entra, hay un mecanismo verificado que
      impide que llegue a producción.
- [ ] Se decidió por escrito si entra `NotificationsListener`; si entra, está montado en el header
      de cada rol y el endpoint existe.
