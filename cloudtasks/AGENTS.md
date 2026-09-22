# AGENTS.md — `cloudtasks/`

Reglas de los handlers SQS → Lambda (`cloudtasks/`). Complementa `/AGENTS.md`, que tiene las reglas
de todo el monorepo: leé ambos.

## Nombres

### Archivos

| Tipo | Patrón |
|---|---|
| Mail (cloudtasks) | `<nombre>.mail.ts` + `templates/<nombre>.template.tsx` |

## Cloud tasks (pub/sub)

Eventos de dominio por SQS → Lambda. En local la cola vive en floci y los handlers los corre un
único consumidor **declarativo**: cada handler se ata a su cola en una línea, sin barrido de
carpetas. Si el handler lanza, el mensaje no se borra y SQS lo reentrega.

> Ver `server/AGENTS.md` § Cloud tasks (pub/sub).

Los payloads son planos, cada task carga su propio `.env` y bundlea su propio `dist`, y las de
correo llevan su copia del cliente de mail y de sus templates: **no comparten código con el
server**. Tareas críticas como `email-account-manager` sí importan `@vetisuite/database` (conexión + schemas):
escriben `account_tokens`, y un nombre de columna copiado a mano se desincroniza sin avisar. Sus `.env`
se cargan en un `env.ts` que se importa primero, porque `@vetisuite/database/db.js` elige driver al importarse.
El nombre de la cola y la forma del mensaje tienen que coincidir con lo desplegado, y **el
desajuste no avisa**: un nombre mal armado se pierde en el catch del publish y un payload incompleto
revienta dentro de la Lambda. Agregar un evento es agregar una key. Detalle en `cloudtasks/README.md`.

## Alias

`cloudtasks/` no tiene alias.
