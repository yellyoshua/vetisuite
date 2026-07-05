import { useState } from "react";
import { GROOM_SERVICES, inputStyle, money, T } from "../../../lib/constants";
import type { Client } from "../../../lib/types";
import { useVetStore } from "../../../states/app.state";
import { Btn, Field, Modal } from "../../../components/ui";
import { ClientSearch } from "../../../components/client-search";
import { PatientPicker } from "../../../components/patient-picker";

export function CheckInModal({ onClose }: { onClose: () => void }) {
  const checkInGrooming = useVetStore((s) => s.checkInGrooming);
  const [client, setClient] = useState<Client | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [form, setForm] = useState({ service: "Baño completo", belongings: "", groomer: "Sofía" });
  return (
    <Modal title="Check-in de estética" onClose={onClose} width={500}>
      <Field label="1 · Cliente">
        <ClientSearch autoFocus selected={client} onSelect={(c) => { setClient(c); setPatientId(null); }} />
      </Field>
      <Field label="2 · Paciente (mascotas del cliente)">
        <PatientPicker clientId={client?.id} value={patientId} onChange={setPatientId} />
      </Field>
      <Field label="Servicio">
        <select style={inputStyle} value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
          {Object.entries(GROOM_SERVICES).map(([name, price]) => <option key={name} value={name}>{name} — {money(price)}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Peluquero asignado">
          <select style={inputStyle} value={form.groomer} onChange={(e) => setForm({ ...form, groomer: e.target.value })}>
            {["Sofía", "David", "Paola"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Pertenencias"><input style={inputStyle} value={form.belongings} onChange={(e) => setForm({ ...form, belongings: e.target.value })} placeholder="Collar, correa…" /></Field>
      </div>
      <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>📷 En producción: se adjunta foto del estado de llegada como respaldo.</p>
      <Btn full disabled={!patientId} onClick={() => { checkInGrooming({ ...form, patientId: patientId! }); onClose(); }}>Registrar check-in</Btn>
    </Modal>
  );
}
