import { create } from "zustand";
import { GROOM_SERVICES, LAB_TESTS, SERVICE_AREA, SERVICE_FLOWS, isOpenVisit, isServiceDone, money, round2, uid } from "@/lib/constants";
import { DEFAULT_AVAILABILITY, slotsForDate, validateAvailability, ymd } from "@/lib/availability";
import { generateDefaultPortalStructure, isFieldProtected, normalizePhone, validateFieldValue } from "@/lib/portals";
import { showToast } from "@/components/toast";
import type {
  AccountItem, Appointment, AppointmentStatus, Availability, Client, Expense, GroomingJob,
  GroomingStatus, Invoice, LabOrder, MedicalRecord, Patient, PayMethod, Portal, PortalAnswer,
  PortalField, PortalFieldOption, PortalStage, PortalStatus, PortalSubmission,
  Product, RejectionReason, ServiceItem, ServiceType, SubmissionStatus, ToastType, Vet, Visit,
} from "@/lib/types";

interface VetState {
  notify: (type: ToastType, msg: string) => void;

  vets: Vet[];
  clients: Client[];
  patients: Patient[];
  addClient: (data: Pick<Client, "name" | "phone" | "email">) => string;
  updateClient: (id: string, data: Pick<Client, "name" | "phone" | "email">) => void;
  addPatient: (data: Omit<Patient, "id">) => void;
  updatePatient: (id: string, data: Omit<Patient, "id" | "clientId">) => void;

  availability: Availability;
  updateAvailability: (data: Availability) => boolean;

  appointments: Appointment[];
  createAppointment: (data: Pick<Appointment, "patientId" | "vetId" | "time" | "reason">) => boolean;
  updateAppointment: (id: string, data: Pick<Appointment, "vetId" | "time" | "reason">) => boolean;
  setAppointmentStatus: (id: string, status: AppointmentStatus) => void;

  grooming: GroomingJob[];
  checkInGrooming: (data: Pick<GroomingJob, "patientId" | "service" | "belongings" | "groomer">) => void;
  moveGrooming: (id: string, to: GroomingStatus) => void;

  records: MedicalRecord[];
  labOrders: LabOrder[];
  createRecord: (data: Pick<MedicalRecord, "patientId" | "vetId" | "vitals" | "anamnesis" | "diagnosis">) => string;
  applyProduct: (recordId: string, patientId: string, productId: string, qty: number) => void;
  orderLab: (patientId: string, test: string) => void;
  loadLabResult: (orderId: string, result: string) => void;
  addPrescription: (recordId: string, patientId: string, med: string, dosage: string) => void;

  inventory: Product[];
  addProduct: (data: Omit<Product, "id">) => void;
  updateProduct: (id: string, data: Omit<Product, "id" | "stock">) => void;
  restock: (id: string, qty: number) => void;

  visits: Visit[];
  services: ServiceItem[];
  openVisit: (clientId: string, patientId: string) => string;
  addService: (visitId: string, data: { type: ServiceType; label: string; price: number; patientId: string }) => void;
  startVisit: (visitId: string) => void;
  discardVisit: (id: string) => void;
  advanceService: (id: string) => void;
  removeService: (id: string) => void;
  chargeToVisit: (clientId: string, patientId: string, data: { type: ServiceType; label: string; price: number }) => void;
  invoices: Invoice[];
  invoiceSeq: number; // correlativo monotónico de facturas
  billVisit: (visitId: string, opts: { discount: number; discountPct: number; ivaRate: number; method: PayMethod }) => string;

  expenses: Expense[];
  addExpense: (data: Pick<Expense, "category" | "desc" | "amount">) => void;
  removeExpense: (id: string) => void;

  portals: Portal[];
  portalStages: PortalStage[];
  portalFields: PortalField[];
  portalFieldOptions: PortalFieldOption[];
  portalSubmissions: PortalSubmission[];
  portalAnswers: PortalAnswer[];

  addPortal: (data: Omit<Portal, "id" | "createdAt" | "updatedAt">) => string;
  updatePortal: (id: string, data: Partial<Omit<Portal, "id">>) => boolean;
  archivePortal: (id: string) => void;
  removePortal: (id: string) => boolean;
  resetPortalToDefaults: (portalId: string) => void;

  addStage: (portalId: string, data: { name: string; title: string; description?: string }) => string;
  updateStage: (id: string, data: Partial<Pick<PortalStage, "title" | "description" | "active">>) => boolean;
  deleteStage: (id: string) => boolean;
  reorderStages: (portalId: string, orderedIds: string[]) => void;

  addField: (
    portalId: string,
    stageId: string,
    data: Omit<PortalField, "id" | "portalId" | "stageId" | "position" | "deletedAt">,
    staticOptions?: { value: string; label: string }[],
  ) => string;
  updateField: (id: string, data: Partial<Omit<PortalField, "id" | "portalId" | "stageId" | "deletedAt">>) => boolean;
  deleteField: (id: string) => boolean;
  reorderFields: (stageId: string, orderedIds: string[]) => void;

  addFieldOption: (fieldId: string, data: { value: string; label: string }) => string;
  toggleFieldOption: (id: string, active: boolean) => void;

  submitPortal: (payload: {
    portalId: string;
    idempotencyKey: string;
    answers: Record<string, string>;
    selectedDate?: string;
    selectedTime?: string;
    selectedVetId?: string;
    selectedPatientId?: string;
  }) => {
    success: boolean;
    submission?: PortalSubmission;
    appointment?: Appointment;
    error?: string;
    rejectionReason?: RejectionReason;
  };
  reviewSubmission: (id: string) => void;
}

const initialPortals: Portal[] = [
  {
    id: "po1",
    name: "Portal de la clínica",
    slug: "clinica",
    purpose: "booking",
    status: "published",
    palette: { primary: "#186653", accent: "#C9A227", bg: "#FFFFFF" },
    logoUrl: "https://placehold.co/120x120/186653/fff?text=Veti",
    markdown: "# Clínica Veterinaria\n\nAtendemos de **lunes a sábado**, 08:00–18:00.\n\n- Consulta médica\n- Vacunación\n- Peluquería y estética\n\nAgenda tu cita en línea seleccionando el día y horario de tu preferencia.",
    vetPolicy: "clinic_assigns",
    defaultVetId: "v1",
    defaultReason: "",
    autoConfirm: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "po2",
    name: "Campaña de vacunación",
    slug: "vacunacion-2026",
    purpose: "booking",
    campaignName: "Vacunación 2026",
    status: "published",
    palette: { primary: "#2C6E8F", accent: "#E4572E", bg: "#F5F9FB" },
    logoUrl: "",
    markdown: "# Campaña de vacunación\n\nSéxtuple y antirrábica con **20% de descuento** durante todo el mes.\n\nElige el especialista y horario de tu preferencia.",
    vetPolicy: "visitor_chooses",
    defaultReason: "Vacunación Séxtuple y Antirrábica",
    autoConfirm: true,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const po1Struct = generateDefaultPortalStructure("po1", "booking");
const po2Struct = generateDefaultPortalStructure("po2", "booking", "Vacunación Séxtuple y Antirrábica");

const initialStages: PortalStage[] = [...po1Struct.stages, ...po2Struct.stages];
const initialFields: PortalField[] = [...po1Struct.fields, ...po2Struct.fields];
const initialOptions: PortalFieldOption[] = [...po1Struct.options, ...po2Struct.options];

const initialSubmissions: PortalSubmission[] = [
  {
    id: "sub-1",
    portalId: "po1",
    idempotencyKey: "idem-po1-c1",
    status: "appointment_created",
    needsReview: false,
    clientId: "c1",
    patientId: "p1",
    appointmentId: "a1",
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "sub-2",
    portalId: "po2",
    idempotencyKey: "idem-po2-c2",
    status: "appointment_created",
    needsReview: true,
    clientId: "c2",
    patientId: "p3",
    appointmentId: "a2",
    campaignName: "Vacunación 2026",
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

const initialAnswers: PortalAnswer[] = [
  {
    id: "ans-1",
    submissionId: "sub-1",
    fieldId: po1Struct.fields.find((f) => f.name === "client_name")?.id || "f-cname-1",
    fieldName: "client_name",
    fieldLabel: "Nombre y apellido",
    fieldType: "text",
    binding: "client.name",
    stageTitle: "Tus datos",
    position: 0,
    valueText: "Carolina Ríos",
  },
  {
    id: "ans-2",
    submissionId: "sub-1",
    fieldId: po1Struct.fields.find((f) => f.name === "client_phone")?.id || "f-cphone-1",
    fieldName: "client_phone",
    fieldLabel: "Teléfono celular",
    fieldType: "phone",
    binding: "client.phone",
    stageTitle: "Tus datos",
    position: 1,
    valueText: "099 812 3344",
  },
  {
    id: "ans-3",
    submissionId: "sub-1",
    fieldId: po1Struct.fields.find((f) => f.name === "patient_name")?.id || "f-pname-1",
    fieldName: "patient_name",
    fieldLabel: "Nombre de la mascota",
    fieldType: "text",
    binding: "patient.name",
    stageTitle: "Tu mascota",
    position: 0,
    valueText: "Max",
  },
  {
    id: "ans-4",
    submissionId: "sub-1",
    fieldId: po1Struct.fields.find((f) => f.name === "appointment_time")?.id || "f-atime-1",
    fieldName: "appointment_time",
    fieldLabel: "Horario disponible",
    fieldType: "time_slot",
    binding: "appointment.time",
    stageTitle: "Fecha y hora",
    position: 1,
    valueText: "09:00",
  },
  {
    id: "ans-5",
    submissionId: "sub-1",
    fieldId: po1Struct.fields.find((f) => f.name === "appointment_reason")?.id || "f-areason-1",
    fieldName: "appointment_reason",
    fieldLabel: "Motivo de la cita",
    fieldType: "textarea",
    binding: "appointment.reason",
    stageTitle: "Motivo de la visita",
    position: 0,
    valueText: "Vacunación anual",
  },
  {
    id: "ans-6",
    submissionId: "sub-2",
    fieldId: po2Struct.fields.find((f) => f.name === "client_name")?.id || "f-cname-2",
    fieldName: "client_name",
    fieldLabel: "Nombre y apellido",
    fieldType: "text",
    binding: "client.name",
    stageTitle: "Tus datos",
    position: 0,
    valueText: "Marco A. Salazar",
  },
  {
    id: "ans-7",
    submissionId: "sub-2",
    fieldId: po2Struct.fields.find((f) => f.name === "client_phone")?.id || "f-cphone-2",
    fieldName: "client_phone",
    fieldLabel: "Teléfono celular",
    fieldType: "phone",
    binding: "client.phone",
    stageTitle: "Tus datos",
    position: 1,
    valueText: "098 455 1290",
  },
  {
    id: "ans-8",
    submissionId: "sub-2",
    fieldId: po2Struct.fields.find((f) => f.name === "patient_name")?.id || "f-pname-2",
    fieldName: "patient_name",
    fieldLabel: "Nombre de la mascota",
    fieldType: "text",
    binding: "patient.name",
    stageTitle: "Tu mascota",
    position: 0,
    valueText: "Rocky",
  },
  {
    id: "ans-9",
    submissionId: "sub-2",
    fieldId: po2Struct.fields.find((f) => f.name === "appointment_time")?.id || "f-atime-2",
    fieldName: "appointment_time",
    fieldLabel: "Horario disponible",
    fieldType: "time_slot",
    binding: "appointment.time",
    stageTitle: "Fecha y hora",
    position: 1,
    valueText: "10:00",
  },
  {
    id: "ans-10",
    submissionId: "sub-2",
    fieldId: po2Struct.fields.find((f) => f.name === "appointment_reason")?.id || "f-areason-2",
    fieldName: "appointment_reason",
    fieldLabel: "Motivo de la cita",
    fieldType: "textarea",
    binding: "appointment.reason",
    stageTitle: "Motivo de la visita",
    position: 0,
    valueText: "Vacunación Séxtuple y Antirrábica",
  },
];

export const useVetStore = create<VetState>((set, get) => ({
  // Las notificaciones no son estado de la app: las gestiona sonner (`components/toast`).
  notify: (type, msg) => showToast(type, msg),

  vets: [
    { id: "v1", name: "Dra. María Torres", color: "#186653" },
    { id: "v2", name: "Dr. Andrés Vela", color: "#2C6E8F" },
    { id: "v3", name: "Dra. Lucía Páez", color: "#8A5A2B" },
  ],

  clients: [
    { id: "c1", name: "Carolina Ríos", phone: "099 812 3344", email: "caro.rios@mail.com", debt: 0 },
    { id: "c2", name: "Marco Salazar", phone: "098 455 1290", email: "msalazar@mail.com", debt: 45.5 },
    { id: "c3", name: "Elena Buitrón", phone: "096 233 8710", email: "elenab@mail.com", debt: 0 },
    { id: "c4", name: "Jorge Paredes", phone: "099 640 7782", email: "jparedes@mail.com", debt: 0 },
    { id: "c5", name: "Ana Cevallos", phone: "098 120 4455", email: "anacevallos@mail.com", debt: 0 },
    { id: "c6", name: "Diego Mora", phone: "099 331 9021", email: "dmora@mail.com", debt: 0 },
    { id: "c7", name: "Paula Andrade", phone: "096 780 1123", email: "pandrade@mail.com", debt: 12 },
    { id: "c8", name: "Luis Chiriboga", phone: "098 555 6640", email: "lchiriboga@mail.com", debt: 0 },
    { id: "c9", name: "María Fernanda Ortiz", phone: "099 218 7734", email: "mfortiz@mail.com", debt: 0 },
    { id: "c10", name: "Andrés Cabrera", phone: "096 902 3318", email: "acabrera@mail.com", debt: 0 },
    { id: "c11", name: "Valeria Suárez", phone: "098 447 2210", email: "vsuarez@mail.com", debt: 0 },
    { id: "c12", name: "Ricardo Peña", phone: "099 763 5502", email: "rpena@mail.com", debt: 0 },
  ],
  patients: [
    { id: "p1", clientId: "c1", name: "Max", species: "Perro", breed: "Golden Retriever", age: "4 años", sex: "M", allergies: ["Penicilina"], aggressive: false },
    { id: "p2", clientId: "c1", name: "Luna", species: "Gato", breed: "Mestizo", age: "2 años", sex: "H", allergies: [], aggressive: false },
    { id: "p3", clientId: "c2", name: "Rocky", species: "Perro", breed: "Pitbull", age: "5 años", sex: "M", allergies: [], aggressive: true },
    { id: "p4", clientId: "c3", name: "Kiwi", species: "Ave", breed: "Perico australiano", age: "1 año", sex: "M", allergies: [], aggressive: false },
    { id: "p5", clientId: "c4", name: "Nala", species: "Perro", breed: "Poodle", age: "7 años", sex: "H", allergies: ["Sensibilidad a anestesia"], aggressive: false },
    { id: "p6", clientId: "c5", name: "Toby", species: "Perro", breed: "Beagle", age: "3 años", sex: "M", allergies: [], aggressive: false },
    { id: "p7", clientId: "c6", name: "Michi", species: "Gato", breed: "Siamés", age: "4 años", sex: "H", allergies: [], aggressive: false },
    { id: "p8", clientId: "c7", name: "Simba", species: "Gato", breed: "Naranja mestizo", age: "2 años", sex: "M", allergies: [], aggressive: false },
    { id: "p9", clientId: "c8", name: "Bruno", species: "Perro", breed: "Schnauzer", age: "6 años", sex: "M", allergies: [], aggressive: false },
    { id: "p10", clientId: "c9", name: "Coco", species: "Ave", breed: "Cacatúa ninfa", age: "2 años", sex: "H", allergies: [], aggressive: false },
    { id: "p11", clientId: "c10", name: "Maya", species: "Perro", breed: "Labrador", age: "1 año", sex: "H", allergies: [], aggressive: false },
    { id: "p12", clientId: "c11", name: "Félix", species: "Gato", breed: "Persa", age: "5 años", sex: "M", allergies: ["Ácaros"], aggressive: false },
    { id: "p13", clientId: "c12", name: "Thor", species: "Perro", breed: "Husky", age: "3 años", sex: "M", allergies: [], aggressive: true },
  ],
  addClient: (data) => {
    const client = { id: uid(), debt: 0, ...data };
    set((s) => ({ clients: [...s.clients, client] }));
    get().notify("ok", `Cliente ${client.name} creado.`);
    return client.id;
  },
  updateClient: (id, data) => {
    set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...data } : c)) }));
    get().notify("ok", `Cliente ${data.name} actualizado.`);
  },
  addPatient: (data) => {
    const patient = { id: uid(), ...data };
    set((s) => ({ patients: [...s.patients, patient] }));
    get().notify("ok", `Paciente ${patient.name} registrado y vinculado al cliente.`);
  },
  updatePatient: (id, data) => {
    set((s) => ({ patients: s.patients.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
    get().notify("ok", `Paciente ${data.name} actualizado.`);
  },

  availability: DEFAULT_AVAILABILITY,
  updateAvailability: (data) => {
    const problem = validateAvailability(data);
    if (problem) { get().notify("error", problem); return false; }
    set(() => ({ availability: data }));
    get().notify("ok", "Disponibilidad de la clínica actualizada.");
    return true;
  },

  appointments: [
    { id: "a1", patientId: "p1", vetId: "v1", time: "09:00", reason: "Vacunación anual", status: "confirmada", source: "portal", submissionId: "sub-1" },
    { id: "a2", patientId: "p3", vetId: "v2", time: "10:00", reason: "Control dermatológico", status: "pendiente", source: "portal", submissionId: "sub-2" },
    { id: "a3", patientId: "p5", vetId: "v1", time: "11:00", reason: "Chequeo geriátrico", status: "confirmada", source: "staff" },
    { id: "a4", patientId: "p2", vetId: "v3", time: "15:00", reason: "Desparasitación", status: "pendiente", source: "staff" },
  ],
  createAppointment: ({ patientId, vetId, time, reason }) => {
    const st = get();
    const clash = st.appointments.find((a) => a.vetId === vetId && a.time === time && a.status !== "cancelada");
    if (clash) { get().notify("error", "Ese médico ya tiene una cita en ese horario."); return false; }
    if (!slotsForDate(st.availability, new Date()).includes(time)) {
      get().notify("error", `Las ${time} están fuera del horario de atención configurado.`);
      return false;
    }
    // La agenda demo es de un solo día: "citas por día" = todas las citas vivas del store.
    const active = st.appointments.filter((a) => a.status !== "cancelada").length;
    if (st.availability.maxPerDay > 0 && active >= st.availability.maxPerDay) {
      get().notify("error", `Se alcanzó el máximo de ${st.availability.maxPerDay} citas por día.`);
      return false;
    }
    const patient = st.patients.find((p) => p.id === patientId)!;
    const vet = st.vets.find((v) => v.id === vetId)!;
    const status: AppointmentStatus = st.availability.autoConfirm ? "confirmada" : "pendiente";
    set((s) => ({ appointments: [...s.appointments, { id: uid(), patientId, vetId, time, reason, status, source: "staff" }] }));
    if (status === "confirmada") get().notify("ok", `Cita confirmada para ${patient.name} hoy ${time} con ${vet.name}.`);
    else get().notify("ok", `Cita agendada para ${patient.name} hoy ${time} con ${vet.name}. Queda pendiente de confirmar.`);
    return true;
  },
  updateAppointment: (id, data) => {
    const st = get();
    // Una cita cerrada no se reprograma, ni escribiendo la URL a mano.
    const current = st.appointments.find((a) => a.id === id)!;
    if (current.status === "cancelada" || current.status === "completada") {
      get().notify("error", `La cita está ${current.status} y ya no se puede reprogramar.`);
      return false;
    }
    const clash = st.appointments.find((a) => a.id !== id && a.vetId === data.vetId && a.time === data.time && a.status !== "cancelada");
    if (clash) { get().notify("error", "Ese médico ya tiene una cita en ese horario."); return false; }
    // Mover la cita exige un horario válido; conservar el suyo no, aunque el horario haya cambiado después.
    if (data.time !== current.time && !slotsForDate(st.availability, new Date()).includes(data.time)) {
      get().notify("error", `Las ${data.time} están fuera del horario de atención configurado.`);
      return false;
    }
    set((s) => ({ appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...data } : a)) }));
    get().notify("ok", "Cita reprogramada correctamente.");
    return true;
  },
  setAppointmentStatus: (id, status) => {
    const st = get();
    const appt = st.appointments.find((x) => x.id === id)!;
    const patient = st.patients.find((p) => p.id === appt.patientId)!;
    set((s) => ({ appointments: s.appointments.map((x) => (x.id === id ? { ...x, status } : x)) }));
    if (status === "confirmada") get().notify("ok", `Cita de ${patient.name} (${appt.time}) confirmada.`);
    if (status === "cancelada") get().notify("warn", `Cita de ${appt.time} cancelada. Espacio liberado — avisar a lista de espera.`);
    if (status === "completada") get().notify("ok", `Cita de ${patient.name} marcada como atendida.`);
  },

  grooming: [
    { id: "g1", patientId: "p2", service: "Baño completo", price: 18, belongings: "Collar rosado", status: "pendiente", groomer: "Sofía" },
    { id: "g2", patientId: "p5", service: "Corte + baño", price: 28, belongings: "Correa roja, juguete", status: "proceso", groomer: "David", startedAt: Date.now() - 22 * 60000 },
  ],
  // Check-in de estética (walk-in): crea el servicio ya comenzado + su tarjeta en el tablero, enlazados.
  checkInGrooming: ({ patientId, service, belongings, groomer }) => {
    const st = get();
    const patient = st.patients.find((p) => p.id === patientId)!;
    const visitId = st.openVisit(patient.clientId, patientId);
    const serviceId = uid();
    const svc: ServiceItem = { id: serviceId, visitId, patientId, type: "peluqueria", label: service, price: GROOM_SERVICES[service], status: "pendiente", started: true };
    set((s) => ({
      services: [...s.services, svc],
      grooming: [...s.grooming, { id: uid(), serviceId, patientId, service, price: GROOM_SERVICES[service], belongings, groomer, status: "pendiente" as const }],
      visits: s.visits.map((v) => (v.id === visitId ? { ...v, started: true } : v)),
    }));
    get().notify("ok", "Check-in de estética registrado y añadido a la visita.");
  },
  moveGrooming: (id, to) => {
    const st = get();
    const job = st.grooming.find((x) => x.id === id)!;
    const patient = st.patients.find((p) => p.id === job.patientId)!;
    const owner = st.clients.find((c) => c.id === patient.clientId)!;
    // El estado del tablero de peluquería es la fuente de verdad; el servicio de la visita lo refleja.
    const svcCol = to === "proceso" ? "en proceso" : to === "pendiente" ? "pendiente" : "terminado";
    set((s) => ({
      grooming: s.grooming.map((x) => (x.id === id ? { ...x, status: to, ...(to === "proceso" ? { startedAt: Date.now() } : {}), ...(to === "terminado" ? { finishedAt: Date.now() } : {}) } : x)),
      services: job.serviceId ? s.services.map((sv) => (sv.id === job.serviceId ? { ...sv, status: svcCol } : sv)) : s.services,
    }));
    // Fallback para trabajos sin visita enlazada (semilla / walk-in previos): crea el servicio ya terminado.
    if (to === "terminado" && !job.serviceId) {
      get().chargeToVisit(owner.id, job.patientId, { type: "peluqueria", label: `Estética: ${job.service}`, price: job.price });
    }
    if (to === "terminado") get().notify("ok", `${patient.name} está listo. El servicio quedó cargado a la visita de ${owner.name}.`);
    if (to === "entregado") get().notify("ok", `${patient.name} entregado. El servicio quedó terminado en la visita de ${owner.name}.`);
  },

  records: [
    {
      id: "r1", patientId: "p1", vetId: "v1", date: Date.now() - 86400000 * 34,
      vitals: { weight: "28.4 kg", temp: "38.6 °C", hr: "92 lpm" },
      anamnesis: "Control de rutina. Dueña reporta apetito y actividad normales.",
      diagnosis: "Paciente sano. Se recomienda refuerzo de vacuna séxtuple en próxima visita.",
      products: [], prescriptions: [],
    },
  ],
  labOrders: [
    { id: "l1", patientId: "p3", test: "Hemograma completo", price: 22, status: "solicitado", result: "" },
  ],
  createRecord: (data) => {
    const st = get();
    const patient = st.patients.find((p) => p.id === data.patientId)!;
    const record = { id: uid(), date: Date.now(), products: [], prescriptions: [], ...data };
    // Orden descendente por fecha (no por orden de inserción): la primera es la más reciente.
    set((s) => ({ records: [record, ...s.records].sort((a, b) => b.date - a.date) }));
    // El cargo de la consulta lo lleva el servicio de veterinaria de la visita (creado en el check-in), no el expediente.
    get().notify("ok", `Consulta guardada en el expediente de ${patient.name}.`);
    return record.id;
  },
  applyProduct: (recordId, patientId, productId, qty) => {
    const st = get();
    const product = st.inventory.find((p) => p.id === productId);
    if (!product || product.stock < qty) { get().notify("error", `Stock insuficiente de ${product ? product.name : "producto"}.`); return; }
    const patient = st.patients.find((p) => p.id === patientId)!;
    set((s) => ({
      inventory: s.inventory.map((p) => (p.id === productId ? { ...p, stock: p.stock - qty } : p)),
      records: s.records.map((r) => (r.id === recordId ? { ...r, products: [...r.products, { name: product.name, qty, price: product.price }] } : r)),
    }));
    get().chargeToVisit(patient.clientId, patientId, { type: "medicamento", label: `${product.name} ×${qty}`, price: product.price * qty });
    const after = get().inventory.find((p) => p.id === productId)!;
    if (after.stock <= after.minStock) get().notify("warn", `Stock bajo: ${after.name} (${after.stock} uds). Generar orden de compra.`);
    get().notify("ok", `${product.name} descontado del inventario y cargado a la cuenta del cliente.`);
  },
  // Orden de laboratorio (desde clínica): crea el servicio ya comenzado + la orden en su módulo, enlazados.
  orderLab: (patientId, test) => {
    const st = get();
    const patient = st.patients.find((p) => p.id === patientId)!;
    const visitId = st.openVisit(patient.clientId, patientId);
    const serviceId = uid();
    const svc: ServiceItem = { id: serviceId, visitId, patientId, type: "laboratorio", label: test, price: LAB_TESTS[test], status: "solicitado", started: true };
    set((s) => ({
      services: [...s.services, svc],
      labOrders: [{ id: uid(), serviceId, patientId, test, price: LAB_TESTS[test], status: "solicitado" as const, result: "" }, ...s.labOrders],
      visits: s.visits.map((v) => (v.id === visitId ? { ...v, started: true } : v)),
    }));
    get().notify("ok", `Orden de laboratorio generada: ${test}.`);
  },
  loadLabResult: (orderId, result) => {
    const st = get();
    const order = st.labOrders.find((x) => x.id === orderId)!;
    const patient = st.patients.find((p) => p.id === order.patientId)!;
    // Cargar el resultado deja el laboratorio en su columna final; el servicio de la visita lo refleja.
    set((s) => ({
      labOrders: s.labOrders.map((x) => (x.id === orderId ? { ...x, status: "resultado" as const, result } : x)),
      services: order.serviceId ? s.services.map((sv) => (sv.id === order.serviceId ? { ...sv, status: "resultado" } : sv)) : s.services,
    }));
    // Fallback para órdenes sin servicio enlazado (semilla), simétrico al de peluquería: si no, el examen nunca se cobra.
    if (!order.serviceId) {
      get().chargeToVisit(patient.clientId, order.patientId, { type: "laboratorio", label: `Laboratorio: ${order.test}`, price: order.price });
    }
    get().notify("ok", `Resultado de ${order.test} (${patient.name}) disponible. Se alertó al médico tratante.`);
  },
  addPrescription: (recordId, patientId, med, dosage) => {
    const st = get();
    const patient = st.patients.find((p) => p.id === patientId)!;
    set((s) => ({ records: s.records.map((r) => (r.id === recordId ? { ...r, prescriptions: [...r.prescriptions, { med, dosage }] } : r)) }));
    get().notify("ok", `Receta firmada y guardada en el expediente de ${patient.name}.`);
  },

  inventory: [
    { id: "i1", name: "Vacuna Séxtuple", category: "Vacunas", stock: 8, minStock: 5, price: 18.5, expiry: "2026-09-15" },
    { id: "i2", name: "Vacuna Antirrábica", category: "Vacunas", stock: 3, minStock: 5, price: 12, expiry: "2026-11-01" },
    { id: "i3", name: "Desparasitante oral", category: "Medicamentos", stock: 25, minStock: 10, price: 8.75, expiry: "2027-01-20" },
    { id: "i4", name: "Amoxicilina 250 mg", category: "Medicamentos", stock: 14, minStock: 8, price: 6.4, expiry: "2026-08-01" },
    { id: "i5", name: "Shampoo medicado", category: "Estética", stock: 6, minStock: 4, price: 15, expiry: "2027-06-30" },
    { id: "i6", name: "Alimento premium 2 kg", category: "Alimentos", stock: 12, minStock: 6, price: 22.9, expiry: "2027-03-10" },
  ],
  addProduct: (data) => {
    set((s) => ({ inventory: [...s.inventory, { id: uid(), ...data }] }));
    get().notify("ok", `Producto "${data.name}" ingresado al inventario.`);
  },
  updateProduct: (id, { name, category, minStock, price, expiry }) => {
    // Campos explícitos: el stock nunca se edita a mano (solo restock / applyProduct).
    set((s) => ({ inventory: s.inventory.map((p) => (p.id === id ? { ...p, name, category, minStock, price, expiry } : p)) }));
    get().notify("ok", `Producto "${name}" actualizado.`);
  },
  restock: (id, qty) => {
    if (qty <= 0) return;
    set((s) => ({ inventory: s.inventory.map((p) => (p.id === id ? { ...p, stock: p.stock + qty } : p)) }));
    const product = get().inventory.find((x) => x.id === id)!;
    get().notify("ok", `Lote ingresado: +${qty} uds de ${product.name} (stock: ${product.stock}).`);
  },

  // Visita semilla ya comenzada: Elena (c3) / Kiwi (p4) con una consulta en curso — demuestra el kanban de veterinaria.
  visits: [
    { id: "vis1", clientId: "c3", patientId: "p4", createdAt: Date.now() - 1800000, started: true },
  ],
  services: [
    { id: "sv1", visitId: "vis1", patientId: "p4", type: "veterinaria", label: "Consulta médica", price: 25, status: "en consulta", started: true },
  ],
  openVisit: (clientId, patientId) => {
    const existing = get().visits.find((v) => v.clientId === clientId && isOpenVisit(v));
    if (existing) return existing.id;
    const id = uid();
    set((s) => ({ visits: [...s.visits, { id, clientId, patientId, createdAt: Date.now(), started: false }] }));
    return id;
  },
  // En edición se agrega como BORRADOR: aún no toca ningún módulo (eso ocurre al "Comenzar").
  addService: (visitId, { type, label, price, patientId }) => {
    const status = SERVICE_FLOWS[type].columns[0];
    set((s) => ({ services: [...s.services, { id: uid(), visitId, patientId, type, label, price, status, started: false }] }));
    get().notify("ok", `${label} agregado a la visita.`);
  },
  // "Comenzar": crea cada servicio borrador en su módulo con su estado inicial y marca la visita como comenzada.
  startVisit: (visitId) => {
    const drafts = get().services.filter((sv) => sv.visitId === visitId && !sv.started);
    set((s) => {
      let grooming = s.grooming;
      let labOrders = s.labOrders;
      drafts.forEach((sv) => {
        if (sv.type === "peluqueria") grooming = [...grooming, { id: uid(), serviceId: sv.id, patientId: sv.patientId, service: sv.label, price: sv.price, belongings: "", groomer: "Sofía", status: "pendiente" as const }];
        if (sv.type === "laboratorio") labOrders = [{ id: uid(), serviceId: sv.id, patientId: sv.patientId, test: sv.label, price: sv.price, status: "solicitado" as const, result: "" }, ...labOrders];
      });
      return {
        grooming, labOrders,
        services: s.services.map((sv) => (sv.visitId === visitId ? { ...sv, started: true } : sv)),
        visits: s.visits.map((v) => (v.id === visitId ? { ...v, started: true } : v)),
      };
    });
    get().notify("ok", "Visita comenzada. Los servicios están en sus módulos.");
  },
  // Descartar una visita solo es posible mientras esté vacía: nunca borra servicios ni facturas.
  discardVisit: (id) => {
    const visit = get().visits.find((v) => v.id === id);
    if (!visit) return;
    if (get().services.some((sv) => sv.visitId === id)) {
      get().notify("error", "La visita tiene servicios: quítalos antes de descartarla.");
      return;
    }
    set((s) => ({ visits: s.visits.filter((v) => v.id !== id) }));
    get().notify("warn", "Visita descartada.");
  },
  advanceService: (id) => {
    const sv = get().services.find((x) => x.id === id);
    if (!sv) return;
    // Peluquería y laboratorio tienen tablero propio: ahí está la fuente de verdad.
    if (sv.type === "peluqueria" || sv.type === "laboratorio") {
      get().notify("warn", `"${sv.label}" se avanza desde ${SERVICE_FLOWS[sv.type].label}, no desde la visita.`);
      return;
    }
    const cols = SERVICE_FLOWS[sv.type].columns;
    const next = cols[Math.min(cols.indexOf(sv.status) + 1, cols.length - 1)];
    set((s) => ({ services: s.services.map((x) => (x.id === id ? { ...x, status: next } : x)) }));
    if (next === cols[cols.length - 1]) get().notify("ok", `${sv.label} finalizado.`);
  },
  // Quitar el servicio lo retira también de su módulo de origen. La orden de
  // laboratorio se ANULA en vez de borrarse: el historial clínico es append-only.
  removeService: (id) => {
    const sv = get().services.find((x) => x.id === id);
    if (!sv) return;
    set((s) => ({
      services: s.services.filter((x) => x.id !== id),
      grooming: s.grooming.filter((g) => g.serviceId !== id),
      labOrders: s.labOrders.map((o) => (o.serviceId === id ? { ...o, status: "anulado" as const } : o)),
    }));
    get().notify("warn", `${sv.label} quitado de la visita.`);
  },
  // Cargos ya realizados desde módulos de dominio → entran como servicio terminado en la visita abierta del cliente.
  chargeToVisit: (clientId, patientId, { type, label, price }) => {
    const visitId = get().openVisit(clientId, patientId);
    const cols = SERVICE_FLOWS[type].columns;
    set((s) => ({
      services: [...s.services, { id: uid(), visitId, patientId, type, label, price, status: cols[cols.length - 1], started: true }],
      visits: s.visits.map((v) => (v.id === visitId ? { ...v, started: true } : v)),
    }));
  },
  invoices: [],
  invoiceSeq: 0,
  billVisit: (visitId, { discount, discountPct, ivaRate, method }) => {
    const st = get();
    const visit = st.visits.find((v) => v.id === visitId)!;
    const client = st.clients.find((c) => c.id === visit.clientId)!;
    const svcs = st.services.filter((sv) => sv.visitId === visitId);
    if (svcs.length === 0 || !svcs.every((sv) => isServiceDone(sv.type, sv.status))) {
      get().notify("error", "La visita tiene servicios sin terminar.");
      return "";
    }
    const prevDebt = client.debt || 0;
    const subtotal = round2(svcs.reduce((t, sv) => t + sv.price, 0));
    const base = round2(subtotal - discount);
    const iva = round2(base * ivaRate);
    const total = round2(base + iva + prevDebt);
    const id = uid();
    // Correlativo monotónico: no depende de invoices.length (que asume que nunca se borran).
    const num = "FAC-" + String(st.invoiceSeq + 1).padStart(3, "0");
    const items: AccountItem[] = svcs.map((sv) => ({ desc: sv.label, amount: sv.price, patientId: sv.patientId, source: SERVICE_AREA[sv.type] }));
    set((s) => ({
      invoices: [{ id, num, clientId: client.id, items, subtotal, discount, discountPct, iva, prevDebt, total, method, date: Date.now() }, ...s.invoices],
      invoiceSeq: s.invoiceSeq + 1,
      // La visita se CIERRA, no se borra: queda consultable en solo lectura con enlace a su factura.
      visits: s.visits.map((v) => (v.id === visitId ? { ...v, invoiceId: id } : v)),
      clients: s.clients.map((c) => (c.id === client.id ? { ...c, debt: 0 } : c)),
    }));
    get().notify("ok", `${num} emitida a ${client.name} por ${money(total)} · ${method}.`);
    return id;
  },

  expenses: [
    { id: "e1", category: "Renta", desc: "Renta del local (día)", amount: 50, date: Date.now() - 3600000 * 5 },
    { id: "e2", category: "Servicios", desc: "Luz y agua", amount: 60, date: Date.now() - 3600000 * 4 },
    { id: "e3", category: "Compras/Insumos", desc: "Reposición de gasas y jeringas", amount: 85.5, date: Date.now() - 3600000 * 2 },
  ],
  // ponytail: sin pantalla de gastos en alcance. Se conservan como punto de
  // extensión: la utilidad y el margen de Finanzas se calculan sobre la semilla.
  addExpense: (data) => {
    set((s) => ({ expenses: [{ id: uid(), date: Date.now(), ...data }, ...s.expenses] }));
    get().notify("ok", `Gasto registrado: ${data.desc} (${money(data.amount)}).`);
  },
  removeExpense: (id) => {
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
  },

  portals: initialPortals,
  portalStages: initialStages,
  portalFields: initialFields,
  portalFieldOptions: initialOptions,
  portalSubmissions: initialSubmissions,
  portalAnswers: initialAnswers,

  addPortal: (data) => {
    const st = get();
    if (st.portals.some((p) => p.slug === data.slug)) {
      st.notify("error", `El slug "${data.slug}" ya está en uso por otro portal.`);
      return "";
    }
    if (data.status === "published" && data.purpose === "booking" && !st.availability.onlineBooking) {
      st.notify("warn", "El portal se creó como borrador porque la reserva en línea está desactivada en la clínica.");
      data.status = "draft";
    }
    const id = uid();
    const now = new Date().toISOString();
    const portal: Portal = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const { stages, fields, options } = generateDefaultPortalStructure(
      id,
      portal.purpose,
      portal.defaultReason,
    );
    set((s) => ({
      portals: [...s.portals, portal],
      portalStages: [...s.portalStages, ...stages],
      portalFields: [...s.portalFields, ...fields],
      portalFieldOptions: [...s.portalFieldOptions, ...options],
    }));
    get().notify("ok", `Portal "${portal.name}" creado.`);
    return portal.id;
  },

  updatePortal: (id, data) => {
    const st = get();
    const current = st.portals.find((p) => p.id === id);
    if (!current) return false;

    if (data.slug && st.portals.some((p) => p.id !== id && p.slug === data.slug)) {
      st.notify("error", `El slug "${data.slug}" ya está en uso por otro portal.`);
      return false;
    }

    const hasSubmissions = st.portalSubmissions.some((s) => s.portalId === id);
    if (hasSubmissions && data.purpose && data.purpose !== current.purpose) {
      st.notify("error", "No se puede cambiar el propósito de un portal con envíos registrados.");
      return false;
    }

    const nextStatus = data.status ?? current.status;
    const nextPurpose = data.purpose ?? current.purpose;
    if (nextStatus === "published" && nextPurpose === "booking" && !st.availability.onlineBooking) {
      st.notify("error", "No puedes publicar un portal de reserva si la reserva en línea de la clínica está desactivada.");
      return false;
    }

    const now = new Date().toISOString();
    set((s) => ({
      portals: s.portals.map((p) => (p.id === id ? { ...p, ...data, updatedAt: now } : p)),
    }));
    get().notify("ok", `Portal "${data.name || current.name}" actualizado.`);
    return true;
  },

  archivePortal: (id) => {
    const portal = get().portals.find((p) => p.id === id);
    if (!portal) return;
    const now = new Date().toISOString();
    set((s) => ({
      portals: s.portals.map((p) =>
        p.id === id ? { ...p, status: "archived" as PortalStatus, archivedAt: now, updatedAt: now } : p,
      ),
    }));
    get().notify("ok", `Portal "${portal.name}" archivado.`);
  },

  removePortal: (id) => {
    const st = get();
    const portal = st.portals.find((p) => p.id === id);
    if (!portal) return false;
    const hasSubmissions = st.portalSubmissions.some((s) => s.portalId === id);
    if (hasSubmissions) {
      st.notify("error", "El portal tiene envíos registrados y no puede eliminarse. Usa la opción de archivar.");
      return false;
    }
    const stageIds = new Set(st.portalStages.filter((s) => s.portalId === id).map((s) => s.id));
    const fieldIds = new Set(st.portalFields.filter((f) => stageIds.has(f.stageId)).map((f) => f.id));

    set((s) => ({
      portals: s.portals.filter((p) => p.id !== id),
      portalStages: s.portalStages.filter((stg) => stg.portalId !== id),
      portalFields: s.portalFields.filter((fld) => !stageIds.has(fld.stageId)),
      portalFieldOptions: s.portalFieldOptions.filter((opt) => !fieldIds.has(opt.fieldId)),
    }));
    get().notify("ok", `Portal "${portal.name}" eliminado.`);
    return true;
  },

  resetPortalToDefaults: (portalId) => {
    const st = get();
    const portal = st.portals.find((p) => p.id === portalId);
    if (!portal) return;
    const oldStageIds = new Set(st.portalStages.filter((s) => s.portalId === portalId).map((s) => s.id));
    const oldFieldIds = new Set(st.portalFields.filter((f) => oldStageIds.has(f.stageId)).map((f) => f.id));

    const { stages, fields, options } = generateDefaultPortalStructure(
      portalId,
      portal.purpose,
      portal.defaultReason,
    );

    set((s) => ({
      portalStages: [...s.portalStages.filter((stg) => stg.portalId !== portalId), ...stages],
      portalFields: [...s.portalFields.filter((fld) => !oldStageIds.has(fld.stageId)), ...fields],
      portalFieldOptions: [...s.portalFieldOptions.filter((opt) => !oldFieldIds.has(opt.fieldId)), ...options],
    }));
    get().notify("ok", "Etapas y campos restablecidos a la configuración predeterminada.");
  },

  addStage: (portalId, data) => {
    const st = get();
    const existing = st.portalStages.filter((s) => s.portalId === portalId && !s.deletedAt);
    const id = uid();
    const stage: PortalStage = {
      id,
      portalId,
      name: data.name.trim().toLowerCase().replace(/\s+/g, "_"),
      title: data.title.trim(),
      description: data.description?.trim(),
      position: existing.length,
      active: true,
    };
    set((s) => ({ portalStages: [...s.portalStages, stage] }));
    get().notify("ok", `Etapa "${stage.title}" agregada.`);
    return id;
  },

  updateStage: (id, data) => {
    const st = get();
    const stage = st.portalStages.find((s) => s.id === id);
    if (!stage) return false;
    const portal = st.portals.find((p) => p.id === stage.portalId);

    if (data.active === false) {
      const hasActiveProtected = st.portalFields.some(
        (f) => f.stageId === id && f.active && !f.deletedAt && isFieldProtected(f, portal),
      );
      if (hasActiveProtected) {
        st.notify("error", "No puedes desactivar una etapa que contiene campos protegidos activos.");
        return false;
      }
    }

    set((s) => ({
      portalStages: s.portalStages.map((stg) => (stg.id === id ? { ...stg, ...data } : stg)),
    }));
    get().notify("ok", "Etapa actualizada.");
    return true;
  },

  deleteStage: (id) => {
    const st = get();
    const stage = st.portalStages.find((s) => s.id === id);
    if (!stage) return false;
    const hasBindingFields = st.portalFields.some(
      (f) => f.stageId === id && !f.deletedAt && f.binding !== null,
    );
    if (hasBindingFields) {
      st.notify("error", "No se puede eliminar una etapa predeterminada del sistema. Puedes desactivarla si no tiene campos protegidos.");
      return false;
    }
    const now = new Date().toISOString();
    set((s) => ({
      portalStages: s.portalStages.map((stg) => (stg.id === id ? { ...stg, deletedAt: now } : stg)),
      portalFields: s.portalFields.map((fld) => (fld.stageId === id ? { ...fld, deletedAt: now } : fld)),
    }));
    get().notify("ok", `Etapa "${stage.title}" eliminada.`);
    return true;
  },

  reorderStages: (portalId, orderedIds) => {
    set((s) => ({
      portalStages: s.portalStages.map((stg) => {
        if (stg.portalId !== portalId) return stg;
        const pos = orderedIds.indexOf(stg.id);
        return pos >= 0 ? { ...stg, position: pos } : stg;
      }),
    }));
  },

  addField: (portalId, stageId, data, staticOptions) => {
    const st = get();
    const id = uid();
    const stage = st.portalStages.find((s) => s.id === stageId);
    if (!stage) return "";
    const stageFields = st.portalFields.filter((f) => f.stageId === stageId && !f.deletedAt);

    const field: PortalField = {
      ...data,
      id,
      portalId,
      stageId,
      position: stageFields.length,
      active: data.active ?? true,
    };

    const newOptions: PortalFieldOption[] = [];
    if (staticOptions && staticOptions.length > 0) {
      staticOptions.forEach((opt, idx) => {
        newOptions.push({
          id: uid(),
          fieldId: id,
          value: opt.value,
          label: opt.label,
          position: idx,
          active: true,
        });
      });
    }

    set((s) => ({
      portalFields: [...s.portalFields, field],
      portalFieldOptions: [...s.portalFieldOptions, ...newOptions],
    }));
    get().notify("ok", `Campo "${field.label}" creado.`);
    return id;
  },

  updateField: (id, data) => {
    const st = get();
    const field = st.portalFields.find((f) => f.id === id);
    if (!field) return false;
    const portal = st.portals.find((p) => p.id === field.portalId);
    const hasAnswers = st.portalAnswers.some((a) => a.fieldId === id);

    if (hasAnswers) {
      if (data.type && data.type !== field.type) {
        st.notify("error", "No se puede cambiar el tipo de un campo que ya tiene respuestas registradas.");
        return false;
      }
      if (data.name && data.name !== field.name) {
        st.notify("error", "No se puede cambiar el identificador de un campo con respuestas registradas.");
        return false;
      }
      if (data.binding !== undefined && data.binding !== field.binding) {
        st.notify("error", "No se puede modificar el enlace de datos de un campo con respuestas.");
        return false;
      }
    }

    if (isFieldProtected(field, portal)) {
      if (data.required === false) {
        st.notify("error", "Este campo es esencial y debe ser obligatorio.");
        return false;
      }
      if (data.active === false) {
        st.notify("error", "Este campo es esencial y no se puede desactivar.");
        return false;
      }
    }

    set((s) => ({
      portalFields: s.portalFields.map((f) => (f.id === id ? { ...f, ...data } : f)),
    }));
    get().notify("ok", `Campo "${data.label || field.label}" actualizado.`);
    return true;
  },

  deleteField: (id) => {
    const st = get();
    const field = st.portalFields.find((f) => f.id === id);
    if (!field) return false;
    if (field.binding !== null) {
      st.notify("error", "Los campos vinculados al sistema no pueden eliminarse. Puedes ocultarlos si no son protegidos.");
      return false;
    }
    const now = new Date().toISOString();
    set((s) => ({
      portalFields: s.portalFields.map((f) => (f.id === id ? { ...f, deletedAt: now } : f)),
    }));
    get().notify("ok", `Campo "${field.label}" eliminado.`);
    return true;
  },

  reorderFields: (stageId, orderedIds) => {
    set((s) => ({
      portalFields: s.portalFields.map((f) => {
        if (f.stageId !== stageId) return f;
        const pos = orderedIds.indexOf(f.id);
        return pos >= 0 ? { ...f, position: pos } : f;
      }),
    }));
  },

  addFieldOption: (fieldId, data) => {
    const st = get();
    const existing = st.portalFieldOptions.filter((o) => o.fieldId === fieldId);
    const id = uid();
    const option: PortalFieldOption = {
      id,
      fieldId,
      value: data.value.trim(),
      label: data.label.trim(),
      position: existing.length,
      active: true,
    };
    set((s) => ({ portalFieldOptions: [...s.portalFieldOptions, option] }));
    return id;
  },

  toggleFieldOption: (id, active) => {
    set((s) => ({
      portalFieldOptions: s.portalFieldOptions.map((o) => (o.id === id ? { ...o, active } : o)),
    }));
  },

  reviewSubmission: (id) => {
    const now = new Date().toISOString();
    set((s) => ({
      portalSubmissions: s.portalSubmissions.map((sub) =>
        sub.id === id ? { ...sub, needsReview: false, reviewedAt: now } : sub,
      ),
    }));
    get().notify("ok", "Envío marcado como revisado.");
  },

  submitPortal: (payload) => {
    const st = get();
    const portal = st.portals.find((p) => p.id === payload.portalId);
    if (!portal) {
      return { success: false, error: "El portal solicitado no existe." };
    }
    if (portal.status !== "published") {
      return {
        success: false,
        error: "Este portal ya no acepta solicitudes o se encuentra inactivo.",
        rejectionReason: "portal_closed",
      };
    }

    if (portal.purpose === "booking" && !st.availability.onlineBooking) {
      return {
        success: false,
        error: "La reserva de citas en línea no está activa en la clínica en este momento.",
        rejectionReason: "outside_availability",
      };
    }

    const existingSub = st.portalSubmissions.find(
      (s) => s.portalId === portal.id && s.idempotencyKey === payload.idempotencyKey,
    );
    if (existingSub) {
      const apt = existingSub.appointmentId
        ? st.appointments.find((a) => a.id === existingSub.appointmentId)
        : undefined;
      return {
        success: existingSub.status !== "rejected",
        submission: existingSub,
        appointment: apt,
        rejectionReason: existingSub.rejectionReason,
      };
    }

    const stages = st.portalStages
      .filter((s) => s.portalId === portal.id && s.active && !s.deletedAt)
      .sort((a, b) => a.position - b.position);
    const stageIds = new Set(stages.map((s) => s.id));
    const activeFields = st.portalFields.filter(
      (f) => stageIds.has(f.stageId) && f.active && !f.deletedAt,
    );

    for (const field of activeFields) {
      const err = validateFieldValue(field, payload.answers[field.id]);
      if (err) {
        return { success: false, error: err };
      }
    }

    const getFieldVal = (binding: string): string => {
      const f = activeFields.find((field) => field.binding === binding);
      return f ? (payload.answers[f.id] || "").trim() : "";
    };

    const rawPhone = getFieldVal("client.phone");
    const normPhoneVal = normalizePhone(rawPhone);
    const rawEmail = getFieldVal("client.email").toLowerCase();
    const inputClientName = getFieldVal("client.name") || "Cliente";

    let clientId = "";
    let clientCreated: Client | null = null;
    let needsReview = false;

    const matchedByPhone = st.clients.find((c) => normalizePhone(c.phone) === normPhoneVal && normPhoneVal.length >= 7);
    const matchedByEmail = !matchedByPhone && rawEmail ? st.clients.find((c) => c.email.toLowerCase() === rawEmail) : null;
    const existingClient = matchedByPhone || matchedByEmail;

    if (existingClient) {
      clientId = existingClient.id;
      if (existingClient.name.trim().toLowerCase() !== inputClientName.trim().toLowerCase()) {
        needsReview = true;
      }
    } else {
      clientId = uid();
      clientCreated = {
        id: clientId,
        name: inputClientName,
        phone: rawPhone,
        email: rawEmail,
        debt: 0,
      };
    }

    const inputPetName = getFieldVal("patient.name");
    let patientId = payload.selectedPatientId || "";
    let patientCreated: Patient | null = null;

    const clientPet = patientId ? st.patients.find((p) => p.id === patientId && p.clientId === clientId) : null;
    if (clientPet) {
      patientId = clientPet.id;
    } else {
      const petNameMatch = st.patients.find(
        (p) => p.clientId === clientId && p.name.trim().toLowerCase() === inputPetName.trim().toLowerCase(),
      );
      if (petNameMatch) {
        patientId = petNameMatch.id;
      } else {
        patientId = uid();
        const allergiesStr = getFieldVal("patient.allergies");
        const allergiesList = allergiesStr
          ? allergiesStr.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        patientCreated = {
          id: patientId,
          clientId,
          name: inputPetName || "Mascota",
          species: getFieldVal("patient.species") || "Perro",
          breed: getFieldVal("patient.breed"),
          age: getFieldVal("patient.age"),
          sex: (getFieldVal("patient.sex") as "M" | "H") || "M",
          allergies: allergiesList,
          aggressive: false,
        };
      }
    }

    let appointmentCreated: Appointment | null = null;
    const targetDate = payload.selectedDate || ymd(new Date());
    const targetTime = payload.selectedTime || getFieldVal("appointment.time") || "09:00";

    if (portal.purpose === "booking") {
      const dateObj = new Date(targetDate + "T12:00:00");
      const availableSlots = slotsForDate(st.availability, dateObj);
      if (!availableSlots.includes(targetTime)) {
        return {
          success: false,
          error: `Las ${targetTime} no están dentro de los horarios disponibles para el día seleccionado.`,
          rejectionReason: "outside_availability",
        };
      }

      const alreadyReserved = st.appointments.find(
        (a) =>
          a.time === targetTime &&
          (a.date === targetDate || (!a.date && targetDate === ymd(new Date()))) &&
          a.status !== "cancelada" &&
          Boolean(a.vetId),
      );
      if (alreadyReserved) {
        return {
          success: false,
          error: "Ese horario acaba de ser ocupado. Por favor selecciona otro horario.",
          rejectionReason: "slot_taken",
        };
      }

      const freeVet = st.vets.find((v) => {
        const hasClash = st.appointments.some(
          (a) =>
            a.vetId === v.id &&
            a.time === targetTime &&
            (a.date === targetDate || (!a.date && targetDate === ymd(new Date()))) &&
            a.status !== "cancelada",
        );
        return !hasClash;
      });
      const vetId = freeVet ? freeVet.id : st.vets[0]?.id;

      if (!vetId) {
        return {
          success: false,
          error: "No hay médicos disponibles para atender en ese horario.",
          rejectionReason: "slot_taken",
        };
      }

      const activeForDay = st.appointments.filter(
        (a) => (a.date === targetDate || (!a.date && targetDate === ymd(new Date()))) && a.status !== "cancelada",
      ).length;
      if (st.availability.maxPerDay > 0 && activeForDay >= st.availability.maxPerDay) {
        return {
          success: false,
          error: "Se ha alcanzado el límite máximo de citas para la fecha seleccionada.",
          rejectionReason: "max_per_day",
        };
      }

      const reasonVal = getFieldVal("appointment.reason") || portal.defaultReason || "Consulta médica";
      const status: AppointmentStatus = portal.autoConfirm ? "confirmada" : "pendiente";
      const appointmentId = uid();

      appointmentCreated = {
        id: appointmentId,
        patientId,
        vetId,
        time: targetTime,
        date: targetDate,
        reason: reasonVal,
        status,
        source: "portal",
        submissionId: uid(),
      };
    }

    const subId = appointmentCreated ? appointmentCreated.submissionId! : uid();
    const submissionStatus: SubmissionStatus =
      portal.purpose === "booking" ? "appointment_created" : "captured";

    const submission: PortalSubmission = {
      id: subId,
      portalId: portal.id,
      idempotencyKey: payload.idempotencyKey,
      status: submissionStatus,
      needsReview,
      clientId,
      patientId,
      appointmentId: appointmentCreated ? appointmentCreated.id : undefined,
      campaignName: portal.campaignName,
      submittedAt: new Date().toISOString(),
    };

    const newAnswers: PortalAnswer[] = activeFields.map((fld) => {
      const stage = stages.find((s) => s.id === fld.stageId);
      const valText = payload.answers[fld.id] ?? "";
      let optId: string | undefined = undefined;
      let optLabel: string | undefined = undefined;

      if (fld.optionsSource === "static") {
        const opt = st.portalFieldOptions.find((o) => o.fieldId === fld.id && o.value === valText);
        if (opt) {
          optId = opt.id;
          optLabel = opt.label;
        }
      }

      return {
        id: uid(),
        submissionId: subId,
        fieldId: fld.id,
        fieldName: fld.name,
        fieldLabel: fld.label,
        fieldType: fld.type,
        binding: fld.binding,
        stageTitle: stage ? stage.title : "",
        position: fld.position,
        valueText: valText,
        optionId: optId,
        optionLabel: optLabel,
      };
    });

    set((s) => ({
      clients: clientCreated ? [...s.clients, clientCreated] : s.clients,
      patients: patientCreated ? [...s.patients, patientCreated] : s.patients,
      appointments: appointmentCreated ? [...s.appointments, appointmentCreated] : s.appointments,
      portalSubmissions: [submission, ...s.portalSubmissions],
      portalAnswers: [...s.portalAnswers, ...newAnswers],
    }));

    if (submission.status === "appointment_created") {
      const vetName = st.vets.find((v) => v.id === appointmentCreated?.vetId)?.name || "el equipo médico";
      get().notify("ok", `Nueva solicitud de cita recibida de ${inputClientName} para ${targetTime} con ${vetName}.`);
    } else {
      get().notify("ok", `Información recibida exitosamente desde "${portal.name}".`);
    }

    return {
      success: true,
      submission,
      appointment: appointmentCreated || undefined,
    };
  },
}));
