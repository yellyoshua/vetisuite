import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { inputStyle } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import { Btn, Card, Field, Input, Select } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { ResourceNotFound } from "@/components/resource-not-found";

export default function ConsultationNewPage() {
  const { patientId } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const patient = s.patients.find((p) => p.id === patientId);
  const [form, setForm] = useState({ vetId: s.vets[0].id, weight: "", temp: "", hr: "", anamnesis: "", diagnosis: "" });
  if (!patient) return <ResourceNotFound backTo="/clinic" label="el paciente" />;
  const backTo = `/clinic/show/${patient.id}`;
  return (
    <CustomPage goBack backTo={backTo} title="Nueva consulta médica" description={`Paciente: ${patient.name} · Se guarda en su expediente. El cobro de la consulta lo lleva el servicio de veterinaria de la visita.`}>
      <Card className="p-5">
        <Field label="Médico tratante">
          <Select value={form.vetId} onChange={(e) => setForm({ ...form, vetId: e.target.value })}>
            {s.vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Peso"><Input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="12.5 kg" /></Field>
          <Field label="Temperatura"><Input value={form.temp} onChange={(e) => setForm({ ...form, temp: e.target.value })} placeholder="38.5 °C" /></Field>
          <Field label="Frec. cardíaca"><Input value={form.hr} onChange={(e) => setForm({ ...form, hr: e.target.value })} placeholder="90 lpm" /></Field>
        </div>
        <Field label="Anamnesis (síntomas reportados)"><textarea style={{ ...inputStyle, minHeight: 64 }} value={form.anamnesis} onChange={(e) => setForm({ ...form, anamnesis: e.target.value })} placeholder="¿Qué reporta el dueño?" /></Field>
        <Field label="Diagnóstico presuntivo"><textarea style={{ ...inputStyle, minHeight: 64 }} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></Field>
        <div className="flex justify-end gap-2 mt-1">
          <Btn kind="ghost" onClick={() => navigate(backTo)}>Cancelar</Btn>
          <Btn disabled={!form.anamnesis || !form.diagnosis} onClick={() => {
            s.createRecord({ patientId: patient.id, vetId: form.vetId, vitals: { weight: form.weight, temp: form.temp, hr: form.hr }, anamnesis: form.anamnesis, diagnosis: form.diagnosis });
            navigate(backTo);
          }}>Guardar consulta</Btn>
        </div>
      </Card>
    </CustomPage>
  );
}
