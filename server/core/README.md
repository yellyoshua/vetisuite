# `core/` — capas por las que pasa toda petición

Infraestructura transversal. Si algo lo necesita **más de un módulo**, vive aquí;
si solo lo necesita uno, vive dentro de ese módulo.

`core/` no conoce ningún módulo. La dependencia va en un solo sentido:

```
routes/  →  modules/  →  core/
               └──────→  drizzle/   (db.ts + tablas, desde los repository.ts)
```

Un import de `core/` hacia `modules/` es un bug de arquitectura: significa que
esa lógica no era transversal.

La persistencia **no** vive aquí: la conexión y la instancia de drizzle están en
`drizzle/db.ts`, junto al esquema que tipa. `core/` es lo transversal que no es
la base.

## Qué hay

| Archivo | Capa | Responsabilidad |
|---|---|---|
| `http.ts` | Entrada/salida | `defineApiHandler` (envoltorio de toda ruta), `ApiError` y helpers de paginación. |

### `http.ts`

`defineApiHandler` es la capa por la que pasa toda petición:

```ts
export default defineApiHandler(async (event) => {
  const { page, pageSize, offset } = readPagination(event)
  return listClients({ limit: pageSize, offset })
})
```

- `ApiError` (y sus atajos `notFound` / `badRequest`) sale al cliente **con su
  status y su mensaje** — son errores esperados del dominio, escritos en español
  porque el client los muestra tal cual.
- Cualquier otro error es `500 "Error interno"` y el detalle solo va al log.
  Nunca se filtra un stack ni un mensaje de Postgres en la respuesta.
- `readPagination` acota `?page` y `?pageSize` contra `MAX_PAGE_SIZE`, así que
  ninguna ruta puede pedir la tabla entera.

## Cuándo añadir un archivo aquí

Cuando aparezca una capa que **toda** petición atraviesa: autenticación,
tenant/clínica activa, auditoría, rate limit. Una capa que necesita correr antes
del handler (CORS, cabeceras) va en `middleware/` de Nitro, no aquí — `core/`
guarda la implementación, `middleware/` solo la conecta.

Nada que sea específico de la base: eso es `drizzle/`.

No crees archivos que nadie importa: una capa sin ruta que la use es peso muerto.
