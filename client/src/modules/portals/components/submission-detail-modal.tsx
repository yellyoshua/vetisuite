import { AlertTriangle, Check } from "lucide-react";
import { Badge, Btn, Modal } from "@/components/ui";
import { T } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import type { PortalAnswer, PortalSubmission } from "@/lib/types";

interface SubmissionDetailModalProps {
  submission: PortalSubmission;
  answers: PortalAnswer[];
  onClose: () => void;
}

export function SubmissionDetailModal({
  submission,
  answers,
  onClose,
}: SubmissionDetailModalProps) {
  const clients = useVetStore((s) => s.clients);
  const patients = useVetStore((s) => s.patients);
  const appointments = useVetStore((s) => s.appointments);
  const vets = useVetStore((s) => s.vets);
  const reviewSubmissionAction = useVetStore((s) => s.reviewSubmission);

  const client = clients.find((c) => c.id === submission.clientId);
  const patient = patients.find((p) => p.id === submission.patientId);
  const appointment = appointments.find((a) => a.id === submission.appointmentId);
  const vet = appointment ? vets.find((v) => v.id === appointment.vetId) : null;

  const groupedAnswers = answers.reduce<Record<string, PortalAnswer[]>>((acc, ans) => {
    const stage = ans.stageTitle || "General";
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(ans);
    return acc;
  }, {});

  const statusLabel =
    submission.status === "appointment_created"
      ? "Cita creada"
      : submission.status === "captured"
        ? "Capturado"
        : "Rechazado";
  const statusTone =
    submission.status === "appointment_created"
      ? "green"
      : submission.status === "captured"
        ? "blue"
        : "red";

  return (
    <Modal title={`Detalle del envío · ${submission.id}`} onClose={onClose}>
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div
          className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-2"
          style={{ background: T.input, borderColor: T.line }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone={statusTone}>{statusLabel}</Badge>
            {submission.campaignName && (
              <Badge tone="blue">Campaña: {submission.campaignName}</Badge>
            )}
            {submission.needsReview && (
              <Badge tone="amber">Requiere revisión de identidad</Badge>
            )}
          </div>
          <div style={{ fontSize: 12, color: T.sub }}>
            {new Date(submission.submittedAt).toLocaleString("es-EC")}
          </div>
        </div>

        {submission.needsReview && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div style={{ fontSize: 12.5, color: "#78350F" }}>
                <b>Atención:</b> El teléfono coincidió con un cliente registrado pero el nombre ingresado difiere o hubo una mascota nueva. Verifica la identidad del dueño.
              </div>
            </div>
            <Btn
              small
              kind="amber"
              onClick={() => {
                reviewSubmissionAction(submission.id);
              }}
            >
              <Check size={12} /> Marcar revisado
            </Btn>
          </div>
        )}

        {appointment && (
          <div
            className="p-3.5 rounded-xl border"
            style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", marginBottom: 4 }}>
              Cita médica vinculada
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-ink">
              <div>
                <span className="text-sub">Fecha / Hora: </span>
                <b>{appointment.date || "Hoy"} {appointment.time}</b>
              </div>
              <div>
                <span className="text-sub">Estado: </span>
                <b>{appointment.status}</b>
              </div>
              <div>
                <span className="text-sub">Profesional: </span>
                <b>{vet ? vet.name : "Asignado"}</b>
              </div>
            </div>
            <div className="text-xs text-ink mt-1.5">
              <span className="text-sub">Motivo: </span>
              <b>{appointment.reason}</b>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border" style={{ borderColor: T.line }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", marginBottom: 4 }}>
              Dueño / Cliente
            </div>
            {client ? (
              <div className="text-xs space-y-1">
                <div className="font-semibold text-ink">{client.name}</div>
                <div className="text-sub">{client.phone}</div>
                {client.email && <div className="text-sub">{client.email}</div>}
              </div>
            ) : (
              <div className="text-xs text-sub">No vinculado</div>
            )}
          </div>

          <div className="p-3 rounded-xl border" style={{ borderColor: T.line }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", marginBottom: 4 }}>
              Paciente / Mascota
            </div>
            {patient ? (
              <div className="text-xs space-y-1">
                <div className="font-semibold text-ink">{patient.name} ({patient.species})</div>
                <div className="text-sub">{patient.breed || "Raza no especificada"} · {patient.age || "Edad no especificada"}</div>
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="text-amber-700">Alergias: {patient.allergies.join(", ")}</div>
                )}
              </div>
            ) : (
              <div className="text-xs text-sub">No vinculado</div>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, textTransform: "uppercase", marginBottom: 8 }}>
            Respuestas registradas (Snapshot inmutable)
          </div>

          <div className="space-y-4">
            {Object.entries(groupedAnswers).map(([stageTitle, stageAnswers]) => (
              <div
                key={stageTitle}
                className="p-3.5 rounded-xl border"
                style={{ borderColor: T.line, background: T.input }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
                  {stageTitle}
                </div>

                <div className="space-y-2.5">
                  {stageAnswers.map((ans) => (
                    <div key={ans.id} className="text-xs border-b pb-2 last:border-0 last:pb-0" style={{ borderColor: T.line }}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium text-ink">{ans.fieldLabel}</span>
                        <div className="flex items-center gap-1">
                          {ans.binding ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-mono">
                              {ans.binding}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700">
                              personalizado
                            </span>
                          )}
                          <span className="text-[10px] text-sub">({ans.fieldType})</span>
                        </div>
                      </div>
                      <div className="font-semibold text-ink pl-2 border-l-2" style={{ borderColor: T.green }}>
                        {ans.optionLabel || ans.valueText || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Btn kind="ghost" onClick={onClose}>
            Cerrar
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
