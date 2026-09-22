# Auditoría de rutas privadas

Una fila por ruta privada del API. El módulo pkit es el nombre del archivo sin verbo y el método sale
del verbo HTTP (`GET → find`, `POST → create`, `PUT → update`, `DELETE → remove`). Claves reservadas
en todos los módulos: `id`, `limit`, `page`, `sort`, `perPage`, `order`.

Roles de cuenta: `superadmin`, `owner`, `employee`. El valor `public` del enum `role` no es un rol de
cuenta y no está en pkit.

| # | Ruta | Módulo | Método | Roles | Properties por rol | Hook por rol | Evidencia |
|---|---|---|---|---|---|---|---|
| 1 | `auth-logout.post.js` | `auth-logout` | `create` | superadmin, owner, employee | `[]` | — | borra la sesión de la cookie (`context.session`) |
| 2 | `files/[...path].get.js` | `files` | `find` | superadmin, owner, employee | `[]` | — | handler crudo: allowlist de carpetas (`images`); la ruta es una capability con UUID |
| 3 | `profile.get.js` | `profile` | `find` | superadmin, owner, employee | **superadmin**: `avatar`, `firstName`, `lastName`, `user` — **owner**: + `phone`, `description`, `position`, `occupation`, `organization`, `createdAt` — **employee**: `avatar`, `firstName`, `lastName`, `phone`, `position`, `color`, `organization`, `createdAt`, `user` | — | perfil siempre de la sesión (`context.profile.id`) |
| 4 | `profile.put.js` | `profile` | `update` | superadmin, owner, employee | **superadmin**: `avatar`, `firstName`, `lastName`, `email` — **owner**: + `phone`, `description`, `position`, `occupation` — **employee**: `avatar`, `firstName`, `lastName`, `email`, `phone` | **todos**: `assertOwnAvatar` | `profileSchema(profile)` por rol; archivo `avatar` → `images/` |
| 5 | `profile-password.put.js` | `profile-password` | `update` | superadmin, owner, employee | `currentPassword`, `password`, `confirmPassword` | — | `changePasswordSchema`; usuario de la sesión |
| 6 | `profile-email-verification.post.js` | `profile-email-verification` | `create` | superadmin, owner, employee | `[]` | — | publica `email_verification` |
| 7 | `profile-sessions.get.js` | `profile-sessions` | `find` | superadmin, owner, employee | `id`, `userAgent`, `createdAt`, `expiresAt`, `isCurrent` | — | pin `{user: profile.user.id}` |
| 8 | `profile-sessions.delete.js` | `profile-sessions` | `remove` | superadmin, owner, employee | `id` | **todos**: `assertOwnSession` (404) | `revokeProfileSessionSchema` |
| 9 | `uploads.post.js` | `uploads` | `create` | superadmin, owner, employee | `name`, `size`, `type` | — | key `temporal/<profile.user.id>/…` armada por el servidor |
| 10 | `superadmins.get.js` | `superadmins` | `find` | superadmin | `id`, `avatar`, `firstName`, `lastName`, `organization`, `createdAt`, `updatedAt`, `user`, `search` | — | `listParams` |
| 11 | `superadmins.post.js` | `superadmins` | `create` | superadmin | `firstName`, `lastName`, `email`, `password`, `avatar` | **superadmin**: `assertNewAvatar` | organización = la de la sesión |
| 12 | `superadmins.put.js` | `superadmins` | `update` | superadmin | `id`, `firstName`, `lastName`, `avatar` | **superadmin**: `assertKeptOrUploadedAvatar` | `updateSuperadminSchema` |
| 13 | `superadmins-disable.put.js` | `superadmins-disable` | `update` | superadmin | `id`, `disabled` | **superadmin**: `assertNotOwnAccount` (403) | `disableAccountSchema` |
| 14 | `superadmins-permissions.get.js` | `superadmins-permissions` | `find` | superadmin | `id` | — | `superadminPermissions.find` |
| 15 | `superadmins-permissions.put.js` | `superadmins-permissions` | `update` | superadmin | `id`, `permissions` | **superadmin**: `assertNotOwnAccount` (403), `assertSuperadminRolePermissions` (400) | `updateAccountPermissionsSchema` (formato, registro, duplicados) |
| 16 | `owners.get.js` | `owners` | `find` | superadmin | `id`, `avatar`, `firstName`, `lastName`, `phone`, `description`, `position`, `occupation`, `organization`, `createdAt`, `updatedAt`, `user`, `search` | — | todas las organizaciones |
| 17 | `owners.post.js` | `owners` | `create` | superadmin | `organization`, `firstName`, `lastName`, `email`, `password`, `phone` | — | `assertOrganizationExists` (404) |
| 18 | `owners.put.js` | `owners` | `update` | superadmin | `id`, `firstName`, `lastName`, `phone`, `description`, `position`, `occupation` | — | `updateOwnerSchema` |
| 19 | `owners-disable.put.js` | `owners-disable` | `update` | superadmin | `id`, `disabled` | — | `disableAccountSchema` |
| 20 | `owners-permissions.get.js` | `owners-permissions` | `find` | superadmin | `id` | — | `ownerPermissions.find` |
| 21 | `owners-permissions.put.js` | `owners-permissions` | `update` | superadmin | `id`, `permissions` | **superadmin**: `assertOwnerRolePermissions` (400) | `updateAccountPermissionsSchema` |
| 22 | `employees.get.js` | `employees` | `find` | owner | `id`, `avatar`, `firstName`, `lastName`, `phone`, `position`, `color`, `createdAt`, `updatedAt`, `user`, `search` | — | pin `{organization: profile.organization}` |
| 23 | `employees.post.js` | `employees` | `create` | owner | `firstName`, `lastName`, `email`, `password`, `phone`, `position`, `color` | — | organización = la de la sesión |
| 24 | `employees.put.js` | `employees` | `update` | owner | `id`, `firstName`, `lastName`, `phone`, `position`, `color` | **owner**: `assertOrganizationEmployee` (404) | `updateEmployeeSchema` |
| 25 | `employees-disable.put.js` | `employees-disable` | `update` | owner | `id`, `disabled` | **owner**: `assertOrganizationEmployee` (404) | `disableAccountSchema` |
| 26 | `employees-permissions.get.js` | `employees-permissions` | `find` | owner | `id` | **owner**: `assertOrganizationEmployee` (404) | `employeePermissions.find` |
| 27 | `employees-permissions.put.js` | `employees-permissions` | `update` | owner | `id`, `permissions` | **owner**: `assertOrganizationEmployee` (404), `assertEmployeeRolePermissions` (400) | `updateAccountPermissionsSchema` |
| 28 | `clients.get.js` | `clients` | `find` | owner, employee | `id`, `name`, `phone`, `email`, `debt`, `createdAt`, `updatedAt`, `search` | — | pin `{organization: profile.organization, archivedAt: null}` |
| 29 | `clients.post.js` | `clients` | `create` | owner, employee | `name`, `phone`, `email` | — | organización = la de la sesión |
| 30 | `clients.put.js` | `clients` | `update` | owner, employee | `id`, `name`, `phone`, `email` | **owner, employee**: `assertOrganizationClient` (404) | `updateClientSchema` |
| 31 | `clients.delete.js` | `clients` | `remove` | owner | `id` | **owner**: `assertOrganizationClient` (404) | archiva (`archivedAt`), no borra |
| 32 | `clients-count.get.js` | `clients-count` | `find` | owner, employee | `search` | — | pin `{organization, archivedAt: null}` |
| 33 | `clients-patients.get.js` | `clients-patients` | `find` | owner, employee | `id`, `client`, `name`, `species`, `breed`, `sex`, `birthDate`, `createdAt`, `updatedAt`, `search` | — | pin `{organization, archivedAt: null}`; filtro `client` |
| 34 | `clients-patients.post.js` | `clients-patients` | `create` | owner, employee | `client`, `name`, `species`, `breed`, `sex`, `birthDate` | **owner, employee**: `assertOrganizationClient` (404) | organización = la de la sesión |
| 35 | `clients-patients.put.js` | `clients-patients` | `update` | owner, employee | `id`, `name`, `species`, `breed`, `sex`, `birthDate` | **owner, employee**: `assertOrganizationPatient` (404) | `updatePatientSchema` |
| 36 | `clients-patients.delete.js` | `clients-patients` | `remove` | owner | `id` | **owner**: `assertOrganizationPatient` (404) | archiva (`archivedAt`), no borra |
