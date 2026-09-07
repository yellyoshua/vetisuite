import { Input, Field, Card } from "client";

/** Control de texto base: borde `line`, radio 10, fondo `input`, 14px. */
export function Variantes() {
  return (
    <Card className="p-5" style={{ maxWidth: 460 }}>
      <Field label="Con valor">
        <Input defaultValue="Vacuna Antirrábica" />
      </Field>
      <Field label="Vacío con placeholder">
        <Input placeholder="Busca un producto…" />
      </Field>
      <Field label="Deshabilitado">
        <Input defaultValue="No editable" disabled />
      </Field>
    </Card>
  );
}

/** Tipos nativos: el mismo control cambia de `type`, no de componente. */
export function Tipos() {
  return (
    <Card className="p-5" style={{ maxWidth: 460 }}>
      <Field label="Número con mínimo">
        <Input type="number" min={0} defaultValue={5} />
      </Field>
      <Field label="Precio">
        <Input type="number" min={0} step="0.01" defaultValue={18.5} />
      </Field>
      <Field label="Hora">
        <Input type="time" defaultValue="09:00" style={{ width: 118 }} />
      </Field>
      <Field label="URL del portal">
        <Input type="url" defaultValue="https://clinica-a.vetisuite.com" />
      </Field>
    </Card>
  );
}

/** `style` propio se fusiona sobre el base: ancho y densidad puntuales. */
export function AnchoPropio() {
  return (
    <Card className="p-5" style={{ maxWidth: 460 }}>
      <div className="flex items-center gap-2 flex-wrap">
        <Input placeholder="Buscar cliente…" style={{ flex: 1, minWidth: 160 }} />
        <Input defaultValue="8" style={{ width: 70, padding: "6px 9px", fontSize: 12 }} />
      </div>
    </Card>
  );
}
