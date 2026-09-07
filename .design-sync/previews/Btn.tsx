import { Btn } from "client";
import { Plus, Eye, Pencil, Trash2, Check } from "lucide-react";

/** Los cinco `kind` del sistema. `primary` es la acción principal de la pantalla. */
export function Variantes() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Btn kind="primary"><Plus size={14} /> Nuevo cliente</Btn>
      <Btn kind="dark"><Check size={14} /> Cobrar cuenta</Btn>
      <Btn kind="ghost">Cancelar</Btn>
      <Btn kind="danger"><Trash2 size={13} /> Eliminar portal</Btn>
      <Btn kind="amber">Marcar pendiente</Btn>
    </div>
  );
}

/** `small` es el tamaño de las acciones por fila en los listados. */
export function AccionesDeFila() {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Btn small kind="ghost"><Eye size={13} /> Ver</Btn>
      <Btn small kind="ghost"><Pencil size={13} /> Editar</Btn>
      <Btn small kind="primary">Agendar cita</Btn>
    </div>
  );
}

/** Deshabilitado: 50% de opacidad y cursor bloqueado. */
export function Deshabilitado() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Btn disabled>Crear visita</Btn>
      <Btn kind="ghost" disabled>Anterior</Btn>
      <Btn small kind="dark" disabled>Cobrar</Btn>
    </div>
  );
}

/** `full` ocupa el ancho del contenedor — pie de formularios en móvil y modales. */
export function AnchoCompleto() {
  return (
    <div style={{ maxWidth: 320 }}>
      <Btn full>Guardar cambios</Btn>
    </div>
  );
}
