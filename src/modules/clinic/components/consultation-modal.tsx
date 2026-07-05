import { useState } from "react";
import { CONSULT_FEE, inputStyle, money, T } from "../../../lib/constants";
import { useVetStore } from "../../../states/app.state";
import { Btn, Field, Modal } from "../../../components/ui";

export function ConsultationModal({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const s = useVetStore();
  const [form, setForm] = useState({ vetId: s.vets[0].id, weight: "", temp: "", hr: "", anamnesis: "", diagnosis: "" });
  return (
    <Modal title="Nueva consulta médica" onClose={onClose} width={520}>
      <Field label="Médico tratante">
        <select style={inputStyle} value={form.vetId} onChange={(e) => setForm({ ...form, vetId: e.target.value })}>
          {s.vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Peso"><input style={inputStyle} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="12.5 kg" /></Field>
        <Field label="Temperatura"><input style={inputStyle} value={form.temp} onChange={(e) => setForm({ ...form, temp: e.target.value })} placeholder="38.5 °C" /></Field>
        <Field label="Frec. cardíaca"><input style={inputStyle} value={form.hr} onChange={(e) => setForm({ ...form, hr: e.target.value })} placeholder="90 lpm" /></Field>
      </div>
      <Field label="Anamnesis (síntomas reportados)"><textarea style={{ ...inputStyle, minHeight: 64 }} value={form.anamnesis} onChange={(e) => setForm({ ...form, anamnesis: e.target.value })} placeholder="¿Qué reporta el dueño?" /></Field>
      <Field label="Diagnóstico presuntivo"><textarea style={{ ...inputStyle, minHeight: 64 }} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></Field>
      <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>Al guardar se cobra la consulta ({money(CONSULT_FEE)}) a la cuenta abierta del cliente.</p>
      <Btn full disabled={!form.anamnesis || !form.diagnosis} onClick={() => {
        s.createRecord({ patientId, vetId: form.vetId, vitals: { weight: form.weight, temp: form.temp, hr: form.hr }, anamnesis: form.anamnesis, diagnosis: form.diagnosis });
        onClose();
      }}>Guardar consulta</Btn>
    </Modal>
  );
}
