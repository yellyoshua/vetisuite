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

/* Status values are Spanish because they render verbatim in the UI. */
export type AppointmentStatus = "pendiente" | "confirmada" | "completada" | "cancelada";

export interface Appointment {
  id: string;
  patientId: string;
  vetId: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
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

export interface AppliedProduct {
  name: string;
  qty: number;
  price: number;
}

export interface Prescription {
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

export type LabOrderStatus = "solicitado" | "resultado";

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

/* Status values are Spanish because they render verbatim in the UI. */
export type ItemStatus = "pendiente" | "completado";

export interface AccountItem {
  desc: string;
  amount: number;
  source: string;
  status: ItemStatus;
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
}

export type PayMethod = "Efectivo" | "Tarjeta" | "Transferencia";

export interface Invoice {
  id: string;
  num: string;
  clientId: string;
  items: AccountItem[];
  subtotal: number;
  discount: number;
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

export type ToastType = "ok" | "warn" | "error" | "wa";

export interface Toast {
  id: string;
  type: ToastType;
  msg: string;
}
