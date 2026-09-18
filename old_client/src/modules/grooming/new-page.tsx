import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GROOMERS, GROOM_SERVICES, money } from "@/lib/constants";
import type { Client } from "@/lib/types";
import { useVetStore } from "@/states/app.state";
import { Btn, Card, Field, Input, Select } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { ClientSearch } from "@/components/client-search";
import { PatientPicker } from "@/components/patient-picker";

export default function GroomingNewPage() {
  const checkInGrooming = useVetStore((s) => s.checkInGrooming);
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [form, setForm] = useState({ service: "Baño completo", belongings: "", groomer: "Sofía" });
  return (
    <CustomPage goBack backTo="/grooming" title="Check-in de estética" description="Registra la llegada con servicio, peluquero y pertenencias.">
      <Card className="p-5">
        <Field label="1 · Cliente">
          <ClientSearch autoFocus selected={client} onSelect={(c) => { setClient(c); setPatientId(null); }} />
        </Field>
        <Field label="2 · Paciente (mascotas del cliente)">
          <PatientPicker clientId={client?.id} value={patientId} onChange={setPatientId} />
        </Field>
        <Field label="Servicio">
          <Select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
            {Object.entries(GROOM_SERVICES).map(([name, price]) => <option key={name} value={name}>{name} — {money(price)}</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Peluquero asignado">
            <Select value={form.groomer} onChange={(e) => setForm({ ...form, groomer: e.target.value })}>
              {GROOMERS.map((x) => <option key={x}>{x}</option>)}
            </Select>
          </Field>
          <Field label="Pertenencias"><Input value={form.belongings} onChange={(e) => setForm({ ...form, belongings: e.target.value })} placeholder="Collar, correa…" /></Field>
        </div>
        <div className="flex justify-end gap-2">
          <Btn kind="ghost" onClick={() => navigate("/grooming")}>Cancelar</Btn>
          <Btn disabled={!patientId} onClick={() => { checkInGrooming({ ...form, patientId: patientId! }); navigate("/grooming"); }}>Registrar check-in</Btn>
        </div>
      </Card>
    </CustomPage>
  );
}
