export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  debt: number;
}

export interface Patient {
  id: string;
  clientId: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  sex?: string;
  allergies: string[];
  aggressive: boolean;
}

export interface Vet {
  id: string;
  name: string;
  color: string;
}

export type AppointmentStatus = "pendiente" | "confirmada" | "completada" | "cancelada";
export type AppointmentSource = "staff" | "portal";

export interface Appointment {
  id: string;
  patientId: string;
  vetId: string;
  time: string;
  date?: string;
  reason: string;
  status: AppointmentStatus;
  submissionId?: string;
  source?: AppointmentSource;
}

export type GroomingStatus = "pendiente" | "proceso" | "terminado" | "entregado";

export interface GroomingJob {
  id: string;
  patientId: string;
  service: string;
  price: number;
  belongings: string;
  groomer: string;
  status: GroomingStatus;
  startedAt?: number;
  finishedAt?: number;
  serviceId?: string; // servicio de visita al que pertenece (relación bidireccional)
}

interface AppliedProduct {
  name: string;
  qty: number;
  price: number;
}

interface Prescription {
  med: string;
  dosage: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  vetId: string;
  date: number;
  vitals: { weight: string; temp: string; hr: string };
  anamnesis: string;
  diagnosis: string;
  products: AppliedProduct[];
  prescriptions: Prescription[];
}

/* "anulado": la orden se retiró al quitar su servicio de la visita. No se borra —
   el historial clínico es append-only (ver removeService en app.state). */
export type LabOrderStatus = "solicitado" | "resultado" | "anulado";

export interface LabOrder {
  id: string;
  patientId: string;
  test: string;
  price: number;
  status: LabOrderStatus;
  result: string;
  serviceId?: string; // servicio de visita al que pertenece (relación bidireccional)
}

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  expiry: string;
}

export interface AccountItem {
  desc: string;
  amount: number;
  patientId: string;
  source: BusinessArea;
}

/* ── Visitas (atención): una visita agrupa servicios; cada servicio tiene su propio kanban. ── */
export type ServiceType = "veterinaria" | "peluqueria" | "laboratorio" | "medicamento" | "vacuna";

export interface ServiceItem {
  id: string;
  visitId: string;
  patientId: string;
  type: ServiceType;
  label: string;
  price: number;
  status: string; // columna actual del flujo del tipo (ver SERVICE_FLOWS)
  started: boolean; // false = borrador (aún no está en su módulo); true = ya creado en su módulo
}

export interface Visit {
  id: string;
  clientId: string;
  patientId: string; // mascota de la visita
  createdAt: number;
  started: boolean; // false = en edición (borrador); true = comenzada (ítems en sus módulos)
  invoiceId?: string; // presente = ya facturada (cerrada); la visita queda en solo lectura
}

/* Área de negocio a la que se imputa el ingreso: la comparten Facturación
   (badge del ítem) y Finanzas (agrupación del donut). Ver SERVICE_AREA. */
export type BusinessArea = "Clínica" | "Peluquería" | "Laboratorio";

export type PayMethod = "Efectivo" | "Tarjeta" | "Transferencia";

export interface Invoice {
  id: string;
  num: string;
  clientId: string;
  items: AccountItem[];
  subtotal: number;
  discount: number;
  discountPct: number; // % aplicado, para auditoría (discount guarda el importe)
  iva: number;
  prevDebt: number;
  total: number;
  method: PayMethod;
  date: number;
}

export interface Expense {
  id: string;
  category: string;
  desc: string;
  amount: number;
  date: number;
}

/* ── Disponibilidad: configuración única de toda la clínica (la usan la agenda
   interna y, más adelante, el widget de reservas de cada portal). ── */
export interface TimeRange {
  start: string; // "08:00"
  end: string;   // "13:00"
}

export interface DayAvailability {
  enabled: boolean;
  ranges: TimeRange[];
}

/* Excepción para una fecha concreta: sin rangos = cerrado ese día. */
export interface DateOverride {
  date: string; // "2026-12-25"
  label: string;
  ranges: TimeRange[];
}

export interface Availability {
  timezone: string;
  week: DayAvailability[]; // índice = Date.getDay(): 0 domingo … 6 sábado
  overrides: DateOverride[];
  slotMinutes: number;
  bufferBefore: number;
  bufferAfter: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  maxPerDay: number; // 0 = sin límite
  onlineBooking: boolean;
  autoConfirm: boolean;
}

export type PortalPurpose = "booking" | "capture";
export type PortalStatus = "draft" | "published" | "archived";
export type VetPolicy = "clinic_assigns" | "visitor_chooses";
export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "number"
  | "date"
  | "time_slot"
  | "select"
  | "multiselect"
  | "checkbox";
export type FieldBinding =
  | "client.name"
  | "client.phone"
  | "client.email"
  | "patient.name"
  | "patient.species"
  | "patient.breed"
  | "patient.age"
  | "patient.sex"
  | "patient.allergies"
  | "appointment.date"
  | "appointment.time"
  | "appointment.vet"
  | "appointment.reason";
export type OptionsSource = "static" | "species" | "vets";
export type SubmissionStatus = "received" | "appointment_created" | "captured" | "rejected";
export type RejectionReason =
  | "slot_taken"
  | "outside_availability"
  | "max_per_day"
  | "portal_changed"
  | "portal_closed"
  | "duplicate";

export interface PortalPalette {
  primary: string;
  accent: string;
  bg: string;
}

export interface Portal {
  id: string;
  name: string;
  slug: string;
  purpose: PortalPurpose;
  campaignName?: string;
  status: PortalStatus;
  palette: PortalPalette;
  markdown: string;
  logoUrl: string;
  vetPolicy: VetPolicy;
  defaultVetId?: string;
  defaultReason?: string;
  autoConfirm: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface PortalStage {
  id: string;
  portalId: string;
  name: string;
  title: string;
  description?: string;
  position: number;
  active: boolean;
  deletedAt?: string;
}

export interface PortalField {
  id: string;
  portalId: string;
  stageId: string;
  name: string;
  label: string;
  helpText?: string;
  placeholder?: string;
  type: FieldType;
  binding: FieldBinding | null;
  required: boolean;
  position: number;
  active: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  minDate?: string;
  maxDate?: string;
  optionsSource?: OptionsSource;
  minSelected?: number;
  maxSelected?: number;
  deletedAt?: string;
}

export interface PortalFieldOption {
  id: string;
  fieldId: string;
  value: string;
  label: string;
  position: number;
  active: boolean;
}

export interface PortalSubmission {
  id: string;
  portalId: string;
  idempotencyKey: string;
  status: SubmissionStatus;
  rejectionReason?: RejectionReason;
  needsReview: boolean;
  clientId?: string;
  patientId?: string;
  appointmentId?: string;
  campaignName?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface PortalAnswer {
  id: string;
  submissionId: string;
  fieldId: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  binding: FieldBinding | null;
  stageTitle: string;
  position: number;
  valueText?: string;
  optionId?: string;
  optionLabel?: string;
}

export type ToastType = "ok" | "warn" | "error";
