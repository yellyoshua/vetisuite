import { create } from "zustand";
import { GROOM_SERVICES, LAB_TESTS, SERVICE_FLOWS, isServiceDone, money, round2, uid } from "@/lib/constants";
import { DEFAULT_AVAILABILITY, slotsForDate, validateAvailability } from "@/lib/availability";
import { showToast } from "@/components/toast";
import type {
  AccountItem, Appointment, AppointmentStatus, Availability, Client, Expense, GroomingJob,
  GroomingStatus, Invoice, LabOrder, MedicalRecord, Patient, PayMethod, Portal, Product, ServiceItem, ServiceType, ToastType, Vet, Visit,
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
  advanceService: (id: string) => void;
  removeService: (id: string) => void;
  chargeToVisit: (clientId: string, patientId: string, data: { type: ServiceType; label: string; price: number }) => void;
  invoices: Invoice[];
  billVisit: (visitId: string, opts: { discount: number; ivaRate: number; method: PayMethod }) => string;

  expenses: Expense[];
  addExpense: (data: Pick<Expense, "category" | "desc" | "amount">) => void;
  removeExpense: (id: string) => void;

  portals: Portal[];
  addPortal: (data: Omit<Portal, "id">) => string;
  updatePortal: (id: string, data: Omit<Portal, "id">) => boolean;
  removePortal: (id: string) => void;
}

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
    { id: "a1", patientId: "p1", vetId: "v1", time: "09:00", reason: "Vacunación anual", status: "confirmada" },
    { id: "a2", patientId: "p3", vetId: "v2", time: "10:00", reason: "Control dermatológico", status: "pendiente" },
    { id: "a3", patientId: "p5", vetId: "v1", time: "11:00", reason: "Chequeo geriátrico", status: "confirmada" },
    { id: "a4", patientId: "p2", vetId: "v3", time: "15:00", reason: "Desparasitación", status: "pendiente" },
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
    const owner = st.clients.find((c) => c.id === patient.clientId)!;
    const vet = st.vets.find((v) => v.id === vetId)!;
    const status: AppointmentStatus = st.availability.autoConfirm ? "confirmada" : "pendiente";
    set((s) => ({ appointments: [...s.appointments, { id: uid(), patientId, vetId, time, reason, status }] }));
    if (status === "confirmada") get().notify("wa", `WhatsApp a ${owner.name}: "Cita confirmada para ${patient.name} hoy ${time} con ${vet.name} ✅"`);
    else get().notify("wa", `WhatsApp a ${owner.name}: "Cita para ${patient.name} hoy ${time} con ${vet.name}. Responde CONFIRMAR ✅"`);
    return true;
  },
  updateAppointment: (id, data) => {
    const st = get();
    const clash = st.appointments.find((a) => a.id !== id && a.vetId === data.vetId && a.time === data.time && a.status !== "cancelada");
    if (clash) { get().notify("error", "Ese médico ya tiene una cita en ese horario."); return false; }
    // Mover la cita exige un horario válido; conservar el suyo no, aunque el horario haya cambiado después.
    const current = st.appointments.find((a) => a.id === id)!;
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
    const owner = st.clients.find((c) => c.id === patient.clientId)!;
    set((s) => ({ appointments: s.appointments.map((x) => (x.id === id ? { ...x, status } : x)) }));
    if (status === "confirmada") get().notify("wa", `${owner.name} confirmó por WhatsApp la cita de ${patient.name} (${appt.time}).`);
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
    if (to === "terminado") get().notify("wa", `WhatsApp a ${owner.name}: "¡${patient.name} está listo! Ya puedes pasar a recogerlo 🐾"`);
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
    set((s) => ({ records: [record, ...s.records] }));
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
    get().notify("ok", `Resultado de ${order.test} (${patient.name}) disponible. Se alertó al médico tratante.`);
  },
  addPrescription: (recordId, patientId, med, dosage) => {
    const st = get();
    const patient = st.patients.find((p) => p.id === patientId)!;
    const owner = st.clients.find((c) => c.id === patient.clientId)!;
    set((s) => ({ records: s.records.map((r) => (r.id === recordId ? { ...r, prescriptions: [...r.prescriptions, { med, dosage }] } : r)) }));
    get().notify("wa", `Receta digital firmada y enviada al correo y WhatsApp de ${owner.name}.`);
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
  updateProduct: (id, data) => {
    set((s) => ({ inventory: s.inventory.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
    get().notify("ok", `Producto "${data.name}" actualizado.`);
  },
  restock: (id, qty) => {
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
    const existing = get().visits.find((v) => v.clientId === clientId);
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
  advanceService: (id) => {
    const sv = get().services.find((x) => x.id === id);
    if (!sv) return;
    const cols = SERVICE_FLOWS[sv.type].columns;
    const next = cols[Math.min(cols.indexOf(sv.status) + 1, cols.length - 1)];
    set((s) => ({ services: s.services.map((x) => (x.id === id ? { ...x, status: next } : x)) }));
    if (next === cols[cols.length - 1]) {
      const visit = get().visits.find((v) => v.id === sv.visitId);
      const client = visit && get().clients.find((c) => c.id === visit.clientId);
      if (client) get().notify("wa", `WhatsApp a ${client.name}: "${sv.label} finalizado ✅"`);
    }
  },
  // Cancelar el servicio lo remueve también de su módulo de origen (peluquería/laboratorio).
  removeService: (id) => set((s) => ({
    services: s.services.filter((x) => x.id !== id),
    grooming: s.grooming.filter((g) => g.serviceId !== id),
    labOrders: s.labOrders.filter((o) => o.serviceId !== id),
  })),
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
  billVisit: (visitId, { discount, ivaRate, method }) => {
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
    const num = "FAC-" + String(st.invoices.length + 1).padStart(3, "0");
    const items: AccountItem[] = svcs.map((sv) => ({ desc: sv.label, amount: sv.price, source: SERVICE_FLOWS[sv.type].label, status: "completado" }));
    set((s) => ({
      invoices: [{ id, num, clientId: client.id, items, subtotal, discount, iva, prevDebt, total, method, date: Date.now() }, ...s.invoices],
      services: s.services.filter((sv) => sv.visitId !== visitId),
      visits: s.visits.filter((v) => v.id !== visitId),
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
  addExpense: (data) => {
    set((s) => ({ expenses: [{ id: uid(), date: Date.now(), ...data }, ...s.expenses] }));
    get().notify("ok", `Gasto registrado: ${data.desc} (${money(data.amount)}).`);
  },
  removeExpense: (id) => {
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
  },

  portals: [
    {
      id: "po1", name: "Portal de la clínica", slug: "clinica",
      palette: { primary: "#186653", accent: "#C9A227", bg: "#FFFFFF" },
      logoUrl: "https://placehold.co/120x120/186653/fff?text=Veti",
      markdown: "# Clínica Veterinaria\n\nAtendemos de **lunes a sábado**, 08:00–18:00.\n\n- Consulta médica\n- Vacunación\n- Peluquería y estética\n\nAgenda tu cita por WhatsApp.",
    },
    {
      id: "po2", name: "Campaña de vacunación", slug: "vacunacion-2026",
      palette: { primary: "#2C6E8F", accent: "#E4572E", bg: "#F5F9FB" },
      logoUrl: "",
      markdown: "# Campaña de vacunación\n\nSéxtuple y antirrábica con **20% de descuento** durante todo el mes.",
    },
  ],
  addPortal: (data) => {
    if (get().portals.some((p) => p.slug === data.slug)) { get().notify("error", `El slug "${data.slug}" ya está en uso por otro portal.`); return ""; }
    const portal = { id: uid(), ...data };
    set((s) => ({ portals: [...s.portals, portal] }));
    get().notify("ok", `Portal "${portal.name}" creado.`);
    return portal.id;
  },
  updatePortal: (id, data) => {
    if (get().portals.some((p) => p.id !== id && p.slug === data.slug)) { get().notify("error", `El slug "${data.slug}" ya está en uso por otro portal.`); return false; }
    set((s) => ({ portals: s.portals.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
    get().notify("ok", `Portal "${data.name}" actualizado.`);
    return true;
  },
  removePortal: (id) => {
    const portal = get().portals.find((p) => p.id === id);
    if (!portal) return;
    set((s) => ({ portals: s.portals.filter((p) => p.id !== id) }));
    get().notify("ok", `Portal "${portal.name}" eliminado.`);
  },
}));
