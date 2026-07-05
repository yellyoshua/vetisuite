import { useState } from "react";
import { Send } from "lucide-react";
import { inputStyle, T } from "../../../lib/constants";
import type { MedicalRecord } from "../../../lib/types";
import { useVetStore } from "../../../states/app.state";
import { Btn, Field, Modal } from "../../../components/ui";

export function PrescriptionModal({ record, onClose }: { record: MedicalRecord; onClose: () => void }) {
  const addPrescription = useVetStore((s) => s.addPrescription);
  const [form, setForm] = useState({ med: "", dosage: "" });
  return (
    <Modal title="Receta digital" onClose={onClose}>
      <Field label="Medicamento"><input style={inputStyle} value={form.med} onChange={(e) => setForm({ ...form, med: e.target.value })} placeholder="Ej: Amoxicilina 250 mg" /></Field>
      <Field label="Posología"><input style={inputStyle} value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="1 tableta cada 12 h por 7 días" /></Field>
      <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>La receta se valida con firma electrónica del veterinario y se envía por correo y WhatsApp.</p>
      <Btn full kind="wa" disabled={!form.med || !form.dosage} onClick={() => { addPrescription(record.id, record.patientId, form.med, form.dosage); onClose(); }}>
        <Send size={14} /> Firmar y enviar
      </Btn>
    </Modal>
  );
}
