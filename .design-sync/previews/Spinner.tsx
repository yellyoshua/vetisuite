import { Spinner, Btn } from "client";

/** Tamaño por defecto (14) y tamaños puntuales. Anillo `line` con tope `green`. */
export function Tamanos() {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
      <Spinner size={18} />
      <Spinner size={24} />
    </div>
  );
}

/** En línea con texto: es el patrón del dropdown de búsqueda. */
export function EnLinea() {
  return (
    <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: "var(--color-sub)" }}>
      <Spinner /> Consultando clientes…
    </div>
  );
}

/** Dentro de un botón mientras la acción está en curso. */
export function EnBoton() {
  return (
    <Btn disabled><Spinner size={13} /> Guardando…</Btn>
  );
}
