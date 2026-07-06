import { create } from "zustand";
import { CONSULT_FEE, GROOM_SERVICES, LAB_TESTS, money, uid } from "../lib/constants";
import type {
  Account, AccountItem, Appointment, AppointmentStatus, Client, GroomingJob,
  GroomingStatus, Invoice, LabOrder, MedicalRecord, Patient, Product, Toast, ToastType, Vet,
} from "../lib/types";

interface VetState {
  toasts: Toast[];
  notify: (type: ToastType, msg: string) => void;

  vets: Vet[];
  clients: Client[];
  patients: Patient[];
  addClient: (data: Pick<Client, "name" | "phone" | "email">) => string;
  updateClient: (id: string, data: Pick<Client, "name" | "phone" | "email">) => void;
  addPatient: (data: Omit<Patient, "id">) => void;
  updatePatient: (id: string, data: Omit<Patient, "id" | "clientId">) => void;

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

  accounts: Account[];
  chargeToAccount: (clientId: string, item: AccountItem) => void;
  invoices: Invoice[];
  collectAccount: (accountId: string) => void;
}

export const useVetStore = create<VetState>((set, get) => ({
  toasts: [],
  notify: (type, msg) => {
    const id = uid();
    set((s) => ({ toasts: [...s.toasts, { id, type, msg }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 5200);
  },

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
    const patient = st.patients.find((p) => p.id === patientId)!;
    const owner = st.clients.find((c) => c.id === patient.clientId)!;
    const vet = st.vets.find((v) => v.id === vetId)!;
    set((s) => ({ appointments: [...s.appointments, { id: uid(), patientId, vetId, time, reason, status: "pendiente" }] }));
    get().notify("wa", `WhatsApp a ${owner.name}: "Cita para ${patient.name} hoy ${time} con ${vet.name}. Responde CONFIRMAR ✅"`);
    return true;
  },
  updateAppointment: (id, data) => {
    const st = get();
    const clash = st.appointments.find((a) => a.id !== id && a.vetId === data.vetId && a.time === data.time && a.status !== "cancelada");
    if (clash) { get().notify("error", "Ese médico ya tiene una cita en ese horario."); return false; }
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
  checkInGrooming: ({ patientId, service, belongings, groomer }) => {
    set((s) => ({ grooming: [...s.grooming, { id: uid(), patientId, service, price: GROOM_SERVICES[service], belongings, groomer, status: "pendiente" }] }));
    get().notify("ok", "Check-in registrado con foto de llegada y pertenencias.");
  },
  moveGrooming: (id, to) => {
    const st = get();
    const job = st.grooming.find((x) => x.id === id)!;
    const patient = st.patients.find((p) => p.id === job.patientId)!;
    const owner = st.clients.find((c) => c.id === patient.clientId)!;
    if (to === "proceso") {
      set((s) => ({ grooming: s.grooming.map((x) => (x.id === id ? { ...x, status: "proceso" as const, startedAt: Date.now() } : x)) }));
    }
    if (to === "terminado") {
      set((s) => ({ grooming: s.grooming.map((x) => (x.id === id ? { ...x, status: "terminado" as const, finishedAt: Date.now() } : x)) }));
      get().chargeToAccount(owner.id, { desc: `Estética: ${job.service} (${patient.name})`, amount: job.price, source: "Peluquería" });
      get().notify("wa", `WhatsApp a ${owner.name}: "¡${patient.name} está listo! Ya puedes pasar a recogerlo 🐾"`);
    }
    if (to === "entregado") {
      set((s) => ({ grooming: s.grooming.map((x) => (x.id === id ? { ...x, status: "entregado" as const } : x)) }));
      get().notify("ok", `${patient.name} entregado. El cargo pasó a la cuenta abierta de ${owner.name}.`);
    }
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
    get().chargeToAccount(patient.clientId, { desc: `Consulta médica (${patient.name})`, amount: CONSULT_FEE, source: "Clínica" });
    get().notify("ok", `Consulta guardada en el expediente de ${patient.name}. Cargo de ${money(CONSULT_FEE)} añadido a la cuenta.`);
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
    get().chargeToAccount(patient.clientId, { desc: `${product.name} ×${qty} (${patient.name})`, amount: product.price * qty, source: "Clínica" });
    const after = get().inventory.find((p) => p.id === productId)!;
    if (after.stock <= after.minStock) get().notify("warn", `Stock bajo: ${after.name} (${after.stock} uds). Generar orden de compra.`);
    get().notify("ok", `${product.name} descontado del inventario y cargado a la cuenta del cliente.`);
  },
  orderLab: (patientId, test) => {
    const st = get();
    const patient = st.patients.find((p) => p.id === patientId)!;
    set((s) => ({ labOrders: [{ id: uid(), patientId, test, price: LAB_TESTS[test], status: "solicitado" as const, result: "" }, ...s.labOrders] }));
    get().chargeToAccount(patient.clientId, { desc: `Laboratorio: ${test} (${patient.name})`, amount: LAB_TESTS[test], source: "Laboratorio" });
    get().notify("ok", `Orden de laboratorio generada: ${test}.`);
  },
  loadLabResult: (orderId, result) => {
    const st = get();
    const order = st.labOrders.find((x) => x.id === orderId)!;
    const patient = st.patients.find((p) => p.id === order.patientId)!;
    set((s) => ({ labOrders: s.labOrders.map((x) => (x.id === orderId ? { ...x, status: "resultado" as const, result } : x)) }));
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

  accounts: [
    { id: "acc1", clientId: "c3", items: [{ desc: "Consulta médica (Kiwi)", amount: 25, source: "Clínica" }] },
  ],
  chargeToAccount: (clientId, item) => {
    set((s) => {
      const existing = s.accounts.find((a) => a.clientId === clientId);
      if (existing) {
        return { accounts: s.accounts.map((a) => (a.id === existing.id ? { ...a, items: [...a.items, item] } : a)) };
      }
      return { accounts: [...s.accounts, { id: uid(), clientId, items: [item] }] };
    });
  },
  invoices: [],
  collectAccount: (accountId) => {
    const st = get();
    const account = st.accounts.find((a) => a.id === accountId)!;
    const client = st.clients.find((c) => c.id === account.clientId)!;
    const itemsTotal = account.items.reduce((t, i) => t + i.amount, 0);
    const total = itemsTotal + (client.debt || 0);
    const num = "FAC-" + String(st.invoices.length + 1).padStart(3, "0");
    set((s) => ({
      invoices: [{ id: uid(), num, clientId: client.id, items: account.items, prevDebt: client.debt || 0, total, date: Date.now() }, ...s.invoices],
      accounts: s.accounts.filter((a) => a.id !== accountId),
      clients: s.clients.map((c) => (c.id === client.id ? { ...c, debt: 0 } : c)),
    }));
    get().notify("ok", `${num} emitida a ${client.name} por ${money(total)}. Servicios e insumos consolidados.`);
  },
}));
