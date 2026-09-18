import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarOff, Plus, Settings } from "lucide-react";
import { slotsForDate } from "@/lib/availability";
import { F, T, todayLabel } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card, PatientAlerts } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";

export default function AppointmentsPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  // Filas = horarios de la disponibilidad ∪ horas de las citas vivas: cambiar la
  // duración no debe hacer desaparecer de la matriz una cita ya agendada.
  const live = s.appointments.filter((a) => a.status !== "cancelada");
  const hours = [...new Set([...slotsForDate(s.availability, new Date()), ...live.map((a) => a.time)])].sort();
  const appointmentAt = (vetId: string, time: string) => s.appointments.find((a) => a.vetId === vetId && a.time === time && a.status !== "cancelada");
  const statusTone = { pendiente: "amber", confirmada: "green", completada: "blue", cancelada: "gray" } as const;
  return (
    <CustomPage title="Citas" description={`Hoy, ${todayLabel} · la matriz cruza médicos y horarios: un médico no puede tener dos citas en el mismo horario.`}
      actions={
        <>
          <Btn kind="ghost" onClick={() => navigate("/appointments-clinics")}><Settings size={14} /> Configurar disponibilidad</Btn>
          <Btn onClick={() => navigate("/appointments/new")}><Plus size={14} /> Nueva cita</Btn>
        </>
      }>
      {hours.length === 0 && (
        <Card className="p-10 text-center">
          <CalendarOff size={26} color={T.sub} className="mx-auto mb-3" />
          <p style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>Hoy la clínica no atiende.</p>
          <p style={{ fontSize: 12.5, color: T.sub, marginTop: 4 }}>El horario de hoy está cerrado en la configuración de disponibilidad.</p>
        </Card>
      )}
      {hours.length > 0 && (
      <Card className="p-4" style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 640 }}>
          <div className="grid" style={{ gridTemplateColumns: `64px repeat(${s.vets.length}, 1fr)`, gap: 6 }}>
            <div role="presentation" />
            {s.vets.map((v) => (
              <div key={v.id} className="flex items-center gap-2 px-2 py-2" style={{ borderBottom: `2px solid ${v.color}` }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: v.color }} />
                <span style={{ fontFamily: F.head, fontSize: 12.5, fontWeight: 600 }}>{v.name}</span>
              </div>
            ))}
            {hours.map((h) => (
              <Fragment key={h}>
                <div style={{ fontSize: 11.5, color: T.sub, padding: "12px 4px 0", fontVariantNumeric: "tabular-nums" }}>{h}</div>
                {s.vets.map((v) => {
                  const appt = appointmentAt(v.id, h);
                  if (!appt) return (
                    <button key={v.id + h} type="button" onClick={() => navigate(`/appointments/new?vetId=${v.id}&time=${h}`)}
                      aria-label={`Agendar a las ${h} con ${v.name}`}
                      className="group flex items-center justify-center"
                      style={{ border: `1px dashed ${T.line}`, borderRadius: 10, minHeight: 52, color: T.sub }}>
                      <Plus size={14} className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
                    </button>
                  );
                  const patient = s.patients.find((p) => p.id === appt.patientId)!;
                  return (
                    <button key={v.id + h} type="button" onClick={() => navigate(`/appointments/show/${appt.id}`)} className="text-left px-2.5 py-2"
                      aria-label={`Cita de las ${h} con ${v.name}: ${patient.name}, ${appt.reason}`}
                      style={{ borderRadius: 10, minHeight: 52, background: appt.status === "completada" ? T.done : T.greenSoft, borderLeft: `3px solid ${v.color}` }}>
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
      )}
    </CustomPage>
  );
}
