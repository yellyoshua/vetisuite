import { useState } from "react";
import { DEFAULT_PALETTE, CLINIC_DOMAIN, PALETTE_FIELDS, inputStyle, slugify, T } from "@/lib/constants";
import type { Portal } from "@/lib/types";
import { Btn, Card, Field, Input } from "@/components/ui";
import { PortalLogo } from "./portal-logo";

type PortalFormData = Omit<Portal, "id">;

/* Shared by the new and edit screens. The slug is derived from the name
   while it hasn't been touched by hand — no effect, the name handler does it
   (sync setState in effects is banned, see client/AGENTS.md §3). */
interface PortalFormProps {
  initial?: PortalFormData;
  submitLabel: string;
  /** Slugs ya en uso por otros portales: valida en línea antes de enviar. */
  takenSlugs?: string[];
  onSubmit: (data: PortalFormData) => void;
  onCancel: () => void;
}

export function PortalForm({ initial, submitLabel, takenSlugs = [], onSubmit, onCancel }: PortalFormProps) {
  const [form, setForm] = useState<PortalFormData>(
    initial || { name: "", slug: "", palette: { ...DEFAULT_PALETTE }, markdown: "", logoUrl: "" }
  );
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const slugTaken = !!form.slug && takenSlugs.includes(form.slug);
  return (
    <Card className="p-5">
      <Field label="Nombre">
        <Input value={form.name} placeholder="Ej: Portal de la clínica"
          onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugTouched ? form.slug : slugify(e.target.value) })} />
      </Field>
      <Field label="Slug">
        <Input value={form.slug} placeholder="portal-de-la-clinica"
          onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: slugify(e.target.value) }); }} />
      </Field>
      {slugTaken && (
        <p style={{ fontSize: 12, color: T.red, margin: "-6px 2px 4px", fontWeight: 600 }}>
          El slug “{form.slug}” ya está en uso por otro portal.
        </p>
      )}
      <p style={{ fontSize: 12, color: T.sub, margin: "-6px 2px 14px" }}>
        Dirección reservada: <b style={{ color: T.ink }}>{CLINIC_DOMAIN}/p/{form.slug || "…"}</b>.
        Las páginas públicas todavía no se sirven; aquí solo se administra su contenido.
      </p>

      <Field label="Logo (URL)">
        <Input type="url" value={form.logoUrl} placeholder="https://…/logo.png"
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
      </Field>
      <div className="mb-3"><PortalLogo url={form.logoUrl} size={64} alt="Logo del portal" /></div>

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
        <Btn disabled={!form.name || !form.slug || slugTaken} onClick={() => onSubmit(form)}>{submitLabel}</Btn>
      </div>
    </Card>
  );
}
