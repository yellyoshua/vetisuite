# 10 · Modales por query

## Propósito

Documenta los modales cuyo estado abierto/cerrado vive en la URL (`?modal=<ModalId>`): el HOC que los
abre, los dos hooks para abrirlos y cerrarlos, dónde se montan, cómo reciben parámetros, cómo conviven
con `useResolver` y qué accesibilidad dan. Se usa en la **Fase 5** (modales por query), después de los
componentes base de la Fase 4 y antes de rutas y sesión: `App.jsx` y los listados de la Fase 8 montan
modales con esta pieza.

`components/modalWrapper.jsx` es **base**. Cada modal concreto es **template**: el plan trae el de
deshabilitar una cuenta como ejemplo y el recurso de ejemplo lo repite en
[13-templates.md](13-templates.md#modal-por-query).

## modalWrapper.jsx

Path: `src/components/modalWrapper.jsx`.

```jsx
import {useCallback, useEffect, useRef} from 'react';
import {useSearchParams} from 'react-router';

export function withModalFromQuery (ModalComponent, modalId) {
  return function ModalWithQuery (props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const panelRef = useRef(null);
    const isOpen = searchParams.get('modal') === modalId;

    const handleClose = useCallback(() => {
      const params = new URLSearchParams(searchParams);
      params.delete('modal');
      setSearchParams(params, {replace: true});
    }, [searchParams, setSearchParams]);

    useEffect(() => {
      if (!isOpen) {
        return undefined;
      }

      const previouslyFocused = document.activeElement;

      panelRef.current?.focus();

      return () => previouslyFocused?.focus?.();
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) {
        return undefined;
      }

      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          handleClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleClose]);

    if (!isOpen) {
      return null;
    }

    return (
      <div
        role="presentation"
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div
          ref={panelRef}
          role="dialog"
          tabIndex={-1}
          onClick={(event) => event.stopPropagation()}
          className={ModalComponent.modalClassName || 'bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto outline-none'}
        >
          <ModalComponent
            {...props}
            isOpen={isOpen}
            onClose={handleClose}
          />
        </div>
      </div>
    );
  };
}

export function useOpenModal () {
  const [searchParams, setSearchParams] = useSearchParams();

  return (modalId, extraParams = {}) => {
    const params = new URLSearchParams(searchParams);
    params.set('modal', modalId);
    Object.entries(extraParams).forEach(([key, value]) => params.set(key, value));
    setSearchParams(params);
  };
}

export function useCloseModal () {
  const [searchParams, setSearchParams] = useSearchParams();

  return () => {
    const params = new URLSearchParams(searchParams);
    params.delete('modal');
    setSearchParams(params, {replace: true});
  };
}
```

Tres exports, todos con nombre.

**`withModalFromQuery(ModalComponent, modalId)`.** Higher Order Component que envuelve el contenido de
un modal y lo muestra cuando la URL tiene `?modal=<modalId>`. Pinta el fondo, el panel y la lógica de
foco y teclado, e inyecta en el contenido dos props: `isOpen` y `onClose`. Las demás props que recibe el
componente envuelto pasan tal cual al contenido (por ejemplo, el `refetch` de la pantalla).

**`isOpen` se deriva de la URL.** No es un `useState` espejo sincronizado con un `useEffect`: ese par
pintaría un frame cerrado antes de abrir y podría quedar desincronizado tras atrás/adelante del
navegador. Leerlo de `searchParams` en cada render lo mantiene siempre igual a la URL. Cerrado, el
componente devuelve `null`: el contenido se desmonta y su estado local se pierde, así que un modal que
se reabre arranca limpio.

**`handleClose` escribe con `replace`.** Quita `modal` del query string y conserva el resto. Con una
escritura normal (push), el botón atrás del navegador volvería a la URL con `?modal` y reabriría el modal
que el usuario acaba de cerrar. `handleClose` es lo que recibe el contenido como `onClose`, lo que
dispara Escape y lo que dispara el click en el fondo.

**`ModalComponent.modalClassName`.** Las clases del panel por defecto son de fondo blanco fijo. Un
modal que necesita otro ancho o soporte de modo oscuro declara una propiedad estática `modalClassName`
en su componente y el HOC la usa en lugar del default (el ejemplo de este documento lo hace).

**`useOpenModal()`.** Devuelve `(modalId, extraParams = {})`: agrega `modal=<modalId>` y cada parámetro
extra al query string actual, sin tocar lo demás (página, búsqueda). Escribe con push: el botón atrás
cierra el modal recién abierto.

**`useCloseModal()`.** Devuelve `()` y quita `modal` del query string, igual que `handleClose`, y
también escribe con `replace` por el mismo motivo: con push, el botón atrás volvería a la URL con
`?modal` y reabriría el modal. Sirve para cerrar desde fuera del contenido del modal; dentro, usa la
prop `onClose`.

## Montaje global y montaje por pantalla

Un modal por query se monta de una de dos formas, según quién lo abre.

**Montaje global.** El modal se puede abrir desde cualquier pantalla (un botón flotante del cromo, un
enlace del header). Vive en `src/modals/<ModalId>/<ModalId>.jsx`, exporta por default
`withModalFromQuery(<Contenido>, '<ModalId>')` y se monta una sola vez en `App.jsx`, junto al resto del
cromo global ([07-rutas-y-sesion.md](07-rutas-y-sesion.md#appjsx)). Como está montado siempre, cualquier
componente lo abre con `useOpenModal()('<ModalId>')` sin importarlo. El plan no trae ningún modal global
base: la carpeta `modals/` aparece cuando el destino crea el primero
([02-estructura-de-carpetas.md](02-estructura-de-carpetas.md#árbol-de-app)).

**Montaje por pantalla.** El modal pertenece a una pantalla (bloquear una fila del listado, confirmar
una acción con datos del registro). Vive en `components/` del módulo, junto al componente de la
pantalla, y lo monta ese componente dentro de su JSX, pasándole lo que necesita de la pantalla (el
`refetch` de su `useResolver`). Solo existe mientras la pantalla está montada, así que `?modal=<ModalId>`
no abre nada en otra ruta. El archivo exporta el id del modal como constante con nombre para que la
pantalla lo abra sin repetir el string. Es la forma del
[ejemplo de deshabilitar](10-modales-por-query.md#ejemplo-modal-de-deshabilitar).

La regla para elegir: si el modal usa datos o acciones de una pantalla, va por pantalla; si lo abre el
cromo de la app, va global. No se sube un modal a `modals/` porque "podría abrirse desde otro lado".

## Parámetros extra

El modal no recibe su contexto por props sino por la URL: quien lo abre pasa los datos que necesita
como parámetros extra, y el contenido los lee con `useSearchParams`.

```jsx
const openModal = useOpenModal();

openModal('<ModalId>', {id: item.id});
```

```jsx
const [searchParams] = useSearchParams();
const id = searchParams.get('id');
```

La URL queda `?modal=<ModalId>&id=<id>`, así que una recarga o un enlace compartido vuelven a abrir el
modal con el mismo registro. Todo viaja como string: un booleano se pasa con `String(valor)` y se
compara contra `'true'` al leerlo. Usa nombres de parámetro que no choquen con los del listado (`page`,
`search`) ni con `modal`.

Dos comportamientos del código tal como está, que el ejecutor debe conocer:

- `handleClose` y `useCloseModal` quitan solo `modal`; los parámetros extra quedan en la URL después de
  cerrar.
- `useResolver` quita del query solo `modal`. Los parámetros extra sí cambian su dependencia: abrir un
  modal con parámetros extra encima de una pantalla con `useResolver` vuelve a pedir sus datos y la
  pantalla pasa por `isLoading` mientras tanto.

## El parámetro modal y useResolver

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

La mitad de los hooks de este acoplamiento está en
[05-hooks.md](05-hooks.md#acoplamiento-con-los-modales-por-query).

## Accesibilidad

Lo que el HOC da, y lo que no:

- **Foco al panel al abrir.** El panel tiene `tabIndex={-1}` y recibe el foco cuando `isOpen` pasa a
  `true`; un lector de pantalla empieza a leer desde el diálogo. `outline-none` en las clases del panel
  quita el anillo de ese foco programático, que no es un foco de teclado sobre un control.
- **Retorno del foco al cerrar.** El efecto guarda `document.activeElement` antes de mover el foco y lo
  devuelve en la limpieza. Sin esto el teclado quedaría en `<body>` y el usuario perdería su lugar en la
  pantalla de atrás.
- **Escape cierra.** Un listener de `keydown` en `document`, activo solo mientras el modal está abierto,
  llama a `handleClose`.
- **Click en el fondo cierra.** El fondo tiene `role="presentation"` y cierra al hacer click; el panel
  detiene la propagación para que un click dentro no cierre.
- **`role="dialog"` sin `aria-modal`.** No hay trampa de foco: el Tab sigue saliendo del panel hacia la
  pantalla de atrás. Declarar `aria-modal="true"` le prometería a un lector de pantalla un aislamiento
  que no existe. Si el destino agrega una trampa de foco, recién entonces corresponde `aria-modal`.
- **Sin nombre accesible en el panel.** El panel no declara `aria-labelledby` ni `aria-label`: el
  lector de pantalla anuncia un diálogo sin nombre y el título del contenido se lee como texto
  normal.

El contenido de cada modal es responsable de lo suyo: un título visible como encabezado, botones con
`type="button"` y texto visible, y los campos de formulario con su `label`
([09-componentes.md](09-componentes.md#formularios)). Para una confirmación simple sin datos en la URL
no uses un modal por query: usa el diálogo global de
[06-stores.md](06-stores.md#confirmationdialog), que sí es un diálogo modal completo.

## Ejemplo: modal de deshabilitar

Bloquear o habilitar una cuenta desde el listado de `members`. Es un modal de montaje por pantalla.

Path: `src/modules/superadmin/members/members-disable.service.js`.

```js
import service from '@/core/service';

export default service('members-disable');
```

Path: `src/modules/superadmin/members/components/MembersDisableModal.jsx`.

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

El listado lo abre y lo monta así (extracto de `Members.jsx`, solo las líneas del modal; el archivo
completo está en [08-modulos.md](08-modulos.md#gestión-de-cuentas)):

```jsx
import {useOpenModal} from '@/components/modalWrapper';
import MembersDisableModal, {MEMBERS_DISABLE_MODAL_ID} from './MembersDisableModal';
```

```jsx
const openModal = useOpenModal();
```

```jsx
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
```

```jsx
<MembersDisableModal refetch={refetch} />
```

**Un solo modal para las dos acciones.** El listado pasa el estado objetivo en `disabled`
(`String(!member.user.disabled)`): `'true'` pide bloquear y `'false'` pide habilitar. El modal lee
`member` y `disabled` de la URL y ajusta título y texto.

**`skipConfirm: true`.** El modal ya es el paso de confirmación; `useMutation` no abre además el diálogo
global.

**`onSuccess` cierra y relee.** `onClose()` quita `modal` de la URL y `refetch()` vuelve a pedir el
listado para que la fila muestre el estado nuevo. `refetch` llega por props desde la pantalla, que lo
recibe de su `useResolver` ([05-hooks.md](05-hooks.md#useresolver)).

**El botón que abre tiene nombre accesible.** Es un botón de solo icono, así que el `aria-label` dice
la acción y la cuenta afectada.

**El endpoint es un service propio.** `service('members-disable')` con `put({id, disabled})`: la acción
tiene su propio path en el API en lugar de un campo más del `put` de `members`, porque el API la
autoriza con un permiso distinto al de editar. `superadmins` tiene su propio par
`SuperadminsDisableModal.jsx` + `superadmins-disable.service.js`, idéntico salvo el recurso, el
parámetro (`superadmin`) y el texto; sus diferencias de reglas están en
[08-modulos.md](08-modulos.md#gestión-de-cuentas).

## Reglas de uso

- **Usa un modal por query cuando el modal tiene que sobrevivir a una recarga o abrirse con un enlace**,
  o cuando necesita datos de un registro. Para una confirmación simple, usa `useMutation` con el diálogo
  global ([06-stores.md](06-stores.md#confirmation-dialogstorejs)).
- **El id del modal es único en la app** y en kebab-case (`members-disable`). Dos modales con el mismo
  id se abren juntos.
- **Cierra desde el contenido con la prop `onClose`**; `useCloseModal` es para cerrar desde fuera del
  modal. Los dos escriben con `replace`, así que el botón atrás no reabre el modal.
- **No guardes el estado abierto en `useState`.** El HOC lo deriva de la URL; un estado espejo se
  desincroniza.
- **Pasa el contexto como parámetros extra, no por un store.** Y cuenta con que abrir un modal con
  parámetros extra relee la pantalla (ver
  [Parámetros extra](10-modales-por-query.md#parámetros-extra)).
- **No agregues `aria-modal` sin agregar antes una trampa de foco.**
- **Modal global en `modals/` y montado en `App.jsx`; modal de pantalla en `components/` del módulo y
  montado por su componente.** Nunca los dos.

## Checklist del ejecutor

- [ ] `src/components/modalWrapper.jsx` copiado completo, con sus tres exports con nombre.
- [ ] Ningún resolver del destino lee `modal`.
- [ ] Cada modal por pantalla vive en `components/` de su módulo, exporta su id como constante y lo monta
      el componente de la pantalla pasándole `refetch`.
- [ ] Cada modal global vive en `src/modals/<ModalId>/<ModalId>.jsx` y está montado una sola vez en
      `App.jsx`.
- [ ] Los contenidos de modal cierran con `onClose`.
- [ ] Los modales con soporte de modo oscuro declaran `modalClassName`.
- [ ] `members-disable.service.js` y `MembersDisableModal.jsx` copiados; el listado de `members` abre el
      modal con `{member, disabled}` y lo monta con `refetch`.
- [ ] Probado a mano: abrir con teclado, Escape cierra y el foco vuelve al botón que lo abrió.
