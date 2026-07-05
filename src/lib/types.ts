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
  source: string;
}

export interface Account {
  id: string;
  clientId: string;
  items: AccountItem[];
}

export interface Invoice {
  id: string;
  num: string;
  clientId: string;
  items: AccountItem[];
  prevDebt: number;
  total: number;
  date: number;
}

export type ToastType = "ok" | "warn" | "error" | "wa";

export interface Toast {
  id: string;
  type: ToastType;
  msg: string;
}
