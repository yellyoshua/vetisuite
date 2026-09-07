import { DateInput, Field, Card } from "client";

/** `Input` con `type="date"` fijado: fechas de caducidad, citas y excepciones. */
export function Basico() {
  return (
    <Card className="p-5" style={{ maxWidth: 460 }}>
      <Field label="Fecha de caducidad">
        <DateInput defaultValue="2026-11-01" />
      </Field>
      <Field label="Sin fecha">
        <DateInput />
      </Field>
    </Card>
  );
}

/** Ancho propio: en filas de excepciones no ocupa el ancho del formulario. */
export function EnFila() {
  return (
    <Card className="p-5" style={{ maxWidth: 460 }}>
      <div className="flex items-center gap-2 flex-wrap">
        <DateInput defaultValue="2026-12-25" style={{ width: 168 }} />
        <span style={{ fontSize: 12.5, color: "var(--color-sub)" }}>Navidad · cerrado todo el día</span>
      </div>
    </Card>
  );
}
