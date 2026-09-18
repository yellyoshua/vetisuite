import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Eye,
  Layers,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { PALETTE_FIELDS, portalUrl, T } from "@/lib/constants";
import { isFieldProtected } from "@/lib/portals";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { PortalLogo } from "./components/portal-logo";
import { InfoGrid } from "@/components/info-grid";
import { ResourceNotFound } from "@/components/resource-not-found";
import { DeletePortalModal } from "./components/delete-portal-modal";
import { StageModal } from "./components/stage-modal";
import { FieldModal } from "./components/field-modal";
import { SubmissionDetailModal } from "./components/submission-detail-modal";
import type { PortalSubmission } from "@/lib/types";

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Texto",
  textarea: "Texto largo",
  number: "Número",
  select: "Opciones",
  multiselect: "Opciones múltiples",
  email: "Correo",
  phone: "Teléfono",
  date: "Fecha",
  time_slot: "Horario",
  checkbox: "Casilla",
};

export default function PortalShowPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"overview" | "stages" | "submissions">("overview");
  const [deleting, setDeleting] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [targetStageIdForField, setTargetStageIdForField] = useState<string | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<PortalSubmission | null>(null);

  const portal = s.portals.find((p) => p.id === id);
  if (!portal) return <ResourceNotFound backTo="/portals" label="el portal" />;

  const portalStages = s.portalStages
    .filter((stg) => stg.portalId === portal.id && !stg.deletedAt)
    .sort((a, b) => a.position - b.position);

  const portalFields = s.portalFields
    .filter((fld) => fld.portalId === portal.id && !fld.deletedAt)
    .sort((a, b) => a.position - b.position);

  const submissions = s.portalSubmissions
    .filter((sub) => sub.portalId === portal.id)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const hasSubmissions = submissions.length > 0;
  const needsReviewCount = submissions.filter((sub) => sub.needsReview).length;
  const createdAppointmentsCount = submissions.filter((sub) => sub.status === "appointment_created").length;

  const handleMoveStage = (stageId: string, direction: "up" | "down") => {
    const idx = portalStages.findIndex((stg) => stg.id === stageId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= portalStages.length) return;

    const newStages = [...portalStages];
    const [moved] = newStages.splice(idx, 1);
    newStages.splice(targetIdx, 0, moved);
    s.reorderStages(portal.id, newStages.map((stg) => stg.id));
  };

  const handleMoveField = (stageId: string, fieldId: string, direction: "up" | "down") => {
    const stageFields = portalFields.filter((f) => f.stageId === stageId);
    const idx = stageFields.findIndex((f) => f.id === fieldId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= stageFields.length) return;

    const newFields = [...stageFields];
    const [moved] = newFields.splice(idx, 1);
    newFields.splice(targetIdx, 0, moved);
    s.reorderFields(stageId, newFields.map((f) => f.id));
  };

  return (
    <CustomPage
      goBack
      backTo="/portals"
      title={portal.name}
      description={portalUrl(portal.slug)}
      actions={
        <div className="flex items-center gap-2">
          <a
            href={`/p/${portal.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-slate-50 transition-colors"
            style={{ borderColor: T.line, color: T.ink }}
          >
            <ExternalLink size={14} /> Ver página pública
          </a>
          <Btn kind="ghost" onClick={() => navigate(`/portals/edit/${portal.id}`)}>
            <Pencil size={14} /> Editar
          </Btn>
          <Btn kind="danger" onClick={() => setDeleting(true)}>
            <Trash2 size={14} /> {hasSubmissions ? "Archivar" : "Eliminar"}
          </Btn>
        </div>
      }
    >
      <div className="flex items-center gap-2 mb-4 border-b pb-2" style={{ borderColor: T.line }}>
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          style={{
            background: activeTab === "overview" ? T.dark : "transparent",
            color: activeTab === "overview" ? "#fff" : T.sub,
          }}
        >
          <PortalLogo url={portal.logoUrl} size={14} /> Vista general
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("stages")}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          style={{
            background: activeTab === "stages" ? T.dark : "transparent",
            color: activeTab === "stages" ? "#fff" : T.sub,
          }}
        >
          <Layers size={14} /> Etapas y campos ({portalStages.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("submissions")}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          style={{
            background: activeTab === "submissions" ? T.dark : "transparent",
            color: activeTab === "submissions" ? "#fff" : T.sub,
          }}
        >
          <CheckCircle2 size={14} /> Envíos recibidos ({submissions.length})
          {needsReviewCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    portal.status === "published"
                      ? "green"
                      : portal.status === "archived"
                        ? "amber"
                        : "gray"
                  }
                >
                  {portal.status === "published"
                    ? "Publicado"
                    : portal.status === "archived"
                      ? "Archivado"
                      : "Borrador"}
                </Badge>
                {portal.campaignName && (
                  <Badge tone="blue">Campaña: {portal.campaignName}</Badge>
                )}
              </div>

              <div className="text-xs text-sub">
                Creado: {new Date(portal.createdAt).toLocaleDateString("es-EC")}
              </div>
            </div>

            <InfoGrid
              items={[
                { label: "Slug", value: portal.slug },
                {
                  label: "Logo",
                  value: <PortalLogo url={portal.logoUrl} size={48} alt="Logo del portal" />,
                },
                {
                  label: "Paleta",
                  value: (
                    <span className="inline-flex gap-1.5">
                      {PALETTE_FIELDS.map((f) => (
                        <span
                          key={f.key}
                          title={`${f.label}: ${portal.palette[f.key]}`}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 7,
                            background: portal.palette[f.key],
                            border: `1px solid ${T.line}`,
                          }}
                        />
                      ))}
                    </span>
                  ),
                },
                {
                  label: "Confirmación automática",
                  value: portal.autoConfirm ? "Sí (citas nacen confirmadas)" : "No (quedan pendientes)",
                },
                {
                  label: "Motivo predeterminado",
                  value: portal.defaultReason || "No configurado (el visitante redacta)",
                },
              ]}
            />
          </Card>

          <Card className="p-5">
            <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>
              Contenido de portada (Markdown)
            </div>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "ui-monospace, monospace",
                fontSize: 13,
                lineHeight: 1.6,
                color: portal.markdown ? T.ink : T.sub,
                background: T.input,
                border: `1px solid ${T.line}`,
                borderRadius: 10,
                padding: 14,
                margin: 0,
              }}
            >
              {portal.markdown || "Sin contenido de bienvenida."}
            </pre>
          </Card>
        </div>
      )}

      {activeTab === "stages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>
                Configuración del wizard de captura
              </h2>
              <p style={{ fontSize: 12.5, color: T.sub }}>
                Etapas y preguntas que completará el visitante al ingresar a este portal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Btn
                small
                kind="ghost"
                onClick={() => {
                  if (confirm("¿Restablecer las etapas y campos predeterminados del sistema? Se conservarán los envíos ya realizados.")) {
                    s.resetPortalToDefaults(portal.id);
                  }
                }}
              >
                <RefreshCw size={12} /> Restablecer
              </Btn>
              <Btn small onClick={() => setShowStageModal(true)}>
                <Plus size={13} /> Nueva etapa
              </Btn>
            </div>
          </div>

          <div className="space-y-4">
            {portalStages.map((stage, sIdx) => {
              const stageFields = portalFields.filter((f) => f.stageId === stage.id);
              const isFirst = sIdx === 0;
              const isLast = sIdx === portalStages.length - 1;
              const hasBindingFields = stageFields.some((f) => f.binding !== null);

              return (
                <Card key={stage.id} className="p-4 overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b mb-3" style={{ borderColor: T.line }}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-ink">
                        {sIdx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-sm text-ink flex items-center gap-2">
                          {stage.title}
                          <Badge tone={stage.active ? "green" : "gray"}>
                            {stage.active ? "Activa" : "Oculta"}
                          </Badge>
                        </div>
                        {stage.description && (
                          <div className="text-xs text-sub">{stage.description}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveStage(stage.id, "up")}
                        className="p-1 rounded text-sub hover:text-ink disabled:opacity-30"
                        title="Subir etapa"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveStage(stage.id, "down")}
                        className="p-1 rounded text-sub hover:text-ink disabled:opacity-30"
                        title="Bajar etapa"
                      >
                        <ArrowDown size={14} />
                      </button>

                      <Btn
                        small
                        kind="ghost"
                        onClick={() => s.updateStage(stage.id, { active: !stage.active })}
                      >
                        {stage.active ? "Ocultar" : "Mostrar"}
                      </Btn>

                      {!hasBindingFields && (
                        <Btn
                          small
                          kind="danger"
                          onClick={() => {
                            if (confirm(`¿Eliminar la etapa "${stage.title}"?`)) {
                              s.deleteStage(stage.id);
                            }
                          }}
                        >
                          <Trash2 size={12} />
                        </Btn>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {stageFields.map((field, fIdx) => {
                      const isFProtected = isFieldProtected(field, portal);
                      const isFFirst = fIdx === 0;
                      const isFLast = fIdx === stageFields.length - 1;

                      return (
                        <div
                          key={field.id}
                          className="flex items-center justify-between p-2.5 rounded-lg border text-xs gap-3"
                          style={{
                            background: field.active ? "#FFFFFF" : T.input,
                            borderColor: T.line,
                          }}
                        >
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <span className="font-semibold text-ink inline-flex items-center gap-0.5">
                              {field.label}
                              {field.required && (
                                <span
                                  title="Obligatorio"
                                  className="text-red-600 font-bold text-sm leading-none cursor-help select-none"
                                >
                                  *
                                </span>
                              )}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                              {FIELD_TYPE_LABELS[field.type] || field.type}
                            </span>
                            {isFProtected && (
                              <span
                                title="Protegido"
                                className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 cursor-help"
                              >
                                <Lock size={12} />
                              </span>
                            )}
                            {field.helpText && (
                              <span className="text-[11.5px] text-sub italic">
                                {field.helpText}
                              </span>
                            )}
                            {field.placeholder && (
                              <span className="text-[11px] text-slate-400 font-normal">
                                (Ej: {field.placeholder})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={isFFirst}
                              onClick={() => handleMoveField(stage.id, field.id, "up")}
                              className="p-1 rounded text-sub hover:text-ink disabled:opacity-30"
                              title="Subir campo"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={isFLast}
                              onClick={() => handleMoveField(stage.id, field.id, "down")}
                              className="p-1 rounded text-sub hover:text-ink disabled:opacity-30"
                              title="Bajar campo"
                            >
                              <ArrowDown size={13} />
                            </button>

                            {!isFProtected && (
                              <button
                                type="button"
                                onClick={() => s.updateField(field.id, { active: !field.active })}
                                className="text-[11px] font-medium px-2 py-0.5 rounded border hover:bg-slate-50"
                                style={{ borderColor: T.line }}
                              >
                                {field.active ? "Ocultar" : "Mostrar"}
                              </button>
                            )}

                            {field.binding === null && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`¿Eliminar el campo "${field.label}"?`)) {
                                    s.deleteField(field.id);
                                  }
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Eliminar campo"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {stageFields.length === 0 && (
                      <div className="text-xs text-sub text-center py-3">
                        Esta etapa aún no tiene campos configurados.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setTargetStageIdForField(stage.id)}
                      className="text-xs font-semibold text-green-700 hover:underline inline-flex items-center gap-1"
                    >
                      <Plus size={13} /> Agregar campo a esta etapa
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3.5">
              <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, textTransform: "uppercase" }}>
                Total envíos
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.ink, marginTop: 2 }}>
                {submissions.length}
              </div>
            </Card>

            <Card className="p-3.5">
              <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, textTransform: "uppercase" }}>
                Citas agendadas
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#166534", marginTop: 2 }}>
                {createdAppointmentsCount}
              </div>
            </Card>

            <Card className="p-3.5">
              <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, textTransform: "uppercase" }}>
                Capturados
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1E40AF", marginTop: 2 }}>
                {submissions.filter((s) => s.status === "captured").length}
              </div>
            </Card>

            <Card className="p-3.5">
              <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, textTransform: "uppercase" }}>
                Por revisar
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: needsReviewCount > 0 ? "#B45309" : T.sub, marginTop: 2 }}>
                {needsReviewCount}
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>
              Historial de envíos recibidos
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-8 text-sub text-sm">
                Aún no se han recibido solicitudes a través de este portal.
              </div>
            ) : (
              <div className="space-y-2">
                {submissions.map((sub) => {
                  const client = s.clients.find((c) => c.id === sub.clientId);
                  const patient = s.patients.find((p) => p.id === sub.patientId);
                  const subAnswers = s.portalAnswers.filter((a) => a.submissionId === sub.id);

                  const phoneAnswer = subAnswers.find((a) => a.binding === "client.phone")?.valueText;
                  const petAnswer = subAnswers.find((a) => a.binding === "patient.name")?.valueText;

                  const statusLabel =
                    sub.status === "appointment_created"
                      ? "Cita creada"
                      : sub.status === "captured"
                        ? "Capturado"
                        : "Rechazado";
                  const statusTone =
                    sub.status === "appointment_created"
                      ? "green"
                      : sub.status === "captured"
                        ? "blue"
                        : "red";

                  return (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      style={{
                        background: sub.needsReview ? "#FFFBEB" : "#FFFFFF",
                        borderColor: sub.needsReview ? "#FDE68A" : T.line,
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-ink">
                            {client?.name || "Dueño"}
                          </span>
                          <span className="text-sub">({phoneAnswer || client?.phone || "Sin teléfono"})</span>
                          <Badge tone={statusTone}>{statusLabel}</Badge>
                          {sub.needsReview && (
                            <Badge tone="amber">Revisar identidad</Badge>
                          )}
                        </div>

                        <div className="text-sub flex items-center gap-2 flex-wrap">
                          <span>Mascota: <b>{patient?.name || petAnswer || "—"}</b></span>
                          <span>·</span>
                          <span>{new Date(sub.submittedAt).toLocaleString("es-EC")}</span>
                          {sub.campaignName && (
                            <>
                              <span>·</span>
                              <span className="text-blue-700 font-medium">{sub.campaignName}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Btn
                          small
                          kind="ghost"
                          onClick={() => setViewingSubmission(sub)}
                        >
                          <Eye size={13} /> Ver respuestas
                        </Btn>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {deleting && (
        <DeletePortalModal
          portal={portal}
          hasSubmissions={hasSubmissions}
          onClose={() => setDeleting(false)}
          onConfirmDelete={() => {
            s.removePortal(portal.id);
            navigate("/portals");
          }}
          onConfirmArchive={() => {
            s.archivePortal(portal.id);
            setDeleting(false);
          }}
        />
      )}

      {showStageModal && (
        <StageModal
          onClose={() => setShowStageModal(false)}
          onSubmit={(data) => {
            s.addStage(portal.id, data);
            setShowStageModal(false);
          }}
        />
      )}

      {targetStageIdForField && (
        <FieldModal
          onClose={() => setTargetStageIdForField(null)}
          onSubmit={(fieldData, options) => {
            s.addField(portal.id, targetStageIdForField, fieldData, options);
            setTargetStageIdForField(null);
          }}
        />
      )}

      {viewingSubmission && (
        <SubmissionDetailModal
          submission={viewingSubmission}
          answers={s.portalAnswers.filter((a) => a.submissionId === viewingSubmission.id)}
          onClose={() => setViewingSubmission(null)}
        />
      )}
    </CustomPage>
  );
}
