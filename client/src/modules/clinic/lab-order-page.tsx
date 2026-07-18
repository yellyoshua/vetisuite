import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { inputStyle, LAB_TESTS, money, T } from "../../lib/constants";
import { useVetStore } from "../../states/app.state";
import { Btn, Card, Field } from "../../components/ui";
import { PageHeader } from "../../components/page-header";
import { ResourceNotFound } from "../../components/resource-not-found";

export default function LabOrderNewPage() {
  const { patientId } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const [test, setTest] = useState(Object.keys(LAB_TESTS)[0]);
  const patient = s.patients.find((p) => p.id === patientId);
  if (!patient) return <ResourceNotFound backTo="/clinic" label="el paciente" />;
  const backTo = `/clinic/show/${patient.id}`;
  return (
    <div>
      <PageHeader backTo={backTo} title="Orden de laboratorio" sub={`Paciente: ${patient.name} · El examen se carga a la cuenta abierta del cliente.`} />
      <Card className="p-5" style={{ maxWidth: 520 }}>
        <Field label="Examen">
          <select style={inputStyle} value={test} onChange={(e) => setTest(e.target.value)}>
            {Object.entries(LAB_TESTS).map(([name, price]) => <option key={name} value={name}>{name} — {money(price)}</option>)}
          </select>
        </Field>
        <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>La orden entra a la cola del laboratorio y el resultado se carga desde el expediente.</p>
        <div className="flex justify-end gap-2">
          <Btn kind="ghost" onClick={() => navigate(backTo)}>Cancelar</Btn>
          <Btn onClick={() => { s.orderLab(patient.id, test); navigate(backTo); }}>Generar orden interna</Btn>
        </div>
      </Card>
    </div>
  );
}
