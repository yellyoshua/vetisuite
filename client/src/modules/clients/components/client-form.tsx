import { useState } from "react";

import type { Client } from "@/lib/types";
import { Btn, Card, Field, Input } from "@/components/ui";

type ClientFormData = Pick<Client, "name" | "phone" | "email">;

/* Shared by the new and edit screens — same form, same layout. */
interface ClientFormProps {
  initial?: ClientFormData;
  submitLabel: string;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
}

export function ClientForm({ initial, submitLabel, onSubmit, onCancel }: ClientFormProps) {
  const [form, setForm] = useState<ClientFormData>(initial || { name: "", phone: "", email: "" });
  return (
    <Card className="p-5">
      <Field label="Nombre completo"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Ana Cevallos" /></Field>
      <Field label="Teléfono"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="099 000 0000" /></Field>
      <Field label="Correo"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@mail.com" /></Field>
      <div className="flex justify-end gap-2 mt-1">
        <Btn kind="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn disabled={!form.name || !form.phone} onClick={() => onSubmit(form)}>{submitLabel}</Btn>
      </div>
    </Card>
  );
}
