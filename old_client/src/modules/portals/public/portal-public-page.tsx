import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import { inputStyle, T, uid } from "@/lib/constants";
import { slotsForDate, ymd } from "@/lib/availability";
import { normalizePhone, validateFieldValue } from "@/lib/portals";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card, Field, Input, Modal, Select } from "@/components/ui";
import { PortalLogo } from "../components/portal-logo";
import type { Appointment, PortalSubmission } from "@/lib/types";

function renderMarkdown(md: string) {
  if (!md) return null;
  const lines = md.split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={idx} className="h-3" />;
    }
    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={idx} style={{ fontSize: 22, fontWeight: 700, color: "var(--portal-primary, #186653)", marginBottom: 8 }}>
          {trimmed.replace(/^#\s+/, "")}
        </h1>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={idx} style={{ fontSize: 18, fontWeight: 600, color: "var(--portal-primary, #186653)", marginTop: 12, marginBottom: 6 }}>
          {trimmed.replace(/^##\s+/, "")}
        </h2>
      );
    }
    if (trimmed.startsWith("- ")) {
      return (
        <li key={idx} style={{ fontSize: 14, color: T.ink, marginLeft: 20, marginBottom: 4 }}>
          {trimmed.replace(/^-\s+/, "")}
        </li>
      );
    }
    return (
      <p key={idx} style={{ fontSize: 14, lineHeight: 1.6, color: T.ink, marginBottom: 6 }}>
        {trimmed}
      </p>
    );
  });
}

export default function PublicPortalPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const portals = useVetStore((s) => s.portals);
  const portalStages = useVetStore((s) => s.portalStages);
  const portalFields = useVetStore((s) => s.portalFields);
  const portalFieldOptions = useVetStore((s) => s.portalFieldOptions);
  const clients = useVetStore((s) => s.clients);
  const patients = useVetStore((s) => s.patients);
  const vets = useVetStore((s) => s.vets);
  const appointments = useVetStore((s) => s.appointments);
  const availability = useVetStore((s) => s.availability);
  const submitPortalAction = useVetStore((s) => s.submitPortal);

  const portal = useMemo(() => portals.find((p) => p.slug === slug), [portals, slug]);

  const stages = useMemo(() => {
    if (!portal) return [];
    return portalStages
      .filter((s) => s.portalId === portal.id && s.active && !s.deletedAt)
      .sort((a, b) => a.position - b.position);
  }, [portal, portalStages]);

  const fields = useMemo(() => {
    if (!portal) return [];
    const stageIds = new Set(stages.map((s) => s.id));
    return portalFields
      .filter((f) => stageIds.has(f.stageId) && f.active && !f.deletedAt)
      .sort((a, b) => a.position - b.position);
  }, [portal, stages, portalFields]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isCover, setIsCover] = useState(true);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const [selectedPetOption, setSelectedPetOption] = useState<string>("new");

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return ymd(today);
  });
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    submission?: PortalSubmission;
    appointment?: Appointment;
    success: boolean;
  } | null>(null);
  const [slotTakenModal, setSlotTakenModal] = useState(false);

  const [idempotencyKey] = useState(() => uid());

  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [currentStageIndex, isCover]);

  const clientPhoneField = useMemo(
    () => fields.find((f) => f.binding === "client.phone"),
    [fields],
  );

  const phoneValue = clientPhoneField ? answers[clientPhoneField.id] || "" : "";

  const matchedClientId = useMemo(() => {
    const norm = normalizePhone(phoneValue);
    if (norm.length >= 7) {
      const match = clients.find((c) => normalizePhone(c.phone) === norm);
      return match ? match.id : null;
    }
    return null;
  }, [phoneValue, clients]);

  const clientExistingPets = useMemo(() => {
    if (!matchedClientId) return [];
    return patients.filter((p) => p.clientId === matchedClientId);
  }, [matchedClientId, patients]);

  const availableSlotsForDate = useMemo(() => {
    if (!portal) return [];
    const dateObj = new Date(selectedDate + "T12:00:00");
    const allSlots = slotsForDate(availability, dateObj);

    return allSlots.filter((time) => {
      const isAlreadyReserved = appointments.some(
        (a) =>
          a.time === time &&
          (a.date === selectedDate || (!a.date && selectedDate === ymd(new Date()))) &&
          a.status !== "cancelada" &&
          Boolean(a.vetId),
      );
      return !isAlreadyReserved;
    });
  }, [portal, selectedDate, availability, appointments]);

  const handleFieldChange = (fieldId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validateCurrentStage = (): boolean => {
    const isReview = currentStageIndex === stages.length;
    if (isReview) return true;

    const currentStage = stages[currentStageIndex];
    if (!currentStage) return true;

    const stageFields = fields.filter((f) => f.stageId === currentStage.id);
    const errors: Record<string, string> = {};

    if (currentStage.name === "schedule") {
      if (!selectedDate) {
        errors.schedule_date = "Selecciona una fecha.";
      }
      if (!selectedTime) {
        errors.schedule_time = "Selecciona un horario disponible.";
      }
    }

    for (const f of stageFields) {
      if (currentStage.name === "pet" && selectedPetOption !== "new") {
        if (f.binding === "patient.name") continue;
      }
      if (f.binding === "appointment.date" || f.binding === "appointment.time" || f.binding === "appointment.vet") {
        continue;
      }
      const val = answers[f.id];
      const err = validateFieldValue(f, val);
      if (err) {
        errors[f.id] = err;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStage()) return;
    if (currentStageIndex < stages.length) {
      setCurrentStageIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    setFieldErrors({});
    if (currentStageIndex === 0) {
      setIsCover(true);
    } else {
      setCurrentStageIndex((i) => i - 1);
    }
  };

  const handleSubmit = () => {
    if (!portal) return;
    setIsSubmitting(true);

    const payloadAnswers = { ...answers };

    const dateField = fields.find((f) => f.binding === "appointment.date");
    if (dateField) payloadAnswers[dateField.id] = selectedDate;

    const timeField = fields.find((f) => f.binding === "appointment.time");
    if (timeField) payloadAnswers[timeField.id] = selectedTime;

    if (selectedPetOption !== "new") {
      const chosenPet = clientExistingPets.find((p) => p.id === selectedPetOption);
      const nameField = fields.find((f) => f.binding === "patient.name");
      if (nameField && chosenPet) {
        payloadAnswers[nameField.id] = chosenPet.name;
      }
    }

    const res = submitPortalAction({
      portalId: portal.id,
      idempotencyKey,
      answers: payloadAnswers,
      selectedDate,
      selectedTime,
      selectedPatientId: selectedPetOption !== "new" ? selectedPetOption : undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmissionResult({
        success: true,
        submission: res.submission,
        appointment: res.appointment,
      });
    } else {
      if (res.rejectionReason === "slot_taken") {
        setSlotTakenModal(true);
      } else {
        alert(res.error || "No se pudo procesar la solicitud. Por favor intenta de nuevo.");
      }
    }
  };

  if (!portal) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-amber-500" />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
            Portal no encontrado
          </h1>
          <p style={{ fontSize: 13.5, color: T.sub, marginBottom: 20 }}>
            La dirección a la que intentas acceder no corresponde a ningún portal activo de la clínica.
          </p>
          <Btn onClick={() => navigate("/")}>Ir al panel</Btn>
        </Card>
      </div>
    );
  }

  const isPublished = portal.status === "published";
  const primaryColor = portal.palette.primary || "#186653";
  const accentColor = portal.palette.accent || "#C9A227";
  const bgColor = portal.palette.bg || "#FFFFFF";

  const totalStepsCount = stages.length + 1;
  const isReviewStep = currentStageIndex === stages.length;
  const currentStage = stages[currentStageIndex];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: bgColor,
        fontFamily: "Inter, sans-serif",
        ["--portal-primary" as string]: primaryColor,
        ["--portal-accent" as string]: accentColor,
      }}
    >
      <header
        className="w-full border-b py-3 px-4 sm:px-8 bg-white/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between"
        style={{ borderColor: T.line }}
      >
        <div className="flex items-center gap-3">
          <PortalLogo url={portal.logoUrl} size={36} alt={portal.name} />
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: primaryColor, lineHeight: 1.2 }}>
              {portal.name}
            </div>
            <div style={{ fontSize: 11.5, color: T.sub }}>Clínica Veterinaria</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {portal.campaignName && (
            <Badge tone="blue">{portal.campaignName}</Badge>
          )}
          <Badge tone="green">Reserva en línea</Badge>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 flex flex-col justify-center">
        {!isPublished && (
          <Card className="p-4 mb-6 border-amber-300 bg-amber-50">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
              <AlertTriangle size={16} /> Portal no publicado
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Este portal se encuentra actualmente en estado de borrador o archivado. La recepción de solicitudes no está disponible públicamente.
            </p>
          </Card>
        )}

        {!availability.onlineBooking && (
          <Card className="p-4 mb-6 border-amber-300 bg-amber-50">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
              <AlertTriangle size={16} /> Reserva en línea suspendida
            </div>
            <p className="text-xs text-amber-700 mt-1">
              La clínica ha pausado temporalmente las reservas en línea de citas.
            </p>
          </Card>
        )}

        {submissionResult ? (
          <Card className="p-8 text-center shadow-sm">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#E8F5E9", color: "#2E7D32" }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h1
              tabIndex={-1}
              ref={headingRef}
              style={{ fontSize: 22, fontWeight: 700, color: T.ink, marginBottom: 8 }}
            >
              {portal.autoConfirm ? "¡Cita confirmada!" : "¡Solicitud recibida!"}
            </h1>

            <p style={{ fontSize: 14, color: T.sub, marginBottom: 20, lineHeight: 1.5 }}>
              {portal.autoConfirm
                ? "Tu cita ha sido agendada y confirmada en el sistema de la clínica."
                : "Tu solicitud ha sido recibida y se encuentra pendiente de confirmación por el equipo de recepción."}
            </p>

            {submissionResult.appointment && (
              <div
                className="p-4 rounded-xl text-left mb-6"
                style={{ background: T.input, border: `1px solid ${T.line}` }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", marginBottom: 6 }}>
                  Detalles de la cita
                </div>
                <div className="flex items-center gap-2 mb-1.5" style={{ fontSize: 13.5, color: T.ink }}>
                  <Calendar size={15} color={primaryColor} /> Fecha: <b>{selectedDate}</b>
                </div>
                <div className="flex items-center gap-2 mb-1.5" style={{ fontSize: 13.5, color: T.ink }}>
                  <Clock size={15} color={primaryColor} /> Horario: <b>{selectedTime}</b> ({availability.slotMinutes} min)
                </div>
                {submissionResult.appointment.vetId && (
                  <div className="flex items-center gap-2" style={{ fontSize: 13.5, color: T.ink }}>
                    <User size={15} color={primaryColor} /> Especialista:{" "}
                    <b>
                      {vets.find((v) => v.id === submissionResult.appointment?.vetId)?.name || "Asignado por clínica"}
                    </b>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Btn
                onClick={() => {
                  setSubmissionResult(null);
                  setIsCover(true);
                  setCurrentStageIndex(0);
                  setAnswers({});
                }}
              >
                Volver a la portada
              </Btn>
            </div>
          </Card>
        ) : isCover ? (
          <Card className="p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              {renderMarkdown(portal.markdown)}
            </div>

            <div
              className="p-4 rounded-xl mb-6 flex items-center justify-between"
              style={{ background: T.input, border: `1px solid ${T.line}` }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, textTransform: "uppercase" }}>
                  {portal.purpose === "booking" ? "Reserva por pasos" : "Captura de datos"}
                </div>
                <div style={{ fontSize: 12.5, color: T.sub }}>
                  {portal.purpose === "booking"
                    ? `${stages.length} pasos sencillos para agendar tu atención`
                    : "Completa el formulario en breves etapas"}
                </div>
              </div>
              <Badge tone="blue">{stages.length} etapas</Badge>
            </div>

            <button
              type="button"
              disabled={!isPublished || (portal.purpose === "booking" && !availability.onlineBooking)}
              className="w-full py-3 px-4 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-opacity"
              style={{
                background: primaryColor,
                opacity: (!isPublished || (portal.purpose === "booking" && !availability.onlineBooking)) ? 0.5 : 1,
                cursor: (!isPublished || (portal.purpose === "booking" && !availability.onlineBooking)) ? "not-allowed" : "pointer",
              }}
              onClick={() => {
                setIsCover(false);
                setCurrentStageIndex(0);
              }}
            >
              {portal.purpose === "booking" ? "Reservar cita" : "Comenzar formulario"} <ArrowRight size={16} />
            </button>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 12, fontWeight: 600, color: primaryColor, textTransform: "uppercase", letterSpacing: 0.3 }}>
                  Paso {currentStageIndex + 1} de {totalStepsCount} · {isReviewStep ? "Revisa tu reserva" : currentStage?.title}
                </span>
                <span style={{ fontSize: 12, color: T.sub }}>
                  {Math.round(((currentStageIndex + 1) / totalStepsCount) * 100)}%
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentStageIndex + 1) / totalStepsCount) * 100}%`,
                    backgroundColor: primaryColor,
                  }}
                />
              </div>
            </div>

            <h1
              tabIndex={-1}
              ref={headingRef}
              style={{ fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 4, outline: "none" }}
            >
              {isReviewStep ? "Revisa tu reserva antes de confirmar" : currentStage?.title}
            </h1>
            <p style={{ fontSize: 13, color: T.sub, marginBottom: 20 }}>
              {isReviewStep
                ? "Verifica que todos los datos sean correctos. Puedes editar cualquier sección si necesitas cambiar algo."
                : currentStage?.description}
            </p>

            {isReviewStep ? (
              <div className="space-y-4 mb-6">
                {stages.map((stage) => {
                  const stageFields = fields.filter((f) => f.stageId === stage.id);
                  return (
                    <div
                      key={stage.id}
                      className="p-4 rounded-xl border"
                      style={{ borderColor: T.line, background: T.input }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: 13, fontWeight: 700, color: primaryColor }}>
                          {stage.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const idx = stages.findIndex((s) => s.id === stage.id);
                            if (idx >= 0) setCurrentStageIndex(idx);
                          }}
                          className="text-xs font-semibold hover:underline"
                          style={{ color: primaryColor }}
                        >
                          Editar
                        </button>
                      </div>

                      {stage.name === "schedule" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-sub">Fecha: </span>
                            <b className="text-ink">{selectedDate}</b>
                          </div>
                          <div>
                            <span className="text-sub">Hora: </span>
                            <b className="text-ink">{selectedTime}</b>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {stageFields.map((f) => {
                            let displayVal = answers[f.id] || "—";
                            if (f.optionsSource === "static") {
                              const opt = portalFieldOptions.find(
                                (o) => o.fieldId === f.id && o.value === answers[f.id],
                              );
                              if (opt) displayVal = opt.label;
                            }
                            return (
                              <div key={f.id}>
                                <span className="text-sub">{f.label}: </span>
                                <b className="text-ink">{displayVal}</b>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {currentStage?.name === "pet" && clientExistingPets.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4">
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
                      ¿Para cuál de tus mascotas es la atención?
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {clientExistingPets.map((pet) => (
                        <button
                          key={pet.id}
                          type="button"
                          onClick={() => setSelectedPetOption(pet.id)}
                          className="p-2.5 rounded-lg text-left border transition-all text-xs flex items-center justify-between"
                          style={{
                            borderColor: selectedPetOption === pet.id ? primaryColor : T.line,
                            background: selectedPetOption === pet.id ? "#F0FDF4" : "#FFFFFF",
                          }}
                        >
                          <div>
                            <div className="font-semibold text-ink">{pet.name}</div>
                            <div className="text-sub text-[11px]">{pet.species} {pet.breed ? `· ${pet.breed}` : ""}</div>
                          </div>
                          {selectedPetOption === pet.id && <CheckCircle2 size={15} color={primaryColor} />}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setSelectedPetOption("new")}
                        className="p-2.5 rounded-lg text-left border transition-all text-xs flex items-center justify-between"
                        style={{
                          borderColor: selectedPetOption === "new" ? primaryColor : T.line,
                          background: selectedPetOption === "new" ? "#F0FDF4" : "#FFFFFF",
                        }}
                      >
                        <div>
                          <div className="font-semibold text-ink">+ Registrar otra mascota</div>
                          <div className="text-sub text-[11px]">Ingresar datos de una nueva mascota</div>
                        </div>
                        {selectedPetOption === "new" && <CheckCircle2 size={15} color={primaryColor} />}
                      </button>
                    </div>
                  </div>
                )}

                {currentStage?.name === "schedule" && (
                  <div className="space-y-4">
                    <Field label="1. Selecciona la fecha">
                      <Input
                        type="date"
                        value={selectedDate}
                        min={ymd(new Date())}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedTime("");
                        }}
                      />
                    </Field>
                    {fieldErrors.schedule_date && (
                      <p className="text-xs text-red-600 -mt-2 mb-2 font-semibold">
                        {fieldErrors.schedule_date}
                      </p>
                    )}

                    <div>
                      <Field label="2. Horarios disponibles">
                        {availableSlotsForDate.length === 0 ? (
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-sub">
                            No hay horarios disponibles para la fecha seleccionada. Por favor selecciona otro día.
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableSlotsForDate.map((slot) => {
                              const isSelected = selectedTime === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  aria-pressed={isSelected}
                                  onClick={() => setSelectedTime(slot)}
                                  className="py-2.5 px-2 rounded-lg border font-mono text-xs font-semibold transition-all text-center"
                                  style={{
                                    borderColor: isSelected ? primaryColor : T.line,
                                    background: isSelected ? primaryColor : "#FFFFFF",
                                    color: isSelected ? "#FFFFFF" : T.ink,
                                  }}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </Field>
                      {fieldErrors.schedule_time && (
                        <p className="text-xs text-red-600 -mt-2 mb-2 font-semibold">
                          {fieldErrors.schedule_time}
                        </p>
                      )}
                      <p className="text-[11.5px] text-sub mt-1">
                        Duración de la consulta: <b>{availability.slotMinutes} minutos</b>.
                      </p>
                    </div>
                  </div>
                )}

                {fields
                  .filter((f) => f.stageId === currentStage?.id)
                  .map((field) => {
                    if (
                      currentStage?.name === "pet" &&
                      selectedPetOption !== "new" &&
                      field.binding !== "patient.allergies"
                    ) {
                      return null;
                    }
                    if (
                      field.binding === "appointment.date" ||
                      field.binding === "appointment.time" ||
                      field.binding === "appointment.vet"
                    ) {
                      return null;
                    }

                    const val = answers[field.id] || "";
                    const err = fieldErrors[field.id];

                    return (
                      <div key={field.id} className="mb-3">
                        <Field label={`${field.label} ${field.required ? "*" : ""}`}>
                          {field.type === "textarea" ? (
                            <textarea
                              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                              value={val}
                              placeholder={field.placeholder}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            />
                          ) : field.type === "select" ? (
                            <Select
                              value={val}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            >
                              <option value="">Selecciona una opción...</option>
                              {field.optionsSource === "species" ? (
                                <>
                                  <option value="Perro">Perro</option>
                                  <option value="Gato">Gato</option>
                                  <option value="Ave">Ave</option>
                                  <option value="Otro">Otro</option>
                                </>
                              ) : field.optionsSource === "vets" ? (
                                vets.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.name}
                                  </option>
                                ))
                              ) : (
                                portalFieldOptions
                                  .filter((o) => o.fieldId === field.id && o.active)
                                  .map((opt) => (
                                    <option key={opt.id} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))
                              )}
                            </Select>
                          ) : (
                            <Input
                              type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                              value={val}
                              placeholder={field.placeholder}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            />
                          )}
                        </Field>
                        {err && (
                          <p className="text-xs text-red-600 -mt-2 mb-1 font-semibold">{err}</p>
                        )}
                        {field.helpText && (
                          <p className="text-[11.5px] text-sub">{field.helpText}</p>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: T.line }}>
              <Btn kind="ghost" onClick={handleBack}>
                <ArrowLeft size={14} /> Atrás
              </Btn>

              {isReviewStep ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="py-2.5 px-4 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-opacity"
                  style={{
                    background: primaryColor,
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? "wait" : "pointer",
                  }}
                >
                  {isSubmitting ? "Enviando..." : portal.purpose === "booking" ? "Confirmar reserva" : "Enviar solicitud"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="py-2.5 px-4 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-opacity"
                  style={{
                    background: primaryColor,
                    cursor: "pointer",
                  }}
                >
                  Siguiente <ArrowRight size={14} />
                </button>
              )}
            </div>
          </Card>
        )}
      </main>

      {slotTakenModal && (
        <Modal
          title="Horario no disponible"
          onClose={() => setSlotTakenModal(false)}
        >
          <div className="p-4">
            <p className="text-sm text-ink mb-4">
              El horario que habías seleccionado acaba de ser ocupado por otra cita. Por favor selecciona otro horario para completar tu reserva.
            </p>
            <div className="flex justify-end gap-2">
              <Btn
                onClick={() => {
                  setSlotTakenModal(false);
                  const scheduleIdx = stages.findIndex((s) => s.name === "schedule");
                  if (scheduleIdx >= 0) setCurrentStageIndex(scheduleIdx);
                }}
              >
                Elegir otro horario
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      <footer className="w-full py-4 text-center text-xs text-sub border-t" style={{ borderColor: T.line }}>
        Clínica Veterinaria · Plataforma de gestión médica Veti Suite
      </footer>
    </div>
  );
}
