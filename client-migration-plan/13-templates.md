# 13 · Templates

## Propósito

Trae el molde completo de un recurso de dominio (`items`) para el panel `superadmin` y el stub del
dashboard de cada rol. Se usa en la **Fase 8** (módulos y gestión de cuentas), después de
[08-modulos.md](08-modulos.md#anatomía-de-un-módulo), que explica el porqué de cada archivo. Aquí no
hay decisiones nuevas: cada recurso del destino se crea copiando estas carpetas y reemplazando
`items`/`item`/`Item` por el nombre del recurso.

`items` tiene un solo campo editable, `name`, y además un estado `disabled` que se cambia desde un
modal por query. Árbol que produce:

```txt
src/modules/superadmin/
  items/
    page.jsx
    resolvers.js
    items.service.js
    items-disable.service.js
    item.schema.js
    components/
      Items.jsx
      ItemsDisableModal.jsx
  items-create/
    page.jsx
    resolvers.js
    components/CreateItemForm.jsx
  items-edit/
    page.jsx
    resolvers.js
    components/EditItemForm.jsx
  items-show/
    page.jsx
    resolvers.js
    components/ItemOverview.jsx
```

El API del destino tiene que exponer `GET/POST/PUT/DELETE /api/items` (con `search`, `page` e `id`
como filtros de `GET`) y `PUT /api/items-disable` con `{id, disabled}`, y cada fila de `items` tiene
que traer `id`, `name`, `createdAt` y `disabled`. Si el recurso no se borra o no se deshabilita, quita
la pieza correspondiente (ver [Checklist por módulo](13-templates.md#checklist-por-módulo)).

## items.service.js

`src/modules/superadmin/items/items.service.js`

```js
import service from '@/core/service';

export default service('items');
```

El `path` es el segmento bajo `/api/` y el nombre del módulo de permisos del server. `getOne({id})`
es el detalle: no hay ruta `/api/items/:id`. Ver
[08-modulos.md](08-modulos.md#service-por-feature).

## item.schema.js

`src/modules/superadmin/items/item.schema.js`

```js
import zod from 'zod';

export const createItemSchema = zod.object({
  name: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres')
});

export const updateItemSchema = zod.object({
  name: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres')
});
```

Alta y edición validan lo mismo, pero se exportan los dos: cuando el recurso crezca, cada formulario
cambia su schema sin tocar el otro, y los componentes ya importan el nombre correcto.

## Listado

`src/modules/superadmin/items/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import Items from './components/Items';

export default function Page () {
  const {data, error, isLoading, refetch} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <Items {...data} refetch={refetch} />;
}
```

`src/modules/superadmin/items/resolvers.js`

```js
import itemsService from './items.service';

export default {
  items: (params, search) => itemsService.get({search: search.search, page: search.page})
};
```

`src/modules/superadmin/items/components/Items.jsx`

```jsx
import {Link} from 'react-router';
import {EyeIcon, LockIcon, LockOpenIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon} from 'lucide-react';
import useQueryParams from '@/hooks/use-query-params';
import useMutation from '@/hooks/use-mutation';
import {useOpenModal} from '@/components/modalWrapper';
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import CustomTable from '@/components/CustomTable/CustomTable';
import CustomTooltip from '@/components/CustomTooltip/CustomTooltip';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {formatDate} from '@/lib/date';
import itemsService from '../items.service';
import ItemsDisableModal, {ITEMS_DISABLE_MODAL_ID} from './ItemsDisableModal';

export default function Items ({items, refetch}) {
  const {nextPage, prevPage, search, query} = useQueryParams();
  const openModal = useOpenModal();
  const [isRemoving, removeItem] = useMutation((id) => itemsService.remove({id}), {
    confirm: {
      title: '¿Estás seguro de eliminar este ítem?',
      description: 'Esta acción no se puede deshacer.'
    },
    successMessage: 'Ítem eliminado correctamente',
    onSuccess: () => refetch()
  });

  return (
    <CustomPage
      title="Ítems"
      description="Gestiona los ítems de la plataforma"
      actions={
        <Link to="/items/create" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
          Crear Ítem
        </Link>
      }
    >
      <CustomPageContainer>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            aria-label="Buscar ítems"
            placeholder="Buscar por nombre..."
            defaultValue={query.search || ''}
            onChange={({target}) => search(target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>
      </CustomPageContainer>

      <CustomTable dataSize={items.length} currentPage={Number(query.page) || 1} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Creado</CustomTable.TheadItem>
            <CustomTable.TheadItem>Nombre</CustomTable.TheadItem>
            <CustomTable.TheadItem className="text-center">Estado</CustomTable.TheadItem>
            <CustomTable.TheadItem className="text-right">Acciones</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {items.map((item) => (
            <CustomTable.TableRow key={item.id}>
              <CustomTable.TBodyItem>{formatDate(item.createdAt)}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{item.name}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem className="text-center">
                {
                  item.disabled ? (
                    <Badge variant="outline" className="text-red-600 border-red-600 dark:text-white dark:border-red-600 dark:bg-red-600">
                      <LockIcon />
                      Deshabilitado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600 dark:text-white dark:border-green-600 dark:bg-green-600">
                      <LockOpenIcon />
                      Activo
                    </Badge>
                  )
                }
              </CustomTable.TBodyItem>
              <CustomTable.TBodyItem type="actions">
                <Link to={`/items/show/${item.id}`}>
                  <Button variant="outline" size="icon" className="cursor-pointer" aria-label={`Ver el ítem ${item.name}`}>
                    <EyeIcon className="w-4 h-4 text-green-500" />
                  </Button>
                </Link>
                <Link to={`/items/edit/${item.id}`}>
                  <Button variant="outline" size="icon" className="cursor-pointer" aria-label={`Editar el ítem ${item.name}`}>
                    <PencilIcon className="w-4 h-4 text-blue-500" />
                  </Button>
                </Link>
                <CustomTooltip content={item.disabled ? 'Habilitar ítem' : 'Deshabilitar ítem'}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => openModal(ITEMS_DISABLE_MODAL_ID, {item: item.id, disabled: String(!item.disabled)})}
                    aria-label={item.disabled ? `Habilitar el ítem ${item.name}` : `Deshabilitar el ítem ${item.name}`}
                  >
                    {
                      item.disabled
                        ? <LockOpenIcon className="w-4 h-4 text-green-500" />
                        : <LockIcon className="w-4 h-4 text-red-500" />
                    }
                  </Button>
                </CustomTooltip>
                <Button
                  disabled={isRemoving}
                  variant="outline"
                  size="icon"
                  className="cursor-pointer"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Eliminar el ítem ${item.name}`}
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </Button>
              </CustomTable.TBodyItem>
            </CustomTable.TableRow>
          ))}
        </CustomTable.TBody>
      </CustomTable>

      <ItemsDisableModal refetch={refetch} />
    </CustomPage>
  );
}
```

- **Buscador y paginación.** `useQueryParams` escribe `search` y `page` en la URL con un debounce de
  600 ms y `replace: true`; buscar reinicia la página. `useResolver` vuelve a leer porque cambió el
  query string: el componente no llama a `refetch` para eso. Ver
  [05-hooks.md](05-hooks.md#usequeryparams).
- **Tabla.** `CustomTable` recibe `dataSize` (cuántas filas llegaron) y la página actual de la URL;
  con eso decide si habilita "anterior" y "siguiente". Ver
  [09-componentes.md](09-componentes.md#customtable).
- **Eliminar** usa `useMutation` con `confirm`: el hook abre el diálogo de confirmación global y solo
  llama al service si el usuario acepta. `onSuccess` pide `refetch` porque la URL no cambió. Ver
  [05-hooks.md](05-hooks.md#usemutation).
- **Deshabilitar** abre el modal por query con el id y el estado destino como strings. El modal se
  monta dentro del listado porque necesita su `refetch`.
- El import del service es relativo (`'../items.service'`) porque el componente está dentro de la
  carpeta dueña del recurso. Desde otra carpeta se usa el alias `@/modules/superadmin/items/…`.

## Alta

`src/modules/superadmin/items-create/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import CreateItemForm from './components/CreateItemForm';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <CreateItemForm {...data} />;
}
```

`src/modules/superadmin/items-create/resolvers.js`

```js
export default {};
```

La pantalla no lee nada del API: el formulario arranca vacío. El archivo existe igual para mantener la
forma de la pantalla.

`src/modules/superadmin/items-create/components/CreateItemForm.jsx`

```jsx
import useForm from '@/hooks/use-form';
import Form, {FormInput} from '@/components/form/Form';
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import itemsService from '@/modules/superadmin/items/items.service';
import {createItemSchema} from '@/modules/superadmin/items/item.schema';

export default function CreateItemForm () {
  const form = useForm({name: ''}, {
    onSubmit: (body) => itemsService.post(body),
    schema: createItemSchema,
    successMessage: 'Ítem creado correctamente',
    redirectTo: '/items'
  });

  return (
    <CustomPage title="Crear Ítem" description="Ingresa el nombre del nuevo ítem" goBackPath="/items">
      <CustomPageContainer>
        <Form onSubmit={form.handleSubmit} className="space-y-6">
          <FormInput
            control={form.control}
            name="name"
            label="Nombre del Ítem"
            placeholder="Nombre"
          />

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

`useForm({name: ''}, …)` declara el único campo con su valor inicial vacío. `redirectTo` vuelve al listado y `successMessage` es el toast. Ver
[05-hooks.md](05-hooks.md#useform).

## Edición

`src/modules/superadmin/items-edit/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import EditItemForm from './components/EditItemForm';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <EditItemForm {...data} />;
}
```

`src/modules/superadmin/items-edit/resolvers.js`

```js
import itemsService from '@/modules/superadmin/items/items.service';

export default {
  item: async (params) => {
    const item = await itemsService.getOne({id: params.id});

    if (!item) {
      throw new Error('No se encontró el ítem');
    }

    return item;
  }
};
```

El id de la URL puede no existir: sin ítem no hay formulario que pintar, así que el resolver lanza y
`page.jsx` muestra `PageError`.

`src/modules/superadmin/items-edit/components/EditItemForm.jsx`

```jsx
import useForm from '@/hooks/use-form';
import Form, {FormInput} from '@/components/form/Form';
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import itemsService from '@/modules/superadmin/items/items.service';
import {updateItemSchema} from '@/modules/superadmin/items/item.schema';

export default function EditItemForm ({item}) {
  const form = useForm({name: item.name}, {
    onSubmit: (body) => itemsService.put({...body, id: item.id}),
    schema: updateItemSchema,
    successMessage: 'Ítem actualizado correctamente',
    redirectTo: '/items'
  });

  return (
    <CustomPage title="Actualizar Ítem" description="Actualiza el nombre del ítem" goBackPath="/items">
      <CustomPageContainer>
        <Form onSubmit={form.handleSubmit} className="space-y-6">
          <FormInput
            control={form.control}
            name="name"
            label="Nombre del Ítem"
            placeholder="Nombre"
          />

          <div className="flex gap-3 justify-end">
            <button type="submit" disabled={form.isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors">
              {form.isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Form>
      </CustomPageContainer>
    </CustomPage>
  );
}
```

Los valores iniciales son solo los campos editables (`{name: item.name}`) y el id se agrega al body en
`onSubmit`: el formulario no carga el registro entero.

## Detalle

`src/modules/superadmin/items-show/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import ItemOverview from './components/ItemOverview';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <ItemOverview {...data} />;
}
```

`src/modules/superadmin/items-show/resolvers.js`

```js
import itemsService from '@/modules/superadmin/items/items.service';

export default {
  item: async (params) => {
    const item = await itemsService.getOne({id: params.id});

    if (!item) {
      throw new Error('No se encontró el ítem');
    }

    return item;
  }
};
```

`src/modules/superadmin/items-show/components/ItemOverview.jsx`

```jsx
import CustomPage, {CustomPageContainer} from '@/components/CustomPage/CustomPage';
import {formatDate} from '@/lib/date';

export default function ItemOverview ({item}) {
  return (
    <CustomPage title="Detalles del Ítem" description="Información del ítem" goBackPath="/items">
      <CustomPageContainer>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1">{item.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creación</p>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
              {formatDate(item.createdAt, {year: 'numeric', month: 'long', day: 'numeric'})}
            </p>
          </div>
        </div>
      </CustomPageContainer>
    </CustomPage>
  );
}
```

Si el detalle necesita datos de otro recurso, se agrega otra clave en `resolvers.js` (el componente
la recibe como prop) y otro `CustomPageContainer`; el componente no lee del API.

## Modal por query

`src/modules/superadmin/items/items-disable.service.js`

```js
import service from '@/core/service';

export default service('items-disable');
```

`src/modules/superadmin/items/components/ItemsDisableModal.jsx`

```jsx
import {useSearchParams} from 'react-router';
import {withModalFromQuery} from '@/components/modalWrapper';
import {Button} from '@/components/ui/button';
import useMutation from '@/hooks/use-mutation';
import itemsDisableService from '../items-disable.service';

const MODAL_ID = 'items-disable';

function ItemsDisableModal ({onClose, refetch}) {
  const [searchParams] = useSearchParams();
  const item = searchParams.get('item');
  const isDisabling = searchParams.get('disabled') === 'true';
  const [isLoading, toggleStatus] = useMutation((body) => itemsDisableService.put(body), {
    skipConfirm: true,
    successMessage: 'Estado del ítem actualizado correctamente',
    onSuccess: () => {
      onClose();
      refetch();
    }
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {isDisabling ? 'Deshabilitar ítem' : 'Habilitar ítem'}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {isDisabling
          ? 'El ítem dejará de estar disponible. ¿Deseas continuar?'
          : 'El ítem volverá a estar disponible. ¿Deseas continuar?'}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={isLoading}
          onClick={() => toggleStatus({id: item, disabled: isDisabling})}
          className="cursor-pointer"
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
}

ItemsDisableModal.modalClassName = 'bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto outline-none';

export {MODAL_ID as ITEMS_DISABLE_MODAL_ID};
export default withModalFromQuery(ItemsDisableModal, MODAL_ID);
```

- El id del modal es el nombre del endpoint (`items-disable`): un solo string para URL, service y
  permiso.
- Lee `item` y `disabled` del query string; `disabled` es el estado destino que puso el listado.
- `skipConfirm: true` porque el modal ya es la confirmación. En error, `useMutation` muestra el toast
  y el modal queda abierto.
- `modalClassName` es la clase del contenedor que arma `withModalFromQuery`.

El patrón completo (URL como estado, montaje, parámetros extra, accesibilidad) está en
[10-modales-por-query.md](10-modales-por-query.md#ejemplo-modal-de-deshabilitar).

## Rutas

Extracto de `src/routes/superadmin.routes.jsx`, solo las líneas que agrega `items` (el archivo
completo está en [07-rutas-y-sesion.md](07-rutas-y-sesion.md#archivos-de-rutas)). Imports:

```jsx
import Items from '@/modules/superadmin/items/page';
import ItemsCreate from '@/modules/superadmin/items-create/page';
import ItemsEdit from '@/modules/superadmin/items-edit/page';
import ItemsShow from '@/modules/superadmin/items-show/page';
```

Entradas dentro de `children` del layout, antes de `profile` y del comodín `*`:

```jsx
      {path: 'items', element: <Items />},
      {path: 'items/create', element: <ItemsCreate />},
      {path: 'items/edit/:id', element: <ItemsEdit />},
      {path: 'items/show/:id', element: <ItemsShow />},
```

Los paths son relativos al layout montado en `/` y siguen la tabla carpeta → URL de
[02-estructura-de-carpetas.md](02-estructura-de-carpetas.md#convención-de-un-módulo).

## Sidebar

Extracto de `src/components/Superadmin/Sidebar.jsx`, solo lo que agrega `items` (el Sidebar completo
está en [07-rutas-y-sesion.md](07-rutas-y-sesion.md#layouts-por-rol)). Agrega `BookOpenIcon` al import
de `lucide-react`:

```jsx
import {BookOpenIcon, LayoutDashboardIcon, ShieldIcon, UserIcon, UsersIcon} from 'lucide-react';
```

Y la entrada en `menuItems`, antes de `Perfil`:

```jsx
    {
      name: 'Ítems',
      href: '/items',
      icon: <BookOpenIcon className="w-6 h-6" />
    },
```

Solo el listado entra al menú. Como el ítem activo se decide con `pathname.startsWith(item.href)`,
`/items/create`, `/items/edit/:id` y `/items/show/:id` dejan resaltado "Ítems".

## Dashboard stub

Cada rol tiene su `dashboard/` en `src/modules/<rol>/dashboard/` y lo monta como índice de su árbol
(`{index: true, element: <Dashboard />}` en `<rol>.routes.jsx`). Su contenido es de producto, así que
se transporta vacío: los mismos tres archivos sirven para `superadmin` y para `member`, uno en cada
carpeta de rol, sin compartirse.

`src/modules/<rol>/dashboard/page.jsx`

```jsx
import useResolver from '@/hooks/use-resolver';
import {PageError, PageLoading} from '@/components/PageState/PageState';
import resolvers from './resolvers';
import Dashboard from './components/Dashboard';

export default function Page () {
  const {data, error, isLoading} = useResolver(resolvers);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  return <Dashboard {...data} />;
}
```

`src/modules/<rol>/dashboard/resolvers.js`

```js
export default {};
```

`src/modules/<rol>/dashboard/components/Dashboard.jsx`

```jsx
export default function Dashboard () {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ¡Bienvenido a Proyecto!
        </h1>
      </div>
    </div>
  );
}
```

- `page.jsx` ya tiene la forma final: cuando el destino agregue métricas, solo cambian
  `resolvers.js` (por ejemplo `dashboard: () => dashboardService.get()`) y `Dashboard.jsx`.
- El contenedor de bienvenida es el mismo bloque con el que abren los paneles; es el lugar donde el
  destino pone sus tarjetas y listas.
- `Proyecto` es el nombre visible del producto; se reemplaza en la Fase 0.

## Checklist por módulo

Para cada recurso de dominio nuevo, con `<recurso>` en plural y kebab-case (`items`), `<Recurso>` su
forma PascalCase singular (`Item`) y `<Recursos>` la plural (`Items`):

- [ ] Existe el endpoint `GET/POST/PUT/DELETE /api/<recurso>` en el server, con su módulo de permisos
      del mismo nombre.
- [ ] `modules/<rol>/<recurso>/<recurso>.service.js` = `service('<recurso>')`.
- [ ] `modules/<rol>/<recurso>/<recurso-singular>.schema.js` con `create<Recurso>Schema` y
      `update<Recurso>Schema`.
- [ ] Listado: `<recurso>/{page.jsx,resolvers.js,components/<Recursos>.jsx}`; `page.jsx` pasa
      `refetch`; el resolver manda `search` y `page`.
- [ ] Alta: `<recurso>-create/` con `resolvers.js` = `export default {}` y `Create<Recurso>Form.jsx`.
- [ ] Edición: `<recurso>-edit/` con resolver que lanza si `getOne` devuelve `null` y
      `Edit<Recurso>Form.jsx`.
- [ ] Detalle: `<recurso>-show/` con el mismo resolver que edición y `<Recurso>Overview.jsx`.
- [ ] Si el recurso se deshabilita: `<recurso>-disable.service.js` y
      `components/<Recursos>DisableModal.jsx` montado en el listado. Si no, quita el botón, el badge
      de estado, el modal y su service.
- [ ] Si el recurso no se borra: quita el `useMutation` de `remove` y el botón con `TrashIcon`.
- [ ] Textos de UI con el nombre del recurso en español (título, descripción, toasts, `aria-label`,
      mensaje de "No se encontró…").
- [ ] Cuatro rutas en `<rol>.routes.jsx`: `<recurso>`, `<recurso>/create`, `<recurso>/edit/:id`,
      `<recurso>/show/:id`.
- [ ] Una entrada en `menuItems` del Sidebar del rol, con un icono de `lucide-react`.
- [ ] Si otro rol necesita el mismo recurso, repite todo en `modules/<otro-rol>/`, con su propio
      service; no hay imports entre roles.

## Reglas de uso

- **Copia, no parametrices.** El template se copia por recurso; no se convierte en un
  `ResourceTable` genérico con columnas por props. Cada recurso termina con columnas, acciones y
  textos propios, y un componente genérico acumula opciones hasta que nadie lo entiende.
- **No agregues campos al template.** `items` tiene solo `name` para que el molde no arrastre
  decisiones de producto. Los campos de cada recurso los define el destino, en su schema y su
  formulario.
- **Ni borrar ni deshabilitar son obligatorios.** Quita las piezas que el recurso no usa en vez de
  dejar botones que llaman a endpoints inexistentes.
- **El dashboard no lee nada hasta que haya un endpoint.** Mantén `resolvers.js` vacío; un resolver
  contra un endpoint que no existe deja la pantalla de inicio en `PageError`.
- **El stub no se comparte entre roles.** `superadmin` y `member` tienen cada uno su copia aunque
  sean idénticas hoy.

## Checklist del ejecutor

- [ ] `modules/superadmin/items`, `items-create`, `items-edit` e `items-show` existen con el código de
      esta página, o el destino los reemplazó por su primer recurso real siguiendo el
      [Checklist por módulo](13-templates.md#checklist-por-módulo).
- [ ] `items.service.js`, `items-disable.service.js` e `item.schema.js` viven en `items/`.
- [ ] El listado busca, pagina, abre el modal de deshabilitar y borra con confirmación.
- [ ] `/items?modal=items-disable&item=<id>&disabled=true` abre el modal al recargar la página.
- [ ] `superadmin.routes.jsx` tiene las cuatro rutas y el Sidebar la entrada `Ítems`.
- [ ] `modules/superadmin/dashboard/` y `modules/member/dashboard/` tienen `page.jsx`,
      `resolvers.js` (`export default {}`) y `components/Dashboard.jsx`, sin datos de producto.
- [ ] Los dos dashboards están montados como `{index: true, element: <Dashboard />}` en su archivo
      de rutas.
