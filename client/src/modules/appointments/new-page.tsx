import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { slotsForDate } from "@/lib/availability";
import { inputStyle, T } from "@/lib/constants";
import type { Client } from "@/lib/types";
import { useVetStore } from "@/states/app.state";
import { Btn, Card, Field } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { ClientSearch } from "@/components/client-search";
import { PatientPicker } from "@/components/patient-picker";

/* The appointment starts from the client: first search the owner
   (async typeahead), then pick among THEIR pets. Presets arrive via
   search params: ?vetId=&time= (empty slot) or ?patientId= (from a pet). */
export default function AppointmentNewPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ctxPatientId = searchParams.get("patientId");
  const ctxPatient = ctxPatientId ? s.patients.find((p) => p.id === ctxPatientId) : null;
  const [client, setClient] = useState<Client | null>(ctxPatient ? s.clients.find((c) => c.id === ctxPatient.clientId)! : null);
  const [patientId, setPatientId] = useState<string | null>(ctxPatient ? ctxPatient.id : null);
  const hours = slotsForDate(s.availability, new Date());
  const [form, setForm] = useState({
    vetId: searchParams.get("vetId") || s.vets[0].id,
    time: searchParams.get("time") || hours[0] || "",
    reason: "",
  });
  return (
    <CustomPage goBack backTo="/appointments" title="Nueva cita" description="Busca al dueño, elige la mascota y agenda sin sobreagendar.">
      <Card className="p-5">
        <Field label="1 · Cliente">
          <ClientSearch autoFocus selected={client} onSelect={(c) => { setClient(c); setPatientId(null); }} />
        </Field>
        <Field label="2 · Paciente (mascotas del cliente)">
          <PatientPicker clientId={client?.id} value={patientId} onChange={setPatientId} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Médico">
            <select style={inputStyle} value={form.vetId} onChange={(e) => setForm({ ...form, vetId: e.target.value })}>
              {s.vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </Field>
          <Field label="Hora">
            <select style={inputStyle} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
              {hours.map((h) => <option key={h}>{h}</option>)}
            </select>
            {hours.length === 0 && <span style={{ fontSize: 11.5, color: T.red }}>Hoy no hay horarios: revisa la disponibilidad.</span>}
          </Field>
        </div>
        <Field label="Motivo"><input style={inputStyle} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Ej: Vacunación, control, cirugía…" /></Field>
        <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }} className="flex items-center gap-1.5">
          <MessageCircle size={13} color={T.wa} /> Al agendar se envía confirmación automática por WhatsApp, con recordatorios 24 h y 2 h antes.
        </p>
        <div className="flex justify-end gap-2">
          <Btn kind="ghost" onClick={() => navigate("/appointments")}>Cancelar</Btn>
          <Btn disabled={!patientId || !form.reason || !form.time} onClick={() => { if (s.createAppointment({ ...form, patientId: patientId! })) navigate("/appointments"); }}>Agendar y notificar</Btn>
        </div>
      </Card>
    </CustomPage>
  );
}
