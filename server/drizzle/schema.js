/** Barrel del esquema: lo que consume `db.ts` para tipar `db.query.*`.
    drizzle-kit no lo usa (lee los globs de drizzle.config.ts); el cliente sí:
    un solo import en vez de uno por tabla.

    **Solo tablas.** Los `.rls.js` llegan a drizzle-kit por su propio glob; si se
    reexportaran aquí, las políticas entrarían en el objeto `schema` que recibe
    `drizzle()` y acabarían en el constructor de queries relacionales. */
export * from "./clients/clients.table.js";
export * from "./patients/patients.table.js";
