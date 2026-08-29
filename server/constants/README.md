# `constants/` — valores compartidos

Constantes en `UPPER_SNAKE_CASE`.

## La regla

**Solo entra lo que se usa en 3 o más sitios.** Con menos, la constante vive en
el archivo que la usa: moverla aquí antes de tiempo solo añade un import y
esconde dónde importa el valor.

**Las variables de entorno no van aquí.** Se leen de `process.env` donde se
necesitan (`DATABASE_URL` en `drizzle/db.ts`) — su valor cambia por despliegue, no
es una constante del código.

## Qué hay

| Constante | Dónde se usa |
|---|---|
| `HTTP_STATUS` | `core/http.ts` (errores y 500), `routes/clients/index.post.ts` (201) y toda ruta que fije un status |
| `DEFAULT_PAGE_SIZE` / `MAX_PAGE_SIZE` | `core/http.ts` (`readPagination`), listados de cada módulo |

## Cómo crecer

Mientras quepa en `index.ts`, se queda ahí. Cuando un grupo pase de ~15 líneas,
sácalo a su propio archivo (`constants/billing.ts`) y reexpórtalo desde
`index.ts` para que el import siga siendo `from "../constants"`.

Un valor que solo tiene sentido dentro de un módulo (los precios de peluquería,
por ejemplo) pertenece a ese módulo, no aquí — aunque se use tres veces **dentro**
de él. Esta carpeta es para lo que cruza fronteras de módulo.
