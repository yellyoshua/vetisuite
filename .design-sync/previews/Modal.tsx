import { Modal, Btn, Field, Input } from "client";

/* Los modales usan `position: fixed`; el contenedor de la tarjeta es su bloque
   contenedor, así que la preview le da alto explícito para que quepan enteros. */
const stage = { minHeight: 560 } as const;

/** Modal estándar: cabecera pegajosa con título y cierre, cuerpo con padding 20. */
export function Confirmacion() {
  return (
    <div style={stage}><Modal title="Cobrar cuenta" onClose={() => {}}>
      <p style={{ fontSize: 13, color: "var(--color-ink)" }}>
        Se emitirá la factura de <strong>Jorge Paredes</strong> por $182.40 (IVA incluido) y la visita quedará cerrada.
      </p>
      <div className="flex justify-end gap-2 mt-4">
        <Btn kind="ghost" onClick={() => {}}>Cancelar</Btn>
        <Btn onClick={() => {}}>Emitir factura</Btn>
      </div>
    </Modal></div>
  );
}

/** Con formulario dentro: `Field` + `Input`, botones al pie. */
export function ConFormulario() {
  return (
    <div style={stage}><Modal title="Nueva mascota" onClose={() => {}} width={520}>
      <Field label="Nombre">
        <Input defaultValue="Nala" />
      </Field>
      <Field label="Raza">
        <Input defaultValue="Poodle" />
      </Field>
      <div className="flex justify-end gap-2 mt-2">
        <Btn kind="ghost" onClick={() => {}}>Cancelar</Btn>
        <Btn onClick={() => {}}>Guardar</Btn>
      </div>
    </Modal></div>
  );
}

/** Borrar es SIEMPRE un modal, nunca una ruta: la acción principal usa
    `kind="danger"` y el texto nombra el recurso. */
export function Destructivo() {
  return (
    <div style={stage}><Modal title="Eliminar portal" onClose={() => {}} width={420}>
      <p style={{ fontSize: 13, color: "var(--color-ink)" }}>
        El portal <strong>Campaña de vacunación</strong> dejará de estar disponible. Esta acción no se puede deshacer.
      </p>
      <div className="flex justify-end gap-2 mt-4">
        <Btn kind="ghost" onClick={() => {}}>Cancelar</Btn>
        <Btn kind="danger" onClick={() => {}}>Eliminar</Btn>
      </div>
    </Modal></div>
  );
}
