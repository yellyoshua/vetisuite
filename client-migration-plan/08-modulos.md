# 08 · Módulos

## Propósito

Define la forma de una pantalla de la SPA y la aplica a la gestión de cuentas que el panel
`superadmin` trae de base: `members` (las cuentas del rol `member`) y `superadmins`. Se usa en la
**Fase 8** (módulos y gestión de cuentas), después de tener core, hooks, stores, componentes, modales
por query y rutas. Las piezas que se repiten por cada recurso de dominio del destino están en
[13-templates.md](13-templates.md#checklist-por-módulo); este documento explica el porqué de esa forma
y trae las pantallas de cuentas completas.

## Anatomía de un módulo

Un módulo es una carpeta por pantalla dentro de `src/modules/<rol>/`. La convención de carpetas está
en [02-estructura-de-carpetas.md](02-estructura-de-carpetas.md#convención-de-un-módulo); aquí se
fija qué hay dentro de cada archivo.

```txt
src/modules/superadmin/
  members/                         listado y dueño del recurso
    page.jsx
    resolvers.js
    members.service.js
    members-disable.service.js
    member.schema.js
    components/
      Members.jsx
      MembersDisableModal.jsx
  members-create/                  alta
    page.jsx
    resolvers.js
    components/CreateMemberForm.jsx
  members-edit/                    edición
    page.jsx
    resolvers.js
    components/EditMemberForm.jsx
  members-show/                    detalle
    page.jsx
    resolvers.js
    components/MemberOverview.jsx
```

| Archivo | Responsabilidad | Qué no hace |
|---|---|---|
| `page.jsx` | Llama a `useResolver(resolvers)`, pinta `PageLoading` o `PageError` y entrega `data` a un solo componente. | Lógica, JSX propio, lectura de params. |
| `resolvers.js` | Declara qué lee la pantalla: `clave → (params, search) => promesa`. | Estado, transformaciones de UI. |
| `<feature>.service.js` | Una línea: `service('<path>')`. | Endpoints a mano, `fetch`. |
| `<recurso>.schema.js` | Los schemas Zod del formulario (`create…Schema`, `update…Schema`). | Validar lo que devuelve el API. |
| `components/*.jsx` | Todo el JSX de la pantalla: tabla, formulario, detalle, modal. | Leer del API al montar. |

La lectura sube a `resolvers.js` y la escritura baja al componente: el componente recibe los datos ya
resueltos como props y solo escribe (con `useForm` o `useMutation`). Así cada pantalla tiene un único
lugar donde mirar qué pide al API y un único lugar donde mirar qué manda.

## page.jsx y resolvers.js

`page.jsx` es idéntico en todas las pantallas; solo cambia el componente que importa. Ejemplo:
`src/modules/superadmin/members-show/page.jsx`.

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import MemberOverview from './components/MemberOverview';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <MemberOverview {...data} />;
}
```

- El export es siempre `export default function Page ()`. El archivo de rutas importa cada pantalla
  con el nombre que le sirve (`MembersShow`), así que el nombre interno no aporta nada y mantenerlo
  fijo permite copiar el archivo sin editarlo.
- `{...data}` reparte cada clave de `resolvers.js` como una prop con el mismo nombre. La clave
  `member` del resolver llega al componente como `member`.
- Cuando la pantalla muta y necesita volver a leer (un listado con modal), `page.jsx` también pasa
  `refetch`: `return <Members {...data} refetch={refetch} />;`. Es la única variación permitida.
- Los estados de carga y error viven aquí y no en el componente: el componente nunca recibe `data`
  a medio llegar ni `undefined`. Detalle del hook en [05-hooks.md](05-hooks.md#useresolver) y de los
  estados en [09-componentes.md](09-componentes.md#pagestate).

`resolvers.js` **existe siempre**, aunque la pantalla no lea del API. Pantalla de alta,
`src/modules/superadmin/members-create/resolvers.js`:

```js
export default {};
```

Se declara vacío para que toda pantalla tenga la misma forma (`page.jsx` + `resolvers.js` +
`components/`). Con cero claves `useResolver` no pinta el loading, así que el alta no parpadea.

Pantalla de detalle, `src/modules/superadmin/members-show/resolvers.js`:

```js
import membersService from '@/modules/superadmin/members/members.service';

export default {
  member: async (params) => {
    const member = await membersService.getOne({id: params.id});

    if (!member) {
      throw new Error('No se encontró el miembro');
    }

    return member;
  }
};
```

- Cada resolver recibe `(params, search)`: `params` son los params dinámicos de la ruta (`:id`) y
  `search` el query string ya decodificado a primitivos, sin el parámetro `modal`. El componente no
  llama a `useParams`.
- El id de la URL puede no existir: `getOne` devuelve `null` y el resolver lanza para que `page.jsx`
  pinte el error en vez de pasarle `undefined` al componente.
- Un resolver es una llamada a un service, no una función que arma estado. Si una pantalla necesita
  cruzar dos lecturas, las cruza dentro de la misma clave con `Promise.all` y devuelve el valor final.

Listado, `src/modules/superadmin/members/resolvers.js`:

```js
import membersService from './members.service';

export default {
  members: (params, search) => membersService.get({search: search.search, page: search.page})
};
```

La búsqueda y la paginación viven en el query string: `useQueryParams` lo escribe y `useResolver`
vuelve a pedir el listado por ese cambio, sin `refetch` a mano. Ver
[05-hooks.md](05-hooks.md#usequeryparams).

## Service por feature

Un archivo por endpoint, en la carpeta base del recurso. `src/modules/superadmin/members/members.service.js`:

```js
import service from '@/core/service';

export default service('members');
```

- El `path` es el mismo string que el segmento bajo `/api/` (`service('members')` habla con
  `${apiDomain}/api/members`) y el mismo nombre que el módulo de permisos del server. Un solo nombre
  para las tres cosas: al leer el cliente se sabe qué endpoint y qué permiso toca, sin mapa.
- `service(path)` devuelve `{get, getOne, post, put, remove}`. Detalle en
  [04-core.md](04-core.md#coreservicejs).
- `getOne(query)` es el primer elemento de `get(query)`, o `null`. En el API **el id es un filtro más**:
  no existen rutas `/<recurso>/:id`. El detalle de un miembro es `GET /api/members?id=<id>`.
- Cada acción que el API expone como recurso aparte tiene su service aparte, con su nombre de
  endpoint: `members-disable.service.js` = `service('members-disable')`,
  `members-permissions.service.js` = `service('members-permissions')`. No se agregan métodos a un
  service ni se le pasa un sufijo en tiempo de ejecución.
- La variable sigue al archivo: `members.service.js` se importa como `membersService`.

## Schema

Los formularios validan con Zod en el cliente antes de mandar. El archivo es `<recurso>.schema.js`,
en singular, en la carpeta base del recurso, y exporta un schema por formulario:
`create<Recurso>Schema` y `update<Recurso>Schema`. `src/modules/superadmin/members/member.schema.js`:

```js
import zod from 'zod';

export const createMemberSchema = zod.object({
  name: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  surname: zod.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: zod.email('Email inválido'),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: zod.string().optional().nullable(),
  birthdate: zod.date('Fecha de nacimiento requerida').or(zod.string('Fecha de nacimiento requerida'))
});

export const updateMemberSchema = zod.object({
  name: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  surname: zod.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: zod.string().optional().nullable(),
  birthdate: zod.date().or(zod.string()).optional().nullable()
});
```

- Alta y edición no validan lo mismo: `email` y `password` solo existen en el alta; en la edición el
  email se muestra deshabilitado y la contraseña se cambia desde el perfil de la propia cuenta.
- `birthdate` acepta `Date` o string porque `FormInputDatePicker` guarda la fecha como string y el
  valor que llega del API también es string.
- El schema del cliente da el mensaje en el campo; el server vuelve a validar y es quien decide. Si
  el server rechaza un campo, `useForm` lo pinta en ese campo (ver [05-hooks.md](05-hooks.md#useform)).
- Un schema que usa un solo formulario puede vivir dentro de su componente: es el caso de los
  permisos (ver [Gestión de cuentas](08-modulos.md#gestión-de-cuentas)).

## Listado, alta, edición y detalle

Las cuatro pantallas de un recurso repiten la misma forma. El código completo está en
[Gestión de cuentas](08-modulos.md#gestión-de-cuentas) (con `members`) y en
[13-templates.md](13-templates.md#listado) (con el recurso de ejemplo `items`).

| Pantalla | Carpeta / URL | `resolvers.js` | Componente | Escribe con |
|---|---|---|---|---|
| Listado | `<recurso>/` · `/<recurso>` | `(params, search) => service.get({search: search.search, page: search.page})` | `<Recursos>.jsx`: `CustomPage` con acción "Crear", buscador, `CustomTable` con acciones por fila. | `useMutation` o un modal por query. |
| Alta | `<recurso>-create/` · `/<recurso>/create` | `export default {}` | `Create<Recurso>Form.jsx` | `useForm({}, {onSubmit: (body) => service.post(body), schema, successMessage, redirectTo})` |
| Edición | `<recurso>-edit/` · `/<recurso>/edit/:id` | `getOne({id: params.id})` y lanza si es `null` | `Edit<Recurso>Form.jsx` | `useForm(registro, {onSubmit: (body) => service.put({...body, id}), …})` |
| Detalle | `<recurso>-show/` · `/<recurso>/show/:id` | igual que edición | `<Recurso>Overview.jsx` | No escribe. |

- **Listado.** El buscador es un `<input>` no controlado con `defaultValue={query.search || ''}` y
  `onChange={({target}) => search(target.value)}`: `useQueryParams` lo debouncea a 600 ms y escribe la
  URL con `replace`, y buscar reinicia la página. La tabla recibe `dataSize`, `currentPage`,
  `nextPage` y `prevPage` (ver [09-componentes.md](09-componentes.md#customtable)). Las acciones de
  fila son `Link` a `show`/`edit` con un `Button` de icono y `aria-label` con el nombre del registro.
- **Alta y edición.** `redirectTo` vuelve al listado después de guardar; el toast sale de
  `successMessage`. El botón de enviar se deshabilita con `form.isSubmitting`.
- **Detalle.** Solo pinta; la acción de editar, si la tiene, es un `Link` en `actions` de `CustomPage`.
- **Todo pasa por `CustomPage`.** Título, descripción, `goBackPath` y acciones van ahí (ver
  [09-componentes.md](09-componentes.md#custompage)).

## Separación por rol

**Regla de guardia: la duplicación entre roles es deliberada.** `modules/superadmin/` nunca importa de
`modules/member/` ni al revés. Si dos roles necesitan una pantalla parecida (su perfil, su dashboard,
el listado de un mismo recurso), cada uno tiene su carpeta, su service y su componente.

- Cada rol ve un subconjunto distinto del mismo recurso, con acciones distintas y permisos distintos
  en el server. Una pantalla compartida termina llena de `if (role === …)` y un cambio para un rol
  rompe al otro.
- El service de cada rol apunta al endpoint que ese rol tiene permitido. Compartirlo esconde qué rol
  usa qué endpoint.
- Borrar un rol entero es borrar `modules/<rol>/`, `routes/<rol>.routes.jsx` y `components/<Rol>/`,
  sin buscar referencias cruzadas.

**Lo único que se comparte son los componentes de formulario** de `components/form/` (`Form`,
`FormInput`, `FormPermissionsEditor`…) y el resto de `components/`, que no conocen ningún recurso. Ver
[09-componentes.md](09-componentes.md#formularios). Dentro de un mismo rol, lo que usan varias
pantallas del recurso vive en la carpeta base `<recurso>/` y las demás lo importan con
`@/modules/<rol>/<recurso>/…`.

La misma regla vale entre recursos de un rol que se parecen: `members` y `superadmins` tienen el mismo
listado, el mismo modal y las mismas pantallas de permisos, y **se duplican**, no se abstraen en un
`AccountsTable` genérico. La tabla de diferencias de
[Gestión de cuentas](08-modulos.md#gestión-de-cuentas) muestra por qué: cambian campos, columnas,
colores, textos y reglas del server, y cada diferencia sería un parámetro más.

## Registro en rutas y sidebar

Una pantalla existe cuando está en el archivo de rutas de su rol; aparece en el menú cuando está en
el Sidebar de ese rol. Son dos pasos separados: las pantallas de alta, edición, detalle y permisos se
registran en rutas pero no en el menú.

Extracto de `src/routes/superadmin.routes.jsx`, solo las líneas que agregan las cuentas (el archivo
completo está en [07-rutas-y-sesion.md](07-rutas-y-sesion.md#archivos-de-rutas)). Imports:

```jsx
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
```

Entradas dentro de `children` del layout del rol, antes de `profile` y del comodín `*`:

```jsx
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
```

- Los paths son relativos (sin `/` inicial) porque cuelgan del layout montado en `/`. No llevan
  prefijo de rol: el árbol entero ya es del rol.
- La variable del import es el nombre de la carpeta en PascalCase (`members-permissions-show/` →
  `MembersPermissionsShow`); el comodín `*` va último.

Extracto de `src/components/Superadmin/Sidebar.jsx`, solo el arreglo `menuItems` (el Sidebar completo
está en [07-rutas-y-sesion.md](07-rutas-y-sesion.md#layouts-por-rol)):

```jsx
import {LayoutDashboardIcon, ShieldIcon, UserIcon, UsersIcon} from 'lucide-react';
```

```jsx
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
```

- El ítem se marca activo si `pathname === item.href` o si `pathname` empieza con `item.href` (salvo
  `/`). Por eso `/members/show/:id` y `/members-permissions/show/:id` dejan resaltado "Miembros" sin
  registrarlos en el menú.
- El `key` de cada `Link` es `item.name`: dos entradas con el mismo texto chocan.

## Gestión de cuentas

El panel `superadmin` gestiona dos tipos de cuenta: `members` (las cuentas del rol `member`) y
`superadmins`. Cada uno tiene listado con buscador, alta, edición, detalle, un modal para bloquear o
habilitar la cuenta y dos pantallas de permisos. `members` va completo; `superadmins` va como tabla de
diferencias y se escribe **duplicando** los archivos de `members` con esos cambios.

El alta y edición de cuentas en el server reutilizan un único servicio de cuentas que crea el usuario
y su perfil en la misma operación; el cliente solo manda el body a `members` o `superadmins`.

### members/page.jsx

`src/modules/superadmin/members/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import Members from './components/Members';

export default function Page () {
  const {data, error, isLoading, refetch} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <Members {...data} refetch={refetch} />;
}
```

Pasa `refetch` porque el modal de bloquear cambia una fila y el listado tiene que volver a leer.

### members/resolvers.js

`src/modules/superadmin/members/resolvers.js`

```js
import membersService from './members.service';

export default {
  members: (params, search) => membersService.get({search: search.search, page: search.page})
};
```

`search.search` y `search.page` salen del query string que escribe `useQueryParams`; al cambiar, el
listado se vuelve a pedir solo.

### members/members.service.js

`src/modules/superadmin/members/members.service.js`

```js
import service from '@/core/service';

export default service('members');
```

### members/members-disable.service.js

`src/modules/superadmin/members/members-disable.service.js`

```js
import service from '@/core/service';

export default service('members-disable');
```

Bloquear y habilitar es un endpoint aparte (`PUT /api/members-disable` con `{id, disabled}`) y no un
campo más de `PUT /api/members`: tiene su propio permiso en el server, así que se puede dar edición
de datos sin dar bloqueo.

### members/member.schema.js

`src/modules/superadmin/members/member.schema.js`

```js
import zod from 'zod';

export const createMemberSchema = zod.object({
  name: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  surname: zod.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: zod.email('Email inválido'),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: zod.string().optional().nullable(),
  birthdate: zod.date('Fecha de nacimiento requerida').or(zod.string('Fecha de nacimiento requerida'))
});

export const updateMemberSchema = zod.object({
  name: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  surname: zod.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: zod.string().optional().nullable(),
  birthdate: zod.date().or(zod.string()).optional().nullable()
});
```

El porqué de cada campo está en [Schema](08-modulos.md#schema).

### members/components/Members.jsx

`src/modules/superadmin/members/components/Members.jsx`

```jsx
import {Link} from 'react-router';
import {BadgeCheckIcon, EyeIcon, KeyRoundIcon, LockIcon, LockOpenIcon, PencilIcon, PlusIcon, SearchIcon} from 'lucide-react';
import useQueryParams from '@/hooks/use-query-params';
import {useOpenModal} from '@/components/modalWrapper';
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import CustomTable from '@/components/CustomTable/CustomTable';
import CustomTooltip from '@/components/CustomTooltip/CustomTooltip';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {formatDate} from '@/lib/date';
import {getInitials, getPictureSrc} from '@/lib/utils';
import MembersDisableModal, {MEMBERS_DISABLE_MODAL_ID} from './MembersDisableModal';

export default function Members ({members, refetch}) {
  const {nextPage, prevPage, search, query} = useQueryParams();
  const openModal = useOpenModal();
  const currentPage = Number(query.page) || 1;

  return (
    <CustomPage
      title="Miembros"
      description="Gestiona todos los miembros registrados en la plataforma"
      actions={
        <Link to="/members/create" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
          Crear Miembro
        </Link>
      }
    >
      <CustomPageContainer>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

          <input
            type="text"
            aria-label="Buscar miembros"
            placeholder="Buscar por nombre o apellido..."
            defaultValue={query.search || ''}
            onChange={({target}) => search(target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>
      </CustomPageContainer>

      <CustomTable dataSize={members.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Creado</CustomTable.TheadItem>
            <CustomTable.TheadItem>Nombres</CustomTable.TheadItem>
            <CustomTable.TheadItem>Email</CustomTable.TheadItem>
            <CustomTable.TheadItem>Verificado</CustomTable.TheadItem>
            <CustomTable.TheadItem className="text-right">Acciones</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {members.map((member) => {
            const fullName = [member.name, member.surname].filter(Boolean).join(' ');

            return (
              <CustomTable.TableRow key={member.id}>
                <CustomTable.TBodyItem>{formatDate(member.createdAt)}</CustomTable.TBodyItem>
                <CustomTable.TBodyItem className="flex items-center gap-3">
                  <Avatar className="size-9 border border-gray-200 dark:border-gray-700">
                    <AvatarImage src={getPictureSrc(member.picture)} alt={`Foto de ${fullName}`} />
                    <AvatarFallback className="bg-linear-to-br from-green-400 to-green-600 text-xs font-semibold text-white">
                      {getInitials(member.name, member.surname) || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-col text-left">
                    <span className="leading-5">{member.name}</span>
                    <span className="leading-5 text-gray-600 dark:text-gray-300">{member.surname}</span>
                  </span>
                </CustomTable.TBodyItem>
                <CustomTable.TBodyItem>{member.user.email}</CustomTable.TBodyItem>
                <CustomTable.TBodyItem className="flex flex-col gap-2">
                  {
                    member.user.emailConfirmed ? (
                      <Badge variant="outline" className="text-green-600 border-green-600 dark:text-white dark:border-green-600 dark:bg-green-600">
                        <BadgeCheckIcon />
                        Verificado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600 dark:text-white dark:border-red-600 dark:bg-red-600">
                        <BadgeCheckIcon />
                        No Verificado
                      </Badge>
                    )
                  }
                  {
                    member.user.disabled && (
                      <Badge variant="outline" className="text-red-600 border-red-600 dark:text-white dark:border-red-600 dark:bg-red-600">
                        <LockIcon />
                        Bloqueado
                      </Badge>
                    )
                  }
                </CustomTable.TBodyItem>
                <CustomTable.TBodyItem type="actions">
                  <Link to={`/members/show/${member.id}`}>
                    <Button variant="outline" size="icon" className="cursor-pointer" aria-label={`Ver a ${fullName}`}>
                      <EyeIcon className="w-4 h-4 text-green-500" />
                    </Button>
                  </Link>
                  <Link to={`/members/edit/${member.id}`}>
                    <Button variant="outline" size="icon" className="cursor-pointer" aria-label={`Editar a ${fullName}`}>
                      <PencilIcon className="w-4 h-4 text-blue-500" />
                    </Button>
                  </Link>
                  <Link to={`/members-permissions/show/${member.id}`}>
                    <CustomTooltip content="Permisos">
                      <Button variant="outline" size="icon" className="cursor-pointer" aria-label={`Gestionar permisos de ${fullName}`}>
                        <KeyRoundIcon className="w-4 h-4 text-amber-500" />
                      </Button>
                    </CustomTooltip>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => openModal(MEMBERS_DISABLE_MODAL_ID, {member: member.id, disabled: String(!member.user.disabled)})}
                    aria-label={member.user.disabled ? `Habilitar la cuenta de ${fullName}` : `Bloquear la cuenta de ${fullName}`}
                  >
                    {
                      member.user.disabled
                        ? <LockOpenIcon className="w-4 h-4 text-green-500" />
                        : <LockIcon className="w-4 h-4 text-red-500" />
                    }
                  </Button>
                </CustomTable.TBodyItem>
              </CustomTable.TableRow>
            );
          })}
        </CustomTable.TBody>
      </CustomTable>

      <MembersDisableModal refetch={refetch} />
    </CustomPage>
  );
}
```

- Los datos de la cuenta (`email`, `emailConfirmed`, `disabled`) vienen anidados en `member.user`; los
  del perfil (`name`, `surname`, `picture`, `createdAt`) en la raíz. El API devuelve el perfil con su
  usuario unido.
- `currentPage` sale de `query.page` porque la página vive en la URL; sin `page`, es la 1.
- El botón de bloquear no muta: abre el modal por query pasando el id y el estado **destino**
  (`String(!member.user.disabled)`). Los valores del query string son strings, por eso el `String`.
- `MembersDisableModal` se monta dentro del listado (montaje por pantalla) porque necesita el
  `refetch` de esta pantalla.
- La inicial de respaldo `'M'` cubre el caso de un perfil sin nombre.

### members/components/MembersDisableModal.jsx

`src/modules/superadmin/members/components/MembersDisableModal.jsx`

```jsx
import {useSearchParams} from 'react-router';
import {withModalFromQuery} from '@/components/modalWrapper';
import {Button} from '@/components/ui/button';
import useMutation from '@/hooks/use-mutation';
import membersDisableService from '../members-disable.service';

const MODAL_ID = 'members-disable';

function MembersDisableModal ({onClose, refetch}) {
  const [searchParams] = useSearchParams();
  const member = searchParams.get('member');
  const isDisabling = searchParams.get('disabled') === 'true';
  const [isLoading, toggleStatus] = useMutation((body) => membersDisableService.put(body), {
    skipConfirm: true,
    successMessage: 'Estado de la cuenta actualizado correctamente',
    onSuccess: () => {
      onClose();
      refetch();
    }
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {isDisabling ? 'Bloquear cuenta' : 'Habilitar cuenta'}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {isDisabling
          ? 'El miembro perderá el acceso al sistema. ¿Deseas continuar?'
          : 'El miembro recuperará el acceso al sistema. ¿Deseas continuar?'}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={isLoading}
          onClick={() => toggleStatus({id: member, disabled: isDisabling})}
          className="cursor-pointer"
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
}

MembersDisableModal.modalClassName = 'bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto outline-none';

export {MODAL_ID as MEMBERS_DISABLE_MODAL_ID};
export default withModalFromQuery(MembersDisableModal, MODAL_ID);
```

- El modal lee todo lo que necesita del query string (`member`, `disabled`), no de props: la URL
  describe el modal abierto y se puede recargar o compartir.
- `skipConfirm: true` porque el modal ya es la confirmación; sin esto `useMutation` abriría un
  segundo diálogo.
- Si el server rechaza, `useMutation` muestra el error en un toast y el modal queda abierto; solo se
  cierra y refresca en `onSuccess`.
- El id del modal se exporta con nombre (`MEMBERS_DISABLE_MODAL_ID`) para que quien lo abre no repita
  el string.

El porqué del patrón (URL como estado, montaje por pantalla, `modalClassName`, accesibilidad) está en
[10-modales-por-query.md](10-modales-por-query.md#ejemplo-modal-de-deshabilitar).

### members-create

`src/modules/superadmin/members-create/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import CreateMemberForm from './components/CreateMemberForm';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <CreateMemberForm {...data} />;
}
```

`src/modules/superadmin/members-create/resolvers.js`

```js
export default {};
```

El alta no necesita catálogos: se declara vacío para mantener la forma de la pantalla.

`src/modules/superadmin/members-create/components/CreateMemberForm.jsx`

```jsx
import useForm from '@/hooks/use-form';
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import Form, {FormInput, FormInputDatePicker} from '@/components/form/Form';
import membersService from '@/modules/superadmin/members/members.service';
import {createMemberSchema} from '@/modules/superadmin/members/member.schema';

export default function CreateMemberForm () {
  const form = useForm({}, {
    onSubmit: (body) => membersService.post(body),
    schema: createMemberSchema,
    successMessage: 'Miembro creado correctamente',
    redirectTo: '/members'
  });

  return (
    <CustomPage title="Crear Miembro" description="Ingresa los datos del nuevo miembro" goBackPath="/members">
      <CustomPageContainer className="p-6">
        <Form onSubmit={form.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              control={form.control}
              name="name"
              label="Nombre del miembro"
              placeholder="Nombre"
            />
            <FormInput
              control={form.control}
              name="surname"
              label="Apellido del miembro"
              placeholder="Apellido"
            />
            <FormInput
              control={form.control}
              name="email"
              label="Email del miembro"
              placeholder="Email"
            />
            <FormInput
              control={form.control}
              name="password"
              label="Contraseña"
              placeholder="Contraseña"
              type="password"
            />
            <FormInput
              control={form.control}
              name="phone"
              label="Teléfono del miembro"
              placeholder="Teléfono"
            />
            <FormInputDatePicker
              control={form.control}
              name="birthdate"
              label="Fecha de nacimiento"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button type="submit" disabled={form.isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors">
              {form.isSubmitting ? 'Creando...' : 'Guardar'}
            </button>
          </div>
        </Form>
      </CustomPageContainer>
    </CustomPage>
  );
}
```

- El service y el schema se importan desde la carpeta base del recurso con el alias
  `@/modules/superadmin/members/…`: `members/` es dueña del recurso.
- `useForm({}, …)` arranca vacío. `onSubmit` recibe los valores del formulario y devuelve la promesa
  del service; `useForm` maneja el toast, los errores por campo y la redirección.

### members-edit

`src/modules/superadmin/members-edit/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import EditMemberForm from './components/EditMemberForm';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <EditMemberForm {...data} />;
}
```

`src/modules/superadmin/members-edit/resolvers.js`

```js
import membersService from '@/modules/superadmin/members/members.service';

export default {
  member: async (params) => {
    const member = await membersService.getOne({id: params.id});

    if (!member) {
      throw new Error('No se encontró el miembro');
    }

    return member;
  }
};
```

`src/modules/superadmin/members-edit/components/EditMemberForm.jsx`

```jsx
import useForm from '@/hooks/use-form';
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import Form, {FormInput, FormInputDatePicker} from '@/components/form/Form';
import membersService from '@/modules/superadmin/members/members.service';
import {updateMemberSchema} from '@/modules/superadmin/members/member.schema';

export default function EditMemberForm ({member}) {
  const form = useForm(member, {
    onSubmit: (body) => membersService.put({...body, id: member.id}),
    schema: updateMemberSchema,
    successMessage: 'Miembro actualizado correctamente',
    redirectTo: '/members'
  });

  return (
    <CustomPage title="Editar Miembro" description="Modifica los datos del miembro" goBackPath="/members">
      <CustomPageContainer className="p-6">
        <Form onSubmit={form.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              control={form.control}
              name="name"
              label="Nombre del miembro"
              placeholder="Nombre"
            />
            <FormInput
              control={form.control}
              name="surname"
              label="Apellido del miembro"
              placeholder="Apellido"
            />
            <FormInput
              control={form.control}
              name="user.email"
              label="Email del miembro"
              placeholder="Email"
              disabled
            />
            <FormInput
              control={form.control}
              name="phone"
              label="Teléfono del miembro"
              placeholder="Teléfono"
            />
            <FormInputDatePicker
              control={form.control}
              name="birthdate"
              label="Fecha de nacimiento"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button type="submit" disabled={form.isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors cursor-pointer">
              {form.isSubmitting ? 'Actualizando...' : 'Guardar'}
            </button>
          </div>
        </Form>
      </CustomPageContainer>
    </CustomPage>
  );
}
```

- `useForm(member, …)` usa el registro completo como valores iniciales; por eso el campo de email se
  llama `user.email` (la ruta dentro del registro) y va `disabled`: se muestra, no se edita.
- `put({...body, id: member.id})` fija el id del registro que se leyó, sin depender de que el
  formulario lo conserve.

### members-show

`src/modules/superadmin/members-show/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import MemberOverview from './components/MemberOverview';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <MemberOverview {...data} />;
}
```

`src/modules/superadmin/members-show/resolvers.js`

```js
import membersService from '@/modules/superadmin/members/members.service';

export default {
  member: async (params) => {
    const member = await membersService.getOne({id: params.id});

    if (!member) {
      throw new Error('No se encontró el miembro');
    }

    return member;
  }
};
```

`src/modules/superadmin/members-show/components/MemberOverview.jsx`

```jsx
import {MailIcon, CalendarIcon, CheckCircleIcon, XCircleIcon, PhoneIcon} from 'lucide-react';
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {formatDate} from '@/lib/date';
import {getInitials, getPictureSrc} from '@/lib/utils';

export default function MemberOverview ({member}) {
  const fullName = [member.name, member.surname].filter(Boolean).join(' ');

  return (
    <CustomPage title="Información del Miembro" description="Detalles del miembro" goBackPath="/members">
      <div className="space-y-6">
        <CustomPageContainer className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información Básica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Avatar className="size-14 border border-gray-200 dark:border-gray-700">
                <AvatarImage src={getPictureSrc(member.picture)} alt={`Foto de ${fullName}`} />
                <AvatarFallback className="bg-linear-to-br from-green-400 to-green-600 text-base font-semibold text-white">
                  {getInitials(member.name, member.surname) || 'M'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre Completo</p>
                <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                  {member.name} {member.surname}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MailIcon className="w-5 h-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                  {member.user.email}
                </p>
              </div>
            </div>

            {member.phone && (
              <div className="flex items-start gap-3">
                <PhoneIcon className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                    {member.phone}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Registro</p>
                <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                  {formatDate(member.createdAt, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {member.birthdate && (
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Nacimiento</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                    {formatDate(member.birthdate)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CustomPageContainer>

        <CustomPageContainer className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estado de la Cuenta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center gap-3">
                {member.user.emailConfirmed ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email Verificado</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {member.user.emailConfirmed
                      ? formatDate(member.user.emailConfirmedAt)
                      : 'No verificado'}
                  </p>
                </div>
              </div>
            </div>

            {member.user.disabled && (
              <div className="md:col-span-2 flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-400">Cuenta Deshabilitada</p>
                    <p className="text-xs text-red-700 dark:text-red-400">
                      Esta cuenta ha sido deshabilitada por un administrador
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CustomPageContainer>
      </div>
    </CustomPage>
  );
}
```

- Dos bloques: datos del perfil y estado de la cuenta. Los opcionales (`phone`, `birthdate`) solo se
  pintan si tienen valor.
- Las fechas pasan por `formatDate` de `lib/date.js`, que fija el locale; el componente no formatea a
  mano.

### members-permissions/members-permissions.service.js

`src/modules/superadmin/members-permissions/members-permissions.service.js`

```js
import service from '@/core/service';

export default service('members-permissions');
```

`members-permissions/` es un recurso sin pantalla: la carpeta solo tiene el service que comparten
`members-permissions-show/` y `members-permissions-edit/`. Este endpoint es la excepción a
`getOne`: `GET /api/members-permissions?id=<id>` devuelve **un objeto** (`{id, name, surname, user,
permissions}`) y responde 404 si no existe, por eso sus resolvers usan `get` y no validan `null`.

### members-permissions-show

`src/modules/superadmin/members-permissions-show/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import MembersPermissionsShow from './components/MembersPermissionsShow';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <MembersPermissionsShow {...data} />;
}
```

`src/modules/superadmin/members-permissions-show/resolvers.js`

```js
import membersPermissionsService from '@/modules/superadmin/members-permissions/members-permissions.service';

export default {
  member: async (params) => {
    return membersPermissionsService.get({id: params.id});
  }
};
```

`src/modules/superadmin/members-permissions-show/components/MembersPermissionsShow.jsx`

```jsx
import {Link} from 'react-router';
import {MailIcon, PencilIcon, ShieldCheckIcon} from 'lucide-react';
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {getInitials} from '@/lib/utils';

function groupPermissionsByModule (permissions) {
  return permissions.reduce((acc, perm) => {
    const parts = perm.split('::');
    const moduleName = parts[1] || 'general';
    const current = acc[moduleName] || [];

    return {
      ...acc,
      [moduleName]: [...current, perm]
    };
  }, {});
}

export default function MembersPermissionsShow ({member}) {
  const fullName = [member.name, member.surname].filter(Boolean).join(' ');
  const grouped = groupPermissionsByModule(member.permissions);
  const moduleEntries = Object.entries(grouped);

  return (
    <CustomPage
      title="Permisos del Miembro"
      description="Consulta los permisos asignados a la cuenta"
      goBackPath="/members"
    >
      <div className="space-y-6">
        <CustomPageContainer className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border border-gray-200 dark:border-gray-700">
                <AvatarFallback className="bg-linear-to-br from-green-400 to-green-600 text-lg font-semibold text-white">
                  {getInitials(member.name, member.surname) || 'M'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h2>
                  <Badge variant="outline" className="text-xs">Miembro</Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                  <MailIcon className="w-4 h-4" />
                  {member.user.email}
                </p>
              </div>
            </div>
            <div>
              <Link to={`/members-permissions/edit/${member.id}`}>
                <Button className="gap-2 cursor-pointer">
                  <PencilIcon className="w-4 h-4" />
                  Editar
                </Button>
              </Link>
            </div>
          </div>
        </CustomPageContainer>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Módulos y Permisos
            </h3>
            <Badge variant="secondary">
              {member.permissions.length} {member.permissions.length === 1 ? 'permiso' : 'permisos'}
            </Badge>
          </div>

          {moduleEntries.length === 0 ? (
            <CustomPageContainer className="p-8 text-center text-gray-500 dark:text-gray-400">
              <ShieldCheckIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No tiene permisos asignados actualmente.</p>
            </CustomPageContainer>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moduleEntries.map(([moduleName, items]) => (
                <CustomPageContainer key={moduleName} className="p-5">
                  <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      {moduleName}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {items.length}
                    </Badge>
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((perm) => (
                      <li
                        key={perm}
                        className="font-mono text-xs bg-gray-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 px-2.5 py-1.5 rounded border border-gray-200/60 dark:border-gray-700 select-all"
                      >
                        {perm}
                      </li>
                    ))}
                  </ul>
                </CustomPageContainer>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomPage>
  );
}
```

- Un permiso es un identificador `rol::modulo::general`. La pantalla los agrupa por el segundo
  segmento (el módulo del server, que es el mismo nombre que el `path` del service) para leerlos por
  recurso.
- `groupPermissionsByModule` vive en el componente porque solo lo usa esta pantalla; el componente de
  `superadmins` tiene su propia copia.

### members-permissions-edit

`src/modules/superadmin/members-permissions-edit/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import MembersPermissionsEdit from './components/MembersPermissionsEdit';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <MembersPermissionsEdit {...data} />;
}
```

`src/modules/superadmin/members-permissions-edit/resolvers.js`

```js
import membersPermissionsService from '@/modules/superadmin/members-permissions/members-permissions.service';

export default {
  member: async (params) => {
    return membersPermissionsService.get({id: params.id});
  }
};
```

`src/modules/superadmin/members-permissions-edit/components/MembersPermissionsEdit.jsx`

```jsx
import {Link} from 'react-router';
import {MailIcon} from 'lucide-react';
import zod from 'zod';
import useForm from '@/hooks/use-form';
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import Form from '@/components/form/Form';
import FormPermissionsEditor from '@/components/form/FormPermissionsEditor';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {getInitials} from '@/lib/utils';
import membersPermissionsService from '@/modules/superadmin/members-permissions/members-permissions.service';

const updateMemberPermissionsSchema = zod.object({
  id: zod.uuid(),
  permissions: zod.array(
    zod.string().regex(/^(member|superadmin)::[a-z0-9-]+::general$/, 'Formato de permiso inválido')
  )
});

export default function MembersPermissionsEdit ({member}) {
  const fullName = [member.name, member.surname].filter(Boolean).join(' ');
  const form = useForm({
    id: member.id,
    permissions: member.permissions
  }, {
    onSubmit: (body) => membersPermissionsService.put(body),
    schema: updateMemberPermissionsSchema,
    redirectTo: `/members-permissions/show/${member.id}`,
    successMessage: 'Permisos actualizados correctamente'
  });

  return (
    <CustomPage
      title="Editar Permisos del Miembro"
      description="Modifica los permisos asignados al miembro"
      goBackPath="/members"
    >
      <div className="space-y-6">
        <CustomPageContainer className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border border-gray-200 dark:border-gray-700">
              <AvatarFallback className="bg-linear-to-br from-green-400 to-green-600 text-lg font-semibold text-white">
                {getInitials(member.name, member.surname) || 'M'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h2>
                <Badge variant="outline" className="text-xs">Miembro</Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                <MailIcon className="w-4 h-4" />
                {member.user.email}
              </p>
            </div>
          </div>
        </CustomPageContainer>

        <CustomPageContainer className="p-6">
          <Form onSubmit={form.handleSubmit} className="space-y-6">
            {form.error && form.error.message && (
              <div role="alert" className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                {form.error.message}
              </div>
            )}

            <FormPermissionsEditor
              control={form.control}
              name="permissions"
              label="Permisos del Miembro"
              description="Define los identificadores de permisos con formato rol::modulo::general"
            />

            <div className="flex gap-3 justify-end items-center pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link to={`/members-permissions/show/${member.id}`}>
                <Button type="button" variant="outline" className="cursor-pointer">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={form.isSubmitting}
                className="cursor-pointer"
              >
                {form.isSubmitting ? 'Actualizando...' : 'Guardar'}
              </Button>
            </div>
          </Form>
        </CustomPageContainer>
      </div>
    </CustomPage>
  );
}
```

- El schema vive dentro del componente porque solo lo usa este formulario. La expresión regular
  lista los roles del destino (`member|superadmin`): si el destino agrega un rol, se agrega aquí y en
  la copia de `superadmins`.
- `FormPermissionsEditor` es un componente de formulario compartido: edita un arreglo de strings con
  `useFieldArray` sobre el `name` que recibe (ver
  [09-componentes.md](09-componentes.md#formpermissionseditor)).
- El bloque `role="alert"` muestra `form.error.message`: el error general que devuelve el server
  cuando rechaza el arreglo completo, por ejemplo un identificador que no existe.
- Guardar vuelve a la pantalla de permisos, no al listado: el usuario ve el resultado agrupado.
- Un identificador de permiso que el server no tiene registrado deja la cuenta sin poder operar.
  Asigna permisos nuevos solo después de desplegar el server que los declara.

### superadmins: diferencias frente a members

`superadmins` se escribe **copiando** cada archivo de `members` y aplicando esta tabla. No se crea un
componente, hook o service compartido entre los dos: el código se duplica por diseño (ver
[Separación por rol](08-modulos.md#separación-por-rol)). Los nombres siguen la misma regla:
`Members` → `Superadmins`, `member` → `superadmin`, `MemberOverview` → `SuperadminOverview`,
`CreateMemberForm` → `CreateSuperadminForm`, `EditMemberForm` → `EditSuperadminForm`.

| Archivo en `superadmins*` | Qué cambia frente a `members*` |
|---|---|
| `superadmins/superadmins.service.js` | `export default service('superadmins');` |
| `superadmins/superadmins-disable.service.js` | `export default service('superadmins-disable');` |
| `superadmins-permissions/superadmins-permissions.service.js` | `export default service('superadmins-permissions');` |
| `superadmins/superadmin.schema.js` | Exporta `createSuperadminSchema` y `updateSuperadminSchema`. El perfil solo tiene `name`: sin `surname`, `phone` ni `birthdate`. Alta: `name: zod.string('El nombre es requerido').min(2, 'El nombre debe tener al menos 2 caracteres')`, `email: zod.email('Email inválido')`, `password: zod.string('La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres')`, `picture: zod.string().optional().nullable()`. Edición: `name` y `email` con las mismas reglas y `picture` opcional; el email **sí** se edita. |
| `superadmins/page.jsx` | Renderiza `<Superadmins {...data} refetch={refetch} />`. |
| `superadmins/resolvers.js` | Clave `superadmins`: `(params, search) => superadminsService.get({search: search.search, page: search.page})`. |
| `superadmins/components/Superadmins.jsx` | Título `Super Admins`, descripción `Gestiona los super administradores de la plataforma`, acción `Crear Super Admin` a `/superadmins/create`. Buscador con `aria-label="Buscar super admins"` y placeholder `Buscar por nombre...`. Columnas: `Nombre` (avatar + `superadmin.name`), `Email`, `Estado` centrada (badge `Bloqueado` con `LockIcon` o `Activo` con `LockOpenIcon`) y `Acciones`; sin `Creado` ni `Verificado`, así que no importa `BadgeCheckIcon` ni `formatDate`. Avatar con degradado `from-blue-400 to-blue-600` e iniciales de `getInitials(superadmin.name)` sin letra de respaldo. Cada acción va envuelta en `CustomTooltip` (`Ver super admin`, `Editar super admin`, `Permisos`, y `Habilitar cuenta`/`Bloquear cuenta` en el botón de bloqueo). El modal se abre con `openModal(SUPERADMINS_DISABLE_MODAL_ID, {superadmin: superadmin.id, disabled: String(!superadmin.user.disabled)})`. |
| `superadmins/components/SuperadminsDisableModal.jsx` | `MODAL_ID = 'superadmins-disable'`, lee `searchParams.get('superadmin')`, llama a `superadminsDisableService.put`, textos `El super admin perderá el acceso al sistema. ¿Deseas continuar?` / `El super admin recuperará el acceso al sistema. ¿Deseas continuar?`, exporta `SUPERADMINS_DISABLE_MODAL_ID`. |
| `superadmins-create/resolvers.js` | `export default {};` igual. |
| `superadmins-create/components/CreateSuperadminForm.jsx` | Importa `Form, {FormInput}`. `useForm({picture: null}, …)` con `createSuperadminSchema`, `successMessage: 'Super admin creado correctamente'`, `redirectTo: '/superadmins'`. Título `Crear Super Admin`, descripción `Ingresa los datos del nuevo super admin`. Tres campos: `name` (`Nombre`), `email` (`Email`) y `password` (`Contraseña`, `type="password"`). `CustomPageContainer` sin `className`, `Form` sin `className`, la grilla lleva `mb-6` y la fila del botón `mt-6`. |
| `superadmins-edit/resolvers.js` | Clave `superadmin` con `superadminsService.getOne({id: params.id})`; mensaje `No se encontró el super admin`. |
| `superadmins-edit/components/EditSuperadminForm.jsx` | Valores iniciales explícitos `{id: superadmin.id, name: superadmin.name, email: superadmin.user.email, picture: superadmin.picture}` y `onSubmit: (body) => superadminsService.put(body)` (el id viaja en los valores). Muestra un `Avatar` (`size-16 mb-6`, degradado azul) sobre la grilla. Campos `name` y `email`, ambos editables. Título `Editar Super Admin`, descripción `Modifica los datos del super admin`, `successMessage: 'Super admin actualizado correctamente'`. |
| `superadmins-show/resolvers.js` | Igual que `superadmins-edit/resolvers.js`. |
| `superadmins-show/components/SuperadminOverview.jsx` | Título `Información del Super Admin`, descripción `Información del super admin`, con acción `Editar` (`Link` a `/superadmins/edit/:id` con `PencilIcon`). Declara `DATE_OPTIONS = {year: 'numeric', month: 'long', day: 'numeric'}` y `formatLastSignIn(lastSignInAt)` (devuelve `Nunca` si no hay valor; si hay, `formatDate` con `DATE_OPTIONS` más `hour` y `minute` en `2-digit`). Información básica: `Nombre`, `Email`, `Fecha de Registro` (`user.createdAt`) y `Último Ingreso` (`user.lastSignInAt`). Estado de la cuenta: `Estado` (`Bloqueado`/`Activo`) y `Email Verificado` (`Verificado`/`No verificado`, sin fecha). Sin teléfono ni fecha de nacimiento. Los `CustomPageContainer` no llevan `className`. |
| `superadmins-permissions-show/resolvers.js` y `superadmins-permissions-edit/resolvers.js` | Clave `superadmin` con `superadminsPermissionsService.get({id: params.id})`. |
| `superadmins-permissions-show/components/SuperadminsPermissionsShow.jsx` | `fullName = superadmin.name`; degradado `from-purple-400 to-purple-600`, respaldo `'S'`, badge `Super Admin`, título `Permisos del Super Admin`, `goBackPath="/superadmins"`, enlace a `/superadmins-permissions/edit/:id`. |
| `superadmins-permissions-edit/components/SuperadminsPermissionsEdit.jsx` | Schema `updateSuperadminPermissionsSchema` con la misma expresión regular; mismo degradado, respaldo y badge que el show; título `Editar Permisos del Super Admin`, descripción `Modifica los permisos asignados al super admin`, label `Permisos del Super Admin`; `redirectTo` y `Cancelar` a `/superadmins-permissions/show/:id`. |

**No se puede bloquear la propia cuenta.** El cliente no lo impide: el listado muestra el botón de
bloqueo también en la fila de la sesión y el modal manda el `PUT` igual. La regla vive en el server,
en el módulo de permisos `superadmins-disable`: un hook sobre la acción `update` compara el `id` del
body con el id del perfil de la sesión y, si coinciden, responde 403 con el error `No puedes
deshabilitar tu propia cuenta`. En el cliente ese error sale de `core/service.js` como `{status: 403,
error}`, `useMutation` lo muestra en un toast y, como no hay `onSuccess`, el modal queda abierto y el
listado no se refresca. Si el destino quiere ocultar el botón en la fila propia, compara
`superadmin.id` con el id del perfil de la sesión, pero el guardia del server se mantiene: el cliente
no es una barrera.

## Reglas de uso

- **Toda pantalla es `page.jsx` + `resolvers.js` + `components/`.** Un `page.jsx` con `useState`,
  `useEffect` o JSX propio mezcla lectura y presentación y rompe la forma que permite copiar
  pantallas. Si necesitas lógica, va al componente o al resolver.
- **No leas del API dentro de un componente.** Lo que la pantalla necesita al montar va a
  `resolvers.js`. El componente solo escribe; después de escribir, pide `refetch` o redirige.
- **No escribas rutas `/<recurso>/:id` contra el API.** El id es un filtro: `getOne({id})`. Un
  service nuevo es una línea `service('<path>')` con el mismo nombre que el endpoint y el módulo de
  permisos.
- **No abstraigas entre roles ni entre `members` y `superadmins`.** Copia y adapta. Los únicos
  componentes compartidos son los de `components/`, en especial los de formulario.
- **Una acción con permiso propio es un service propio** (`members-disable`,
  `members-permissions`), no un campo más del `PUT` principal.
- **Una confirmación, no dos.** Si la acción ya pasa por un modal, `useMutation` va con
  `skipConfirm: true`; si no, `useMutation` abre el diálogo de confirmación global y los textos van en
  la opción `confirm` (ver [05-hooks.md](05-hooks.md#usemutation)).
- **Registrar la pantalla es parte de crearla.** Sin su entrada en `<rol>.routes.jsx` la URL cae en
  `NotFoundScreen`; solo el listado va al Sidebar.
- **Los identificadores de permiso nuevos se asignan después del deploy del server que los declara.**

## Checklist del ejecutor

- [ ] `modules/superadmin/` tiene `members`, `members-create`, `members-edit`, `members-show`,
      `members-permissions`, `members-permissions-show` y `members-permissions-edit`, con el código de
      esta página.
- [ ] `member.schema.js` valida solo `name`, `surname`, `email` y `password` (alta), `phone` y
      `birthdate`; ningún formulario, listado ni detalle muestra otros campos de perfil.
- [ ] Existen `superadmins*` con las mismas siete carpetas, copiados de `members*` con la tabla de
      diferencias aplicada, sin imports entre los dos.
- [ ] Cada `page.jsx` es `export default function Page ()` con `useResolver`, `PageLoading`,
      `PageError` y un solo componente con `{...data}`.
- [ ] Cada `resolvers.js` existe; los de alta son `export default {}`; los de edición y detalle lanzan
      si `getOne` devuelve `null`.
- [ ] Cada service es `service('<path>')` y el `path` coincide con el endpoint del API y el módulo de
      permisos del server (`members`, `members-disable`, `members-permissions`, `superadmins`,
      `superadmins-disable`, `superadmins-permissions`).
- [ ] La expresión regular de los schemas de permisos lista exactamente los roles del destino.
- [ ] Las doce rutas de cuentas están en `superadmin.routes.jsx` y el Sidebar tiene `Superadmins`
      (`/superadmins`) y `Miembros` (`/members`).
- [ ] Bloquear la propia cuenta de superadmin devuelve 403 del server y el cliente lo muestra en un
      toast sin cerrar el modal.
- [ ] Ningún archivo de `modules/superadmin/` importa de `modules/member/` ni al revés.
