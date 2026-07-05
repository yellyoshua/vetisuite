import { useState } from "react";
import { inputStyle, T } from "../../../lib/constants";
import { useVetStore } from "../../../states/app.state";
import { Btn, Field, Modal } from "../../../components/ui";

export function NewPatientModal({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const addPatient = useVetStore((s) => s.addPatient);
  const [form, setForm] = useState({ name: "", species: "Perro", breed: "", age: "", allergiesText: "", aggressive: false });
  return (
    <Modal title="Nueva mascota" onClose={onClose}>
      <Field label="Nombre"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Toby" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Especie">
          <select style={inputStyle} value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}>
            {["Perro", "Gato", "Ave", "Otro"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Edad"><input style={inputStyle} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="3 años" /></Field>
      </div>
      <Field label="Raza"><input style={inputStyle} value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="Ej: Labrador" /></Field>
      <Field label="Alergias (separadas por coma)"><input style={inputStyle} value={form.allergiesText} onChange={(e) => setForm({ ...form, allergiesText: e.target.value })} placeholder="Penicilina, …" /></Field>
      <label className="flex items-center gap-2 mb-4" style={{ fontSize: 13, color: T.ink }}>
        <input type="checkbox" checked={form.aggressive} onChange={(e) => setForm({ ...form, aggressive: e.target.checked })} />
        Marcar como paciente agresivo (alerta visual para el equipo)
      </label>
      <Btn full disabled={!form.name} onClick={() => {
        addPatient({ clientId, name: form.name, species: form.species, breed: form.breed, age: form.age, aggressive: form.aggressive, allergies: form.allergiesText.split(",").map((x) => x.trim()).filter(Boolean) });
        onClose();
      }}>Registrar paciente</Btn>
    </Modal>
  );
}
