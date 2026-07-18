import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { F, HOURS, T, todayLabel } from "../../lib/constants";
import { useVetStore } from "../../states/app.state";
import { Badge, Btn, Card, PatientAlerts, SectionHead } from "../../components/ui";

export default function AppointmentsPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  const appointmentAt = (vetId: string, time: string) => s.appointments.find((a) => a.vetId === vetId && a.time === time && a.status !== "cancelada");
  const statusTone = { pendiente: "amber", confirmada: "green", completada: "blue", cancelada: "gray" } as const;
  return (
    <div>
      <SectionHead title="Citas" sub={`Hoy, ${todayLabel} · la matriz cruza médicos y horarios: no permite sobreagendar.`}
        action={<Btn onClick={() => navigate("/appointments/new")}><Plus size={14} /> Nueva cita</Btn>} />
      <Card className="p-4" style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 640 }}>
          <div className="grid" style={{ gridTemplateColumns: `64px repeat(${s.vets.length}, 1fr)`, gap: 6 }}>
            <div />
            {s.vets.map((v) => (
              <div key={v.id} className="flex items-center gap-2 px-2 py-2" style={{ borderBottom: `2px solid ${v.color}` }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: v.color }} />
                <span style={{ fontFamily: F.head, fontSize: 12.5, fontWeight: 600 }}>{v.name}</span>
              </div>
            ))}
            {HOURS.map((h) => (
              <Fragment key={h}>
                <div style={{ fontSize: 11.5, color: T.sub, padding: "12px 4px 0", fontVariantNumeric: "tabular-nums" }}>{h}</div>
                {s.vets.map((v) => {
                  const appt = appointmentAt(v.id, h);
                  if (!appt) return (
                    <button key={v.id + h} onClick={() => navigate(`/appointments/new?vetId=${v.id}&time=${h}`)}
                      className="group flex items-center justify-center"
                      style={{ border: `1px dashed ${T.line}`, borderRadius: 10, minHeight: 52, color: T.sub }}>
                      <Plus size={14} className="opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                  const patient = s.patients.find((p) => p.id === appt.patientId)!;
                  return (
                    <button key={v.id + h} onClick={() => navigate(`/appointments/show/${appt.id}`)} className="text-left px-2.5 py-2"
                      style={{ borderRadius: 10, minHeight: 52, background: appt.status === "completada" ? "#F0EFE9" : T.greenSoft, borderLeft: `3px solid ${v.color}` }}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: T.ink }}>{patient.name}</span>
                        <PatientAlerts patient={patient} small />
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <span style={{ fontSize: 11, color: T.sub }} className="truncate">{appt.reason}</span>
                        <Badge tone={statusTone[appt.status]}>{appt.status}</Badge>
                      </div>
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
