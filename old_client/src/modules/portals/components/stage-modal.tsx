import { useState } from "react";
import { Btn, Field, Input, Modal } from "@/components/ui";
import { slugify } from "@/lib/constants";

interface StageModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; title: string; description?: string }) => void;
}

export function StageModal({ onClose, onSubmit }: StageModalProps) {
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameTouched, setNameTouched] = useState(false);

  return (
    <Modal title="Nueva etapa del portal" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Título de la etapa">
          <Input
            value={title}
            placeholder="Ej: Información de vacunación previa"
            onChange={(e) => {
              setTitle(e.target.value);
              if (!nameTouched) setName(slugify(e.target.value).replace(/-/g, "_"));
            }}
          />
        </Field>

        <Field label="Identificador interno (snake_case)">
          <Input
            value={name}
            placeholder="info_vacunacion"
            onChange={(e) => {
              setNameTouched(true);
              setName(slugify(e.target.value).replace(/-/g, "_"));
            }}
          />
        </Field>

        <Field label="Descripción o ayuda (opcional)">
          <Input
            value={description}
            placeholder="Instrucciones para quien complete esta etapa"
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-3">
          <Btn kind="ghost" onClick={onClose}>
            Cancelar
          </Btn>
          <Btn
            disabled={!title.trim() || !name.trim()}
            onClick={() => {
              onSubmit({
                name: name.trim(),
                title: title.trim(),
                description: description.trim() || undefined,
              });
            }}
          >
            Crear etapa
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
