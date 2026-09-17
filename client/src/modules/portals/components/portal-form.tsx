import { useState } from "react";
import { DEFAULT_PALETTE, CLINIC_DOMAIN, PALETTE_FIELDS, inputStyle, slugify, T } from "@/lib/constants";
import type { Portal, PortalStatus } from "@/lib/types";
import { Btn, Card, Field, Input, Select } from "@/components/ui";
import { PortalLogo } from "./portal-logo";

export type PortalFormData = Omit<Portal, "id" | "createdAt" | "updatedAt" | "archivedAt">;

interface PortalFormProps {
  initial?: PortalFormData;
  submitLabel: string;
  takenSlugs?: string[];
  hasSubmissions?: boolean;
  onSubmit: (data: PortalFormData) => void;
  onCancel: () => void;
}

export function PortalForm({
  initial,
  submitLabel,
  takenSlugs = [],
  onSubmit,
  onCancel,
}: PortalFormProps) {
  const [form, setForm] = useState<PortalFormData>(
    initial || {
      name: "",
      slug: "",
      purpose: "booking",
      campaignName: "",
      status: "draft",
      palette: { ...DEFAULT_PALETTE },
      markdown: "",
      logoUrl: "",
      vetPolicy: "clinic_assigns",
      defaultVetId: undefined,
      defaultReason: "",
      autoConfirm: false,
    },
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const slugTaken = Boolean(form.slug && takenSlugs.includes(form.slug));

  return (
    <Card className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nombre interno">
          <Input
            value={form.name}
            placeholder="Ej: Portal de la clínica"
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
                slug: slugTouched ? form.slug : slugify(e.target.value),
              })
            }
          />
        </Field>

        <Field label="Slug (dirección web)">
          <Input
            value={form.slug}
            placeholder="portal-de-la-clinica"
            onChange={(e) => {
              setSlugTouched(true);
              setForm({ ...form, slug: slugify(e.target.value) });
            }}
          />
        </Field>
      </div>

      {slugTaken && (
        <p style={{ fontSize: 12, color: T.red, margin: "-6px 2px 4px", fontWeight: 600 }}>
          El slug “{form.slug}” ya está en uso por otro portal.
        </p>
      )}
      <p style={{ fontSize: 12, color: T.sub, margin: "-6px 2px 14px" }}>
        Dirección pública: <b style={{ color: T.ink }}>{CLINIC_DOMAIN}/p/{form.slug || "…"}</b>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Field label="Nombre de campaña (opcional)">
          <Input
            value={form.campaignName || ""}
            placeholder="Ej: Vacunación 2026"
            onChange={(e) => setForm({ ...form, campaignName: e.target.value })}
          />
        </Field>

        <Field label="Estado de publicación">
          <Select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as PortalStatus })}
          >
            <option value="draft">Borrador (no visible)</option>
            <option value="published">Publicado (activo)</option>
            <option value="archived">Archivado</option>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Field label="Motivo predeterminado (opcional)">
          <Input
            value={form.defaultReason || ""}
            placeholder="Ej: Campaña de desparasitación"
            onChange={(e) => setForm({ ...form, defaultReason: e.target.value })}
          />
        </Field>

        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="portal-autoconfirm"
            checked={form.autoConfirm}
            onChange={(e) => setForm({ ...form, autoConfirm: e.target.checked })}
            style={{ width: 16, height: 16, cursor: "pointer", accentColor: form.palette.primary }}
          />
          <label htmlFor="portal-autoconfirm" style={{ fontSize: 13, fontWeight: 500, color: T.ink, cursor: "pointer" }}>
            Confirmación automática de reservas entrantes
          </label>
        </div>
      </div>

      <Field label="Logo (URL)">
        <Input
          type="url"
          value={form.logoUrl}
          placeholder="https://…/logo.png"
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
        />
      </Field>
      <div className="mb-3">
        <PortalLogo url={form.logoUrl} size={64} alt="Logo del portal" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        {PALETTE_FIELDS.map((c) => (
          <Field key={c.key} label={c.label}>
            <div className="flex items-center gap-2" style={{ ...inputStyle, padding: "6px 8px" }}>
              <input
                type="color"
                value={form.palette[c.key]}
                aria-label={c.label}
                onChange={(e) =>
                  setForm({
                    ...form,
                    palette: { ...form.palette, [c.key]: e.target.value },
                  })
                }
                style={{ width: 28, height: 28, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
              />
              <span style={{ fontSize: 12.5, color: T.sub, fontVariantNumeric: "tabular-nums" }}>
                {form.palette[c.key].toUpperCase()}
              </span>
            </div>
          </Field>
        ))}
      </div>

      <Field label="Contenido de portada (Markdown)">
        <textarea
          style={{
            ...inputStyle,
            minHeight: 140,
            resize: "vertical",
            fontFamily: "ui-monospace, monospace",
            fontSize: 13,
            lineHeight: 1.6,
          }}
          value={form.markdown}
          placeholder={"# Título de bienvenida\n\nDetalles del servicio o campaña en **Markdown**."}
          onChange={(e) => setForm({ ...form, markdown: e.target.value })}
        />
      </Field>

      <div className="flex justify-end gap-2 mt-4">
        <Btn kind="ghost" onClick={onCancel}>
          Cancelar
        </Btn>
        <Btn disabled={!form.name || !form.slug || slugTaken} onClick={() => onSubmit(form)}>
          {submitLabel}
        </Btn>
      </div>
    </Card>
  );
}
