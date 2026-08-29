import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PawPrint, Play, Plus, Trash2 } from "lucide-react";
import { CONSULT_FEE, GROOM_SERVICES, LAB_TESTS, SERVICE_FLOWS, SPECIES_ICON, F, inputStyle, money, T } from "@/lib/constants";
import type { Product, ServiceItem, ServiceType } from "@/lib/types";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card, Field, Modal } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { InfoGrid } from "@/components/info-grid";
import { ResourceNotFound } from "@/components/resource-not-found";

const TYPE_TONE: Record<ServiceType, "green" | "blue" | "amber" | "gray"> = {
  veterinaria: "green", peluqueria: "blue", laboratorio: "amber", medicamento: "gray", vacuna: "gray",
};

function catalog(type: ServiceType, inventory: Product[]): { label: string; price: number }[] {
  switch (type) {
    case "veterinaria": return [{ label: "Consulta médica", price: CONSULT_FEE }];
    case "peluqueria": return Object.entries(GROOM_SERVICES).map(([label, price]) => ({ label, price }));
    case "laboratorio": return Object.entries(LAB_TESTS).map(([label, price]) => ({ label, price }));
    case "medicamento": return inventory.map((p) => ({ label: p.name, price: p.price }));
    case "vacuna": return inventory.filter((p) => p.category === "Vacunas").map((p) => ({ label: p.name, price: p.price }));
  }
}

/* Edición de la visita (borrador): info del cliente, agregar servicios (una mascota por servicio), quitar y "Comenzar". */
export default function VisitEditPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const visit = s.visits.find((v) => v.id === id);
  const [svcPatientId, setSvcPatientId] = useState(visit?.patientId ?? "");
  const [type, setType] = useState<ServiceType>("veterinaria");
  const [itemLabel, setItemLabel] = useState("Consulta médica");
  const [confirm, setConfirm] = useState<ServiceItem | null>(null);
  if (!visit) return <ResourceNotFound backTo="/visits" label="la visita" />;
  const client = s.clients.find((c) => c.id === visit.clientId)!;
  const pets = s.patients.filter((p) => p.clientId === client.id);
  const svcs = s.services.filter((x) => x.visitId === visit.id);
  const subtotal = svcs.reduce((t, x) => t + x.price, 0);
  const options = catalog(type, s.inventory);
  const patientId = svcPatientId || visit.patientId;

  return (
    <CustomPage goBack backTo="/visits" title="Editar visita" description="Agrega los servicios de la atención (una mascota por servicio) y pulsa Comenzar para enviarlos a sus módulos.">
      {/* CLIENTE */}
      <Card className="p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center shrink-0" style={{ width: 46, height: 46, borderRadius: 14, background: T.greenSoft, color: T.green, fontFamily: F.head, fontWeight: 700, fontSize: 19 }}>{client.name.charAt(0)}</div>
          <div className="min-w-0">
            <div style={{ fontFamily: F.head, fontSize: 18, fontWeight: 700, letterSpacing: -0.2 }}>{client.name}</div>
            <div style={{ fontSize: 12.5, color: T.sub }}>{pets.length} mascota{pets.length !== 1 ? "s" : ""} · {client.email}</div>
          </div>
          <div className="ml-auto"><Badge tone={visit.started ? "green" : "gray"}>{visit.started ? "Comenzada" : "Borrador"}</Badge></div>
        </div>
        <InfoGrid items={[
          { label: "Teléfono", value: client.phone },
          { label: "Saldo anterior", value: <span style={{ color: client.debt > 0 ? T.red : T.ink }}>{money(client.debt)}</span> },
          { label: "Servicios", value: `${svcs.length}` },
        ]} />
      </Card>

      {/* AGREGAR SERVICIO */}
      <Card className="p-5 mb-4">
        <h2 className="flex items-center gap-2" style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600, marginBottom: 14 }}><Plus size={15} color={T.green} /> Agregar servicio</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Mascota">
            <select style={inputStyle} value={patientId} onChange={(e) => setSvcPatientId(e.target.value)}>
              {pets.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.species}</option>)}
            </select>
          </Field>
          <Field label="Tipo">
            <select style={inputStyle} value={type} onChange={(e) => { const t = e.target.value as ServiceType; setType(t); setItemLabel(catalog(t, s.inventory)[0]?.label ?? ""); }}>
              {(Object.keys(SERVICE_FLOWS) as ServiceType[]).map((t) => <option key={t} value={t}>{SERVICE_FLOWS[t].label}</option>)}
            </select>
          </Field>
          <Field label="Servicio">
            <select style={inputStyle} value={itemLabel} onChange={(e) => setItemLabel(e.target.value)}>
              {options.map((o) => <option key={o.label} value={o.label}>{o.label} — {money(o.price)}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex justify-end">
          <Btn disabled={options.length === 0 || !patientId} onClick={() => {
            const opt = options.find((o) => o.label === itemLabel) ?? options[0];
            if (opt) s.addService(visit.id, { type, label: opt.label, price: opt.price, patientId });
          }}><Plus size={14} /> Agregar servicio</Btn>
        </div>
      </Card>

      {/* SERVICIOS */}
      <Card className="p-5">
        <h2 style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Servicios de la atención ({svcs.length})</h2>
        {svcs.map((sv) => {
          const pet = s.patients.find((p) => p.id === sv.patientId);
          const PetIcon = SPECIES_ICON[pet?.species ?? ""] || PawPrint;
          return (
            <div key={sv.id} className="flex items-center justify-between gap-2 py-3" style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
              <span className="flex items-center gap-2 min-w-0">
                <Badge tone={TYPE_TONE[sv.type]}>{SERVICE_FLOWS[sv.type].label}</Badge>
                <span className="truncate" style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>{sv.label}</span>
                <span className="inline-flex items-center gap-1 shrink-0" style={{ fontSize: 12, color: T.sub }}><PetIcon size={12} /> {pet?.name}</span>
                {!sv.started && <Badge tone="gray">borrador</Badge>}
              </span>
              <span className="flex items-center gap-3 shrink-0">
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, fontSize: 13 }}>{money(sv.price)}</span>
                <button onClick={() => setConfirm(sv)} title="Quitar servicio" style={{ color: T.red }}><Trash2 size={15} /></button>
              </span>
            </div>
          );
        })}
        {svcs.length === 0 && (
          <div className="text-center py-8">
            <Plus size={22} color={T.sub} className="mx-auto mb-2" />
            <p style={{ fontSize: 13, color: T.sub }}>Aún no hay servicios. Agrega el primero arriba.</p>
          </div>
        )}
        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${T.line}` }}>
          <span style={{ fontFamily: F.head, fontSize: 16, fontWeight: 700 }}>Subtotal</span>
          <span style={{ fontFamily: F.head, fontSize: 16, fontWeight: 700 }}>{money(subtotal)}</span>
        </div>
        <div className="flex justify-end mt-4">
          <Btn disabled={svcs.length === 0} onClick={() => { s.startVisit(visit.id); navigate(`/visits/show/${visit.id}`); }}><Play size={14} /> Comenzar</Btn>
        </div>
      </Card>

      {confirm && (
        <Modal title="Quitar servicio" onClose={() => setConfirm(null)} width={400}>
          <p style={{ fontSize: 14, color: T.ink }}>¿Seguro que quieres quitar <b>{confirm.label}</b> de la visita?{confirm.started && " También se elimina de su módulo."}</p>
          <div className="flex justify-end gap-2 mt-5">
            <Btn kind="ghost" onClick={() => setConfirm(null)}>Cancelar</Btn>
            <Btn kind="danger" onClick={() => { s.removeService(confirm.id); setConfirm(null); }}><Trash2 size={13} /> Quitar</Btn>
          </div>
        </Modal>
      )}
    </CustomPage>
  );
}
