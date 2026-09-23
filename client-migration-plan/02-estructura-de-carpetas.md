# 02 · Estructura de carpetas

## Propósito

Fija el árbol de `app/` en el destino, el vocabulario con el que el resto del plan clasifica cada
archivo y las reglas de nombres. Se lee completo antes de tocar código, junto con
[01-arquitectura.md](01-arquitectura.md), y se usa en la **Fase 0** (inventario y diff contra el
destino) y en la **Fase 1** (crear las carpetas que falten).

## Vocabulario

Cada archivo del árbol lleva una de estas tres marcas. El resto de los documentos usa las mismas
palabras con el mismo significado.

| Marca | Significado | Qué hace el ejecutor |
|---|---|---|
| **base** | Pieza de la arquitectura. Sin ella el cliente no arranca o un flujo base se rompe. | La transporta tal cual, con los placeholders fijados en la Fase 0. |
| **template** | Forma que se repite por cada recurso de dominio del destino. El plan la muestra con el recurso de ejemplo `items`. | No la copia literal: la usa como molde para cada recurso propio. |
| **opcional** | Pieza que depende de algo que el destino puede no tener (un endpoint, cuentas demo). | La transporta solo si el destino cumple la condición que indica su documento. |

Un **stub** es una pieza base que se transporta vacía porque su contenido es de producto: el
`dashboard` de cada rol.

## Árbol de `app/`

```txt
app/
  .env.local                                   base      03
  amplify.yml                                  base      12
  index.html                                   base      03
  jsconfig.json                                base      03
  package.json                                 base      03
  vite.config.js                               base      03
  public/
    favicon.svg                                base      identidad del destino
    assets/images/
      logo-base.png                            base      identidad del destino
      logo-white.png                           base      identidad del destino
      login-side.png                           base      identidad del destino
  src/
    main.jsx                                   base      07
    App.jsx                                    base      07
    globals.css                                base      03
    core/
      service.js                               base      04
      upload.js                                base      11
    lib/
      environment.js                           base      03
      utils.js                                 base      04
      logger.js                                base      04
      user-agent.js                            base      04
      date.js                                  base      04
    hooks/
      use-resolver.js                          base      05
      use-form.js                              base      05
      use-mutation.js                          base      05
      use-query-params.js                      base      05
      use-logout.js                            base      05
      use-notifications.js                     opcional  05
    stores/
      session.store.js                         base      06
      confirmation-dialog.store.js             base      06
    constants/
      support.js                               base      07
    routes/
      public.routes.jsx                        base      07
      no-session.routes.jsx                    base      07
      superadmin.routes.jsx                    base      07
      member.routes.jsx                        base      07
    modals/
      <ModalId>/<ModalId>.jsx                  template  10
    components/
      modalWrapper.jsx                         base      10
      confirmation-dialog.jsx                  base      06
      theme-provider.jsx                       base      09
      Authorization/Authorization.jsx          base      07
      OauthCallback/OauthCallback.jsx          base      07
      DisabledAccount/DisabledAccount.jsx      base      07
      NotFoundScreen/NotFoundScreen.jsx        base      07
      SendEmailVerificationButton/
        SendEmailVerificationButton.jsx        base      07
      Notifications/notifications-listener.jsx opcional  07
      CustomPage/CustomPage.jsx                base      09
      CustomTable/CustomTable.jsx              base      09
      CustomTooltip/CustomTooltip.jsx          base      09
      PageState/PageState.jsx                  base      09
      Superadmin/
        SuperadminLayout.jsx                   base      07
        Header.jsx                             base      07
        Sidebar.jsx                            base      07
      Member/
        MemberLayout.jsx                       base      07
        Header.jsx                             base      07
        Sidebar.jsx                            base      07
      form/
        Form.jsx                               base      09
        FormPermissionsEditor.jsx              base      09
        FormUploadAvatar.jsx                   base      11
        FormUploadFiles.jsx                    base      11
        FormUploadFiles.utils.js               base      11
      ui/
        alert-dialog.jsx                       base      09
        avatar.jsx                             base      09
        badge.jsx                              base      09
        button.jsx                             base      09
        calendar.jsx                           base      09
        field.jsx                              base      09
        input.jsx                              base      09
        label.jsx                              base      09
        popover.jsx                            base      09
        select.jsx                             base      09
        separator.jsx                          base      09
        textarea.jsx                           base      09
        tooltip.jsx                            base      09
    modules/
      auth/logout.service.js                   base      07
      oauth/oauth.service.js                   base      07
      notifications/notifications.service.js   opcional  05
      public/
        auth/
          auth.schema.js                       base      07
          auth.service.js                      base      07
          components/
            AuthLayout.jsx                     base      07
            AuthSplitCard.jsx                  base      07
            PasswordInput.jsx                  base      07
            SignInForm.jsx                     base      07
            ResetPasswordForm.jsx              base      07
            DevAccounts.jsx                    opcional  07
          sign-in/{page.jsx,resolvers.js}      base      07
          sign-up/{page.jsx,resolvers.js}      base      07
          reset-password/{page.jsx,resolvers.js} base    07
        recovery-password/                     base      07
        email-verification/                    base      07
      superadmin/
        dashboard/                             base      13   stub
        disabled-account/                      base      07
        profile/                               base      07
        profile-edit/                          base      07
        profile-change-password/               base      07
        profile-sessions/                      base      07
        members/                               base      08
        members-create/                        base      08
        members-edit/                          base      08
        members-show/                          base      08
        members-permissions/                   base      08   sin pantalla, solo service
        members-permissions-show/              base      08
        members-permissions-edit/              base      08
        superadmins/                           base      08
        superadmins-create/                    base      08
        superadmins-edit/                      base      08
        superadmins-show/                      base      08
        superadmins-permissions/               base      08   sin pantalla, solo service
        superadmins-permissions-show/          base      08
        superadmins-permissions-edit/          base      08
        items/                                 template  13
        items-create/                          template  13
        items-edit/                            template  13
        items-show/                            template  13
      member/
        dashboard/                             base      13   stub
        disabled-account/                      base      07
        profile/                               base      07
        profile-edit/                          base      07
        profile-change-password/               base      07
        profile-sessions/                      base      07
```

La última columna es el documento que trae el código de esa pieza. Las tres imágenes de
`public/assets/images/` y el `favicon.svg` son de identidad: el plan fija el nombre del archivo y el
destino pone su propio arte.

`modals/` existe solo para los modales por query que se montan una vez para toda la app, en
`App.jsx`. El plan no trae ninguno base; la carpeta aparece cuando el destino crea el primero. Un
modal que pertenece a una pantalla vive en `components/` de su módulo. El detalle está en
[10-modales-por-query.md](10-modales-por-query.md#montaje-global-y-montaje-por-pantalla).

## Carpetas de `src/`

| Carpeta | Qué contiene | Qué no contiene |
|---|---|---|
| `core/` | Las dos puertas de salida a la red: `service.js` hacia el API y `upload.js` hacia el bucket. | Lógica de una pantalla. |
| `lib/` | Helpers puros sin React: entorno, clases CSS, logger, fechas, etiqueta del dispositivo. | Hooks y componentes. |
| `hooks/` | Hooks compartidos por todas las pantallas. | Hooks de un solo recurso: esos viven en la carpeta base del recurso. |
| `stores/` | Stores Zustand de alcance global. | Estado de servidor y estado de formularios. |
| `constants/` | Un archivo por recurso con constantes que usan varios módulos. | Una constante que usa un solo módulo: vive en ese módulo. |
| `routes/` | Un archivo por árbol de rutas. | Componentes de pantalla. |
| `modals/` | Modales por query de montaje global. | Modales de una pantalla. |
| `components/` | Componentes reutilizables entre módulos y el cromo de cada rol. | JSX específico de una pantalla. |
| `modules/` | Las pantallas, separadas por rol. | Código compartido entre roles. |

## Convención de un módulo

Cada pantalla es una carpeta **plana** dentro de `modules/<rol>/`. La forma completa está en
[08-modulos.md](08-modulos.md#anatomía-de-un-módulo); acá queda lo que afecta al árbol.

```txt
modules/<rol>/
  <recurso>/                      listado + lo compartido del recurso
    page.jsx
    resolvers.js
    <recurso>.service.js
    <recurso>.schema.js           solo si el recurso tiene formularios
    components/
  <recurso>-<accion>/             create, edit, show y cualquier otra acción
    page.jsx
    resolvers.js
    components/
```

- **Una carpeta por pantalla, sin anidar.** `items-create/`, nunca `items/create/`. El listado es
  `<recurso>/`; el resto, `<recurso>-<accion>/`.
- **`page.jsx` y `resolvers.js` existen siempre.** Si la pantalla no lee del API, `resolvers.js` es
  `export default {}`.
- **`components/` lleva todo el JSX.** Solo falta cuando la pantalla pinta un componente compartido:
  `disabled-account/` usa `components/DisabledAccount/` y las pantallas de `public/auth/` usan
  `public/auth/components/`.
- **La carpeta base `<recurso>/` es dueña del recurso.** Services, schemas, helpers y hooks que usan
  varias pantallas del recurso viven ahí, y las pantallas `<recurso>-<accion>/` los importan desde
  `@/modules/<rol>/<recurso>/`. Lo que usa una sola pantalla vive en su carpeta.
- **Recurso sin pantalla.** La carpeta no tiene `page.jsx`, solo lo compartido. Es el caso de
  `members-permissions/` y `superadmins-permissions/`, que solo tienen su service.
- **Módulos sin rol.** `modules/auth/`, `modules/oauth/` y `modules/notifications/` tienen solo un
  service: los consumen `components/` y `hooks/`, no una pantalla.
- **Sin imports entre roles.** `modules/superadmin/` nunca importa de `modules/member/` ni al
  revés. Si dos roles necesitan lo mismo, se duplica. La razón está en
  [08-modulos.md](08-modulos.md#separación-por-rol).

La carpeta decide la URL. Las URLs no llevan prefijo de rol: todos los árboles cuelgan de `/`.

| Carpeta | URL |
|---|---|
| `dashboard/` | `/` (índice) |
| `<recurso>/` | `/<recurso>` |
| `<recurso>-create/` | `/<recurso>/create` |
| `<recurso>-edit/` | `/<recurso>/edit/:id` (sin `:id` si el recurso es de la sesión, como `profile`) |
| `<recurso>-show/` | `/<recurso>/show/:id` |
| `<recurso>-<accion>/` | `/<recurso>/<accion>` (`profile-change-password/` → `/profile/change-password`) |

## Nombres de archivos y carpetas

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Archivo o carpeta en general | kebab-case | `use-query-params.js`, `members-create/` |
| Componente React | PascalCase `.jsx`, igual al componente que exporta | `CustomTable.jsx` |
| Carpeta de un componente compartido | PascalCase, igual al componente | `components/CustomPage/` |
| Carpeta del cromo de un rol | PascalCase, el rol | `components/Superadmin/` |
| Pantalla | `page.jsx` dentro de su módulo | `modules/superadmin/items/page.jsx` |
| Resolvers | `resolvers.js` dentro de su módulo | `modules/superadmin/items/resolvers.js` |
| Hook | `use-<nombre>.js` | `use-resolver.js` |
| Service | `<feature>.service.js` | `items.service.js` |
| Schema Zod | `<recurso>.schema.js`, en singular | `item.schema.js` |
| Store | `<nombre>.store.js` | `session.store.js` |
| Archivo de rutas | `<arbol>.routes.jsx` | `member.routes.jsx` |
| Constantes | `<recurso>.js` en `constants/`, un archivo por recurso y no por campo | `support.js` |
| Componente `ui/` | kebab-case, el nombre que le da shadcn | `alert-dialog.jsx` |

En el código: camelCase para variables, funciones y métodos; PascalCase para componentes. La variable
sigue al archivo: `items.service.js` se importa como `itemsService`. Los exports siguen a los archivos
hermanos del directorio: si los services del módulo usan `export default`, el nuevo también.

Tres archivos base no son kebab-case ni PascalCase de componente y se transportan con su nombre:
`components/modalWrapper.jsx`, `components/confirmation-dialog.jsx` y `components/theme-provider.jsx`.
No se renombran: el resto del plan los importa por esa ruta.

## Reglas de uso

- **Antes de crear una carpeta, buscar la equivalente en el destino.** La Fase 0 produce un diff entre
  este árbol y el `app/` del destino. Una carpeta que ya existe con otro nombre se adapta, no se
  duplica; si el nombre choca con una convención del destino, se pregunta al usuario.
- **No crear `modules/<rol>/<recurso>/<accion>/`.** La anidación rompe la tabla carpeta → URL y obliga a
  imports relativos largos.
- **No crear `modules/shared/` ni `modules/common/`.** Lo compartido entre módulos del mismo rol vive
  en la carpeta base del recurso; lo compartido entre roles no existe, salvo `components/form/`.
- **No mover un componente a `components/` porque "podría reutilizarse".** Sube cuando lo usa más de un
  módulo; hasta entonces vive junto a su pantalla.
- **No agregar un archivo de constantes por campo.** Un archivo por recurso.

## Checklist del ejecutor

- [ ] El diff de la Fase 0 lista cada archivo **base** de este árbol como "existe", "existe con otro
      nombre" o "falta".
- [ ] Cada archivo **opcional** tiene una decisión escrita: entra o no entra, y por qué.
- [ ] `modules/` tiene una carpeta por rol del destino y ninguna compartida.
- [ ] Ninguna carpeta de `modules/<rol>/` está anidada dentro de otra pantalla.
- [ ] Cada carpeta de pantalla tiene `page.jsx` y `resolvers.js`.
- [ ] Los nombres nuevos siguen la tabla de patrones.
