import { useState } from "react";
import { inputStyle } from "../../../lib/constants";
import { useVetStore } from "../../../states/app.state";
import { Btn, Field, Modal } from "../../../components/ui";

export function NewClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (clientId: string) => void }) {
  const addClient = useVetStore((s) => s.addClient);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  return (
    <Modal title="Nuevo cliente" onClose={onClose}>
      <Field label="Nombre completo"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Ana Cevallos" /></Field>
      <Field label="Teléfono (WhatsApp)"><input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="099 000 0000" /></Field>
      <Field label="Correo"><input style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@mail.com" /></Field>
      <Btn full disabled={!form.name || !form.phone} onClick={() => onCreated(addClient(form))}>Crear cliente</Btn>
    </Modal>
  );
}
