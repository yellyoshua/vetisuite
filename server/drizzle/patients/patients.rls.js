/**
 * Políticas RLS de `patients`. Pareja de `patients.table.js`.
 *
 * Vacío a propósito: todavía no hay tenant ni roles en el proyecto.
 *
 * Misma forma que `clients.rls.js` (un export con nombre por política; un array
 * drizzle-kit lo ignora). Un paciente hereda el aislamiento de su dueño: la
 * política se escribe sobre `client_id`, sin duplicar el tenant en esta tabla.
 */
