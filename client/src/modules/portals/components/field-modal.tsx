import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Btn, Field, Input, Modal, Select } from "@/components/ui";
import { slugify, T } from "@/lib/constants";
import type { FieldType, OptionsSource, PortalField } from "@/lib/types";

interface FieldModalProps {
  onClose: () => void;
  onSubmit: (
    data: Omit<PortalField, "id" | "portalId" | "stageId" | "position" | "deletedAt">,
    staticOptions?: { value: string; label: string }[],
  ) => void;
}

export function FieldModal({ onClose, onSubmit }: FieldModalProps) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<FieldType>("text");
  const [required, setRequired] = useState(false);
  const [helpText, setHelpText] = useState("");
  const [placeholder, setPlaceholder] = useState("");

  const [options, setOptions] = useState<{ value: string; label: string }[]>([
    { value: "opcion_1", label: "Opción 1" },
  ]);

  const handleAddOption = () => {
    const nextIdx = options.length + 1;
    setOptions([...options, { value: `opcion_${nextIdx}`, label: `Opción ${nextIdx}` }]);
  };

  const handleUpdateOption = (index: number, val: string) => {
    setOptions(
      options.map((opt, i) =>
        i === index
          ? { label: val, value: slugify(val).replace(/-/g, "_") || `opt_${i + 1}` }
          : opt,
      ),
    );
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <Modal title="Nuevo campo personalizado" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Etiqueta visible">
          <Input
            value={label}
            placeholder="Ej: ¿Tiene carnet de vacunas al día?"
            onChange={(e) => setLabel(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Tipo de campo">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as FieldType)}
            >
              <option value="text">Texto corto</option>
              <option value="textarea">Texto multilínea</option>
              <option value="number">Numérico</option>
              <option value="email">Correo electrónico</option>
              <option value="phone">Teléfono</option>
              <option value="date">Fecha</option>
              <option value="select">Selección desplegable</option>
              <option value="checkbox">Casilla sí/no</option>
            </Select>
          </Field>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="field-required-toggle"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <label
              htmlFor="field-required-toggle"
              style={{ fontSize: 13, fontWeight: 500, color: T.ink, cursor: "pointer" }}
            >
              Respuesta obligatoria
            </label>
          </div>
        </div>

        <Field label="Texto de ayuda o instrucción (opcional)">
          <Input
            value={helpText}
            placeholder="Explicación que aparecerá debajo del campo"
            onChange={(e) => setHelpText(e.target.value)}
          />
        </Field>

        <Field label="Placeholder (opcional)">
          <Input
            value={placeholder}
            placeholder="Texto de ejemplo visible en el campo"
            onChange={(e) => setPlaceholder(e.target.value)}
          />
        </Field>

        {type === "select" && (
          <div className="p-3.5 rounded-xl border bg-slate-50" style={{ borderColor: T.line }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 12, fontWeight: 700, color: T.ink, textTransform: "uppercase" }}>
                Opciones de selección
              </span>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs font-semibold text-green-700 hover:underline inline-flex items-center gap-1"
              >
                <Plus size={12} /> Agregar opción
              </button>
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={opt.label}
                    placeholder={`Opción ${idx + 1}`}
                    onChange={(e) => handleUpdateOption(idx, e.target.value)}
                  />
                  {options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3">
          <Btn kind="ghost" onClick={onClose}>
            Cancelar
          </Btn>
          <Btn
            disabled={!label.trim()}
            onClick={() => {
              const optionsSource: OptionsSource | undefined = type === "select" ? "static" : undefined;
              const internalName = slugify(label).replace(/-/g, "_") || `campo_${Date.now()}`;
              onSubmit(
                {
                  name: internalName,
                  label: label.trim(),
                  type,
                  binding: null,
                  required,
                  active: true,
                  helpText: helpText.trim() || undefined,
                  placeholder: placeholder.trim() || undefined,
                  optionsSource,
                },
                type === "select" ? options : undefined,
              );
            }}
          >
            Guardar campo
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
