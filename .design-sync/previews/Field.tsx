import { Field, Card, Btn, Input, Select } from "client";
import { inputStyle } from "@/lib/constants";

/** Label uppercase 11.5/600 en `sub` sobre el control. Un `Field` por control. */
export function Formulario() {
  return (
    <Card className="p-5" style={{ maxWidth: 480 }}>
      <Field label="Nombre completo">
        <Input defaultValue="Ana Cevallos" />
      </Field>
      <Field label="Teléfono">
        <Input defaultValue="098 120 4455" />
      </Field>
      <Field label="Correo">
        <Input placeholder="correo@mail.com" />
      </Field>
      <div className="flex justify-end gap-2 mt-2">
        <Btn kind="ghost">Cancelar</Btn>
        <Btn>Crear cliente</Btn>
      </div>
    </Card>
  );
}

/** `Field` envuelve cualquier control: `Select` y el `textarea` crudo, que
    comparte `inputStyle` pero no tiene componente propio. */
export function OtrosControles() {
  return (
    <Card className="p-5" style={{ maxWidth: 480 }}>
      <Field label="Categoría">
        <Select defaultValue="Vacunas">
          <option>Vacunas</option>
          <option>Medicamentos</option>
          <option>Estética</option>
        </Select>
      </Field>
      <Field label="Anamnesis">
        <textarea style={{ ...inputStyle, minHeight: 76 }} defaultValue="Decaimiento desde ayer, sin apetito. Sin vómito." />
      </Field>
    </Card>
  );
}

/** En dos columnas: el `Field` no impone ancho, lo pone la rejilla. */
export function EnRejilla() {
  return (
    <Card className="p-5" style={{ maxWidth: 520 }}>
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="Stock mínimo">
          <Input defaultValue="5" />
        </Field>
        <Field label="Precio">
          <Input defaultValue="18.50" />
        </Field>
      </div>
    </Card>
  );
}
