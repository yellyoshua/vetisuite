import { useState } from "react";
import { CheckCircle2, Clock, Plus, ShieldAlert } from "lucide-react";
import { F, money, T } from "../../lib/constants";
import { useVetStore } from "../../states/app.state";
import { Badge, Btn, Card, Elapsed, SectionHead } from "../../components/ui";
import { CheckInModal } from "./components/check-in-modal";

const COLUMNS = [
  { key: "pendiente", label: "Pendiente", tone: T.amber },
  { key: "proceso", label: "En proceso", tone: T.blue },
  { key: "terminado", label: "Terminado", tone: T.green },
] as const;

export default function GroomingPage() {
  const s = useVetStore();
  const [modal, setModal] = useState(false);
  return (
    <div>
      <SectionHead title="Peluquería y Estética" sub="Tablero Kanban con cronómetro por peluquero. Al terminar, el sistema avisa al dueño por WhatsApp y carga el servicio a facturación."
        action={<Btn onClick={() => setModal(true)}><Plus size={14} /> Check-in</Btn>} />
      <div className="grid md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const items = s.grooming.filter((g) => g.status === col.key);
          return (
            <div key={col.key}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <span style={{ width: 9, height: 9, borderRadius: 99, background: col.tone }} />
                <span style={{ fontFamily: F.head, fontSize: 13.5, fontWeight: 600 }}>{col.label}</span>
                <span style={{ fontSize: 12, color: T.sub }}>({items.length})</span>
              </div>
              <div className="flex flex-col gap-3" style={{ minHeight: 120, background: "#F1EFE7", borderRadius: 14, padding: 10 }}>
                {items.map((g) => {
                  const patient = s.patients.find((p) => p.id === g.patientId)!;
                  const owner = s.clients.find((c) => c.id === patient.clientId)!;
                  const duration = g.finishedAt && g.startedAt ? Math.round((g.finishedAt - g.startedAt) / 60000) : null;
                  return (
                    <Card key={g.id} className="p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontFamily: F.head, fontSize: 14, fontWeight: 700 }}>{patient.name}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: T.green }}>{money(g.price)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: T.sub }}>{g.service} · {owner.name}</div>
                      <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>🎒 {g.belongings || "Sin pertenencias"} · ✂️ {g.groomer}</div>
                      {patient.aggressive && <div className="mt-1.5"><Badge tone="red"><ShieldAlert size={11} /> Manejo con precaución</Badge></div>}
                      {g.status === "proceso" && g.startedAt && (
                        <div className="mt-2 inline-flex items-center gap-1.5" style={{ background: T.blueSoft, color: T.blue, borderRadius: 8, padding: "3px 9px", fontSize: 12, fontWeight: 600 }}>
                          <Clock size={12} /> <Elapsed since={g.startedAt} />
                        </div>
                      )}
                      {duration !== null && <div className="mt-1.5" style={{ fontSize: 11.5, color: T.sub }}>⏱ Ejecutado en {duration} min</div>}
                      <div className="mt-3">
                        {g.status === "pendiente" && <Btn small full kind="dark" onClick={() => s.moveGrooming(g.id, "proceso")}>Iniciar servicio</Btn>}
                        {g.status === "proceso" && <Btn small full onClick={() => s.moveGrooming(g.id, "terminado")}><CheckCircle2 size={13} /> Terminar y notificar</Btn>}
                        {g.status === "terminado" && <Btn small full kind="ghost" onClick={() => s.moveGrooming(g.id, "entregado")}>Marcar entregado</Btn>}
                      </div>
                    </Card>
                  );
                })}
                {items.length === 0 && <p className="text-center py-6" style={{ fontSize: 12, color: T.sub }}>Sin mascotas aquí.</p>}
              </div>
            </div>
          );
        })}
      </div>
      {modal && <CheckInModal onClose={() => setModal(false)} />}
    </div>
  );
}
