import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { inputStyle, T } from "../../lib/constants";
import { useVetStore } from "../../states/app.state";
import { Btn, Card, Field } from "../../components/ui";
import { PageHeader } from "../../components/page-header";
import { ResourceNotFound } from "../../components/resource-not-found";

export default function PrescriptionNewPage() {
  const { patientId } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ med: "", dosage: "" });
  const patient = s.patients.find((p) => p.id === patientId);
  if (!patient) return <ResourceNotFound backTo="/clinic" label="el paciente" />;
  const latestRecord = s.records.filter((r) => r.patientId === patient.id)[0];
  const backTo = `/clinic/show/${patient.id}`;
  if (!latestRecord) return <ResourceNotFound backTo={backTo} label={`una consulta activa para ${patient.name}: abre primero una consulta`} />;
  return (
    <div>
      <PageHeader backTo={backTo} title="Receta digital" sub={`Paciente: ${patient.name} · Se adjunta a la consulta activa del expediente.`} />
      <Card className="p-5" style={{ maxWidth: 520 }}>
        <Field label="Medicamento"><input style={inputStyle} value={form.med} onChange={(e) => setForm({ ...form, med: e.target.value })} placeholder="Ej: Amoxicilina 250 mg" /></Field>
        <Field label="Posología"><input style={inputStyle} value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="1 tableta cada 12 h por 7 días" /></Field>
        <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>La receta se valida con firma electrónica del veterinario y se envía por correo y WhatsApp.</p>
        <div className="flex justify-end gap-2">
          <Btn kind="ghost" onClick={() => navigate(backTo)}>Cancelar</Btn>
          <Btn kind="wa" disabled={!form.med || !form.dosage} onClick={() => { s.addPrescription(latestRecord.id, patient.id, form.med, form.dosage); navigate(backTo); }}>
            <Send size={14} /> Firmar y enviar
          </Btn>
        </div>
      </Card>
    </div>
  );
}
