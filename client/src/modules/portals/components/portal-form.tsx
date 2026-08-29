import { useState } from "react";
import { DEFAULT_PALETTE, CLINIC_DOMAIN, inputStyle, slugify, T } from "@/lib/constants";
import type { Portal } from "@/lib/types";
import { Btn, Card, Field } from "@/components/ui";

type PortalFormData = Omit<Portal, "id">;

/* Shared by the new and edit screens. The slug is derived from the name
   while it hasn't been touched by hand — no effect, the name handler does it
   (sync setState in effects is banned, see client/AGENTS.md §3). */
interface PortalFormProps {
  initial?: PortalFormData;
  submitLabel: string;
  onSubmit: (data: PortalFormData) => void;
  onCancel: () => void;
}

const PALETTE_FIELDS = [
  { key: "primary", label: "Color principal" },
  { key: "accent", label: "Color de acento" },
  { key: "bg", label: "Fondo" },
] as const;

export function PortalForm({ initial, submitLabel, onSubmit, onCancel }: PortalFormProps) {
  const [form, setForm] = useState<PortalFormData>(
    initial || { name: "", slug: "", palette: { ...DEFAULT_PALETTE }, markdown: "", logoUrl: "" }
  );
  const [slugTouched, setSlugTouched] = useState(!!initial);
  return (
    <Card className="p-5">
      <Field label="Nombre">
        <input style={inputStyle} value={form.name} placeholder="Ej: Portal de la clínica"
          onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugTouched ? form.slug : slugify(e.target.value) })} />
      </Field>
      <Field label="Slug">
        <input style={inputStyle} value={form.slug} placeholder="portal-de-la-clinica"
          onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: slugify(e.target.value) }); }} />
      </Field>
      <p style={{ fontSize: 12, color: T.sub, margin: "-6px 2px 14px" }}>
        Se publicará en <b style={{ color: T.ink }}>{CLINIC_DOMAIN}/p/{form.slug || "…"}</b>
      </p>

      <Field label="Logo (URL)">
        <input type="url" style={inputStyle} value={form.logoUrl} placeholder="https://…/logo.png"
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
      </Field>
      {form.logoUrl && (
        <img src={form.logoUrl} alt="Logo del portal" className="mb-3"
          style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 12, border: `1px solid ${T.line}`, background: T.input }} />
      )}

      <div className="grid grid-cols-3 gap-3">
        {PALETTE_FIELDS.map((c) => (
          <Field key={c.key} label={c.label}>
            <div className="flex items-center gap-2" style={{ ...inputStyle, padding: "6px 8px" }}>
              <input type="color" value={form.palette[c.key]} aria-label={c.label}
                onChange={(e) => setForm({ ...form, palette: { ...form.palette, [c.key]: e.target.value } })}
                style={{ width: 28, height: 28, border: "none", background: "transparent", padding: 0, cursor: "pointer" }} />
              <span style={{ fontSize: 12.5, color: T.sub, fontVariantNumeric: "tabular-nums" }}>{form.palette[c.key].toUpperCase()}</span>
            </div>
          </Field>
        ))}
      </div>

      <Field label="Contenido (Markdown)">
        <textarea style={{ ...inputStyle, minHeight: 180, resize: "vertical", fontFamily: "ui-monospace, monospace", fontSize: 13, lineHeight: 1.6 }}
          value={form.markdown} placeholder={"# Título\n\nTexto de bienvenida en **Markdown**."}
          onChange={(e) => setForm({ ...form, markdown: e.target.value })} />
      </Field>

      <div className="flex justify-end gap-2 mt-1">
        <Btn kind="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn disabled={!form.name || !form.slug} onClick={() => onSubmit(form)}>{submitLabel}</Btn>
      </div>
    </Card>
  );
}
