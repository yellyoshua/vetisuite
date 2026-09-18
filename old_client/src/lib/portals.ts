import { uid } from "@/lib/constants";
import type {
  FieldBinding,
  FieldType,
  OptionsSource,
  Portal,
  PortalField,
  PortalFieldOption,
  PortalPurpose,
  PortalStage,
} from "@/lib/types";

export interface StandardPortalElements {
  stages: PortalStage[];
  fields: PortalField[];
  options: PortalFieldOption[];
}

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function isFieldProtected(field: PortalField, portal?: Portal): boolean {
  if (
    field.binding === "client.name" ||
    field.binding === "client.phone" ||
    field.binding === "patient.name" ||
    field.binding === "appointment.date" ||
    field.binding === "appointment.time"
  ) {
    return true;
  }

  if (field.binding === "appointment.reason" && !portal?.defaultReason) {
    return true;
  }

  return false;
}

export function generateDefaultPortalStructure(
  portalId: string,
  purpose: PortalPurpose = "booking",
  defaultReason?: string,
): StandardPortalElements {
  const stageOwnerId = uid();
  const stagePetId = uid();
  const stageScheduleId = uid();
  const stageReasonId = uid();

  const stages: PortalStage[] = [
    {
      id: stageOwnerId,
      portalId,
      name: "owner",
      title: "Tus datos",
      description: "Identifícate con tu nombre y teléfono de contacto.",
      position: 0,
      active: true,
    },
    {
      id: stagePetId,
      portalId,
      name: "pet",
      title: "Tu mascota",
      description: "Cuéntanos sobre tu mascota que visitará la clínica.",
      position: 1,
      active: true,
    },
  ];

  if (purpose === "booking") {
    stages.push({
      id: stageScheduleId,
      portalId,
      name: "schedule",
      title: "Fecha y hora",
      description: "Selecciona el día y horario que mejor te convenga.",
      position: 2,
      active: true,
    });
  }

  stages.push({
    id: stageReasonId,
    portalId,
    name: "reason",
    title: "Motivo de la visita",
    description: "Detalla brevemente el motivo de tu visita o consulta.",
    position: purpose === "booking" ? 3 : 2,
    active: true,
  });

  const fields: PortalField[] = [];
  const options: PortalFieldOption[] = [];

  const addField = (
    stageId: string,
    name: string,
    label: string,
    type: FieldType,
    binding: FieldBinding | null,
    required: boolean,
    position: number,
    extra: Partial<PortalField> = {},
  ): string => {
    const id = uid();
    fields.push({
      id,
      portalId,
      stageId,
      name,
      label,
      type,
      binding,
      required,
      position,
      active: true,
      ...extra,
    });
    return id;
  };

  addField(stageOwnerId, "client_name", "Nombre y apellido", "text", "client.name", true, 0, {
    placeholder: "Ej: Carolina Ríos",
    minLength: 2,
    maxLength: 120,
  });
  addField(stageOwnerId, "client_phone", "Teléfono celular", "phone", "client.phone", true, 1, {
    placeholder: "Ej: 099 812 3344",
  });
  addField(stageOwnerId, "client_email", "Correo electrónico", "email", "client.email", false, 2, {
    placeholder: "Ej: carolina@correo.com",
  });

  addField(stagePetId, "patient_name", "Nombre de la mascota", "text", "patient.name", true, 0, {
    placeholder: "Ej: Max",
    minLength: 1,
    maxLength: 60,
  });
  addField(stagePetId, "patient_species", "Especie", "select", "patient.species", true, 1, {
    optionsSource: "species" as OptionsSource,
  });
  addField(stagePetId, "patient_breed", "Raza", "text", "patient.breed", false, 2, {
    placeholder: "Ej: Golden Retriever / Mestizo",
    maxLength: 80,
  });
  addField(stagePetId, "patient_age", "Edad aproximada", "text", "patient.age", false, 3, {
    placeholder: "Ej: 2 años / 6 meses",
    maxLength: 40,
  });

  const sexFieldId = addField(stagePetId, "patient_sex", "Sexo", "select", "patient.sex", false, 4, {
    optionsSource: "static" as OptionsSource,
  });
  options.push(
    { id: uid(), fieldId: sexFieldId, value: "M", label: "Macho", position: 0, active: true },
    { id: uid(), fieldId: sexFieldId, value: "H", label: "Hembra", position: 1, active: true },
  );

  addField(stagePetId, "patient_allergies", "Alergias o notas médicas conocidas", "textarea", "patient.allergies", false, 5, {
    placeholder: "Indica si tiene alergias a medicamentos, alimentos o condiciones previas.",
    maxLength: 300,
  });

  if (purpose === "booking") {
    addField(stageScheduleId, "appointment_date", "Fecha de la cita", "date", "appointment.date", true, 0);
    addField(stageScheduleId, "appointment_time", "Horario disponible", "time_slot", "appointment.time", true, 1);
  }

  addField(stageReasonId, "appointment_reason", "Motivo de la cita", "textarea", "appointment.reason", !defaultReason, 0, {
    placeholder: defaultReason || "Describe los síntomas, chequeo de rutina o servicio requerido.",
    maxLength: 300,
    helpText: defaultReason ? `Motivo predeterminado: ${defaultReason}` : undefined,
  });

  return { stages, fields, options };
}

export function validateFieldValue(field: PortalField, rawValue: string | undefined): string | null {
  const val = (rawValue ?? "").trim();
  if (field.required && !val) {
    return `El campo "${field.label}" es obligatorio.`;
  }

  if (!val) return null;

  if (field.type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      return "Ingresa un correo electrónico válido.";
    }
  }

  if (field.type === "phone") {
    const digits = normalizePhone(val);
    if (digits.length < 7) {
      return "Ingresa un número telefónico válido (mínimo 7 dígitos).";
    }
  }

  if (field.type === "number") {
    const num = Number(val);
    if (Number.isNaN(num)) {
      return "Ingresa un valor numérico válido.";
    }
    if (field.minValue !== undefined && num < field.minValue) {
      return `El valor mínimo es ${field.minValue}.`;
    }
    if (field.maxValue !== undefined && num > field.maxValue) {
      return `El valor máximo es ${field.maxValue}.`;
    }
  }

  if (field.type === "text" || field.type === "textarea") {
    if (field.minLength !== undefined && val.length < field.minLength) {
      return `Debe tener al menos ${field.minLength} caracteres.`;
    }
    if (field.maxLength !== undefined && val.length > field.maxLength) {
      return `No puede superar los ${field.maxLength} caracteres.`;
    }
  }

  return null;
}
