import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import { isActiveRecord, T } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import { Btn, Card, Field, Input } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { ResourceNotFound } from "@/components/resource-not-found";
import { NoActiveConsultation } from "./components/no-active-consultation";

export default function PrescriptionNewPage() {
  const { patientId } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ med: "", dosage: "" });
  const patient = s.patients.find((p) => p.id === patientId);
  if (!patient) return <ResourceNotFound backTo="/clinic" label="el paciente" />;
  const activeRecord = s.records.filter((r) => r.patientId === patient.id).find(isActiveRecord);
  const backTo = `/clinic/show/${patient.id}`;
  if (!activeRecord) return <NoActiveConsultation backTo={backTo} patientId={patient.id} patientName={patient.name} />;
  return (
    <CustomPage goBack backTo={backTo} title="Receta digital" description={`Paciente: ${patient.name} · Se adjunta a la consulta activa del expediente.`}>
      <Card className="p-5">
        <Field label="Medicamento"><Input value={form.med} onChange={(e) => setForm({ ...form, med: e.target.value })} placeholder="Ej: Amoxicilina 250 mg" /></Field>
        <Field label="Posología"><Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="1 tableta cada 12 h por 7 días" /></Field>
        <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>La receta se guarda en la consulta activa del expediente del paciente.</p>
        <div className="flex justify-end gap-2">
          <Btn kind="ghost" onClick={() => navigate(backTo)}>Cancelar</Btn>
          <Btn disabled={!form.med || !form.dosage} onClick={() => { s.addPrescription(activeRecord.id, patient.id, form.med, form.dosage); navigate(backTo); }}>
            <Save size={14} /> Guardar receta
          </Btn>
        </div>
      </Card>
    </CustomPage>
  );
}
