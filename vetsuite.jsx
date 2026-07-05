import React, { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  LayoutDashboard, Users, CalendarDays, Scissors, FlaskConical, Package, Receipt,
  PawPrint, Plus, Search, AlertTriangle, MessageCircle, CheckCircle2, X, Syringe,
  FileText, Send, ChevronRight, Dog, Cat, Bird, Bell, Stethoscope, ClipboardList,
  ShieldAlert, Clock, Menu, ChevronsLeft, ChevronsRight, ChevronLeft, History,
} from "lucide-react";

/* ================================================================
   MINI-ZUSTAND — misma API pública: create((set, get) => state)
   El entorno de artifacts no incluye la librería, así que este
   bloque replica su núcleo (~25 líneas). En tu proyecto real:
   instala zustand con npm y reemplaza este bloque por el import
   oficial de la librería. Todo el store funciona sin cambios.
================================================================ */
function create(createState) {
  let state;
  const listeners = new Set();
  const setState = (partial) => {
    const next = typeof partial === "function" ? partial(state) : partial;
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  };
  const getState = () => state;
  const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
  state = createState(setState, getState);
  const useStore = () => useSyncExternalStore(subscribe, getState, getState);
  useStore.getState = getState;
  useStore.setState = setState;
  return useStore;
}

/* ============================ TOKENS ============================ */
const T = {
  bg: "#F6F4EE", card: "#FFFFFF", line: "#E6E1D5", lineSoft: "#EFEBE1",
  ink: "#1E2A26", sub: "#6C7A72",
  green: "#186653", greenSoft: "#E2EFE9", dark: "#14312A", darkHover: "#1C4038",
  amber: "#B07314", amberSoft: "#FBF0DA",
  red: "#B3402F", redSoft: "#F9E7E3",
  blue: "#2C6E8F", blueSoft: "#E4EFF4",
  wa: "#1D8F5B",
};
const F = { head: "'Sora', sans-serif", body: "'Inter', system-ui, sans-serif" };
const uid = () => Math.random().toString(36).slice(2, 9);
const money = (n) => "$" + n.toFixed(2);
const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - new Date()) / 86400000);
const hoy = new Date().toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" });

const CONSULT_FEE = 25;
const GROOM_SERVICES = { "Baño completo": 18, "Corte + baño": 28, "Corte de uñas": 6, "Limpieza dental estética": 20, "Guardería (día)": 15 };
const LAB_TESTS = { "Hemograma completo": 22, "Química sanguínea": 35, "Raspado de piel": 15, "Coprológico": 10, "Ecografía": 40, "Radiografía": 35 };
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const SPECIES_ICON = { Perro: Dog, Gato: Cat, Ave: Bird };

/* ============================ STORE ============================ */
const useVet = create((set, get) => ({
  nav: { module: "dashboard", ctx: null },
  go: (module, ctx = null) => set({ nav: { module, ctx } }),

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
    const c = { id: uid(), debt: 0, ...data };
    set((s) => ({ clients: [...s.clients, c] }));
    get().notify("ok", `Cliente ${c.name} creado.`);
    return c.id;
  },
  addPatient: (data) => {
    const p = { id: uid(), allergies: [], aggressive: false, ...data };
    set((s) => ({ patients: [...s.patients, p] }));
    get().notify("ok", `Paciente ${p.name} registrado y vinculado al cliente.`);
  },

  appointments: [
    { id: "a1", patientId: "p1", vetId: "v1", time: "09:00", reason: "Vacunación anual", status: "confirmada" },
    { id: "a2", patientId: "p3", vetId: "v2", time: "10:00", reason: "Control dermatológico", status: "pendiente" },
    { id: "a3", patientId: "p5", vetId: "v1", time: "11:00", reason: "Chequeo geriátrico", status: "confirmada" },
    { id: "a4", patientId: "p2", vetId: "v3", time: "15:00", reason: "Desparasitación", status: "pendiente" },
  ],
  createAppt: ({ patientId, vetId, time, reason }) => {
    const st = get();
    const clash = st.appointments.find((a) => a.vetId === vetId && a.time === time && a.status !== "cancelada");
    if (clash) { get().notify("error", "Ese médico ya tiene una cita en ese horario."); return false; }
    const pat = st.patients.find((p) => p.id === patientId);
    const owner = st.clients.find((c) => c.id === pat.clientId);
    const vet = st.vets.find((v) => v.id === vetId);
    set((s) => ({ appointments: [...s.appointments, { id: uid(), patientId, vetId, time, reason, status: "pendiente" }] }));
    get().notify("wa", `WhatsApp a ${owner.name}: "Cita para ${pat.name} hoy ${time} con ${vet.name}. Responde CONFIRMAR ✅"`);
    return true;
  },
  setAppt: (id, status) => {
    const st = get();
    const a = st.appointments.find((x) => x.id === id);
    const pat = st.patients.find((p) => p.id === a.patientId);
    const owner = st.clients.find((c) => c.id === pat.clientId);
    set((s) => ({ appointments: s.appointments.map((x) => (x.id === id ? { ...x, status } : x)) }));
    if (status === "confirmada") get().notify("wa", `${owner.name} confirmó por WhatsApp la cita de ${pat.name} (${a.time}).`);
    if (status === "cancelada") get().notify("warn", `Cita de ${a.time} cancelada. Espacio liberado — avisar a lista de espera.`);
    if (status === "completada") get().notify("ok", `Cita de ${pat.name} marcada como atendida.`);
  },

  grooming: [
    { id: "g1", patientId: "p2", service: "Baño completo", price: 18, belongings: "Collar rosado", status: "pendiente", groomer: "Sofía" },
    { id: "g2", patientId: "p5", service: "Corte + baño", price: 28, belongings: "Correa roja, juguete", status: "proceso", groomer: "David", startedAt: Date.now() - 22 * 60000 },
  ],
  checkInGroom: ({ patientId, service, belongings, groomer }) => {
    set((s) => ({ grooming: [...s.grooming, { id: uid(), patientId, service, price: GROOM_SERVICES[service], belongings, groomer, status: "pendiente" }] }));
    get().notify("ok", "Check-in registrado con foto de llegada y pertenencias.");
  },
  moveGroom: (id, to) => {
    const st = get();
    const g = st.grooming.find((x) => x.id === id);
    const pat = st.patients.find((p) => p.id === g.patientId);
    const owner = st.clients.find((c) => c.id === pat.clientId);
    if (to === "proceso") {
      set((s) => ({ grooming: s.grooming.map((x) => (x.id === id ? { ...x, status: "proceso", startedAt: Date.now() } : x)) }));
    }
    if (to === "terminado") {
      set((s) => ({ grooming: s.grooming.map((x) => (x.id === id ? { ...x, status: "terminado", finishedAt: Date.now() } : x)) }));
      get().chargeToAccount(owner.id, { desc: `Estética: ${g.service} (${pat.name})`, amount: g.price, source: "Peluquería" });
      get().notify("wa", `WhatsApp a ${owner.name}: "¡${pat.name} está listo! Ya puedes pasar a recogerlo 🐾"`);
    }
    if (to === "entregado") {
      set((s) => ({ grooming: s.grooming.map((x) => (x.id === id ? { ...x, status: "entregado" } : x)) }));
      get().notify("ok", `${pat.name} entregado. El cargo pasó a la cuenta abierta de ${owner.name}.`);
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
    const pat = st.patients.find((p) => p.id === data.patientId);
    const rec = { id: uid(), date: Date.now(), products: [], prescriptions: [], ...data };
    set((s) => ({ records: [rec, ...s.records] }));
    get().chargeToAccount(pat.clientId, { desc: `Consulta médica (${pat.name})`, amount: CONSULT_FEE, source: "Clínica" });
    get().notify("ok", `Consulta guardada en el expediente de ${pat.name}. Cargo de ${money(CONSULT_FEE)} añadido a la cuenta.`);
    return rec.id;
  },
  applyProduct: (recordId, patientId, productId, qty) => {
    const st = get();
    const prod = st.inventory.find((p) => p.id === productId);
    if (!prod || prod.stock < qty) { get().notify("error", `Stock insuficiente de ${prod ? prod.name : "producto"}.`); return; }
    const pat = st.patients.find((p) => p.id === patientId);
    set((s) => ({
      inventory: s.inventory.map((p) => (p.id === productId ? { ...p, stock: p.stock - qty } : p)),
      records: s.records.map((r) => (r.id === recordId ? { ...r, products: [...r.products, { name: prod.name, qty, price: prod.price }] } : r)),
    }));
    get().chargeToAccount(pat.clientId, { desc: `${prod.name} ×${qty} (${pat.name})`, amount: prod.price * qty, source: "Clínica" });
    const after = get().inventory.find((p) => p.id === productId);
    if (after.stock <= after.minStock) get().notify("warn", `Stock bajo: ${after.name} (${after.stock} uds). Generar orden de compra.`);
    get().notify("ok", `${prod.name} descontado del inventario y cargado a la cuenta del cliente.`);
  },
  orderLab: (patientId, test) => {
    const st = get();
    const pat = st.patients.find((p) => p.id === patientId);
    set((s) => ({ labOrders: [{ id: uid(), patientId, test, price: LAB_TESTS[test], status: "solicitado", result: "" }, ...s.labOrders] }));
    get().chargeToAccount(pat.clientId, { desc: `Laboratorio: ${test} (${pat.name})`, amount: LAB_TESTS[test], source: "Laboratorio" });
    get().notify("ok", `Orden de laboratorio generada: ${test}.`);
  },
  loadLabResult: (orderId, result) => {
    const st = get();
    const o = st.labOrders.find((x) => x.id === orderId);
    const pat = st.patients.find((p) => p.id === o.patientId);
    set((s) => ({ labOrders: s.labOrders.map((x) => (x.id === orderId ? { ...x, status: "resultado", result } : x)) }));
    get().notify("ok", `Resultado de ${o.test} (${pat.name}) disponible. Se alertó al médico tratante.`);
  },
  addPrescription: (recordId, patientId, med, dosage) => {
    const st = get();
    const pat = st.patients.find((p) => p.id === patientId);
    const owner = st.clients.find((c) => c.id === pat.clientId);
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
  restock: (id, qty) => {
    set((s) => ({ inventory: s.inventory.map((p) => (p.id === id ? { ...p, stock: p.stock + qty } : p)) }));
    const p = get().inventory.find((x) => x.id === id);
    get().notify("ok", `Lote ingresado: +${qty} uds de ${p.name} (stock: ${p.stock}).`);
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
  cobrar: (accountId) => {
    const st = get();
    const acc = st.accounts.find((a) => a.id === accountId);
    const client = st.clients.find((c) => c.id === acc.clientId);
    const itemsTotal = acc.items.reduce((t, i) => t + i.amount, 0);
    const total = itemsTotal + (client.debt || 0);
    const num = "FAC-" + String(st.invoices.length + 1).padStart(3, "0");
    set((s) => ({
      invoices: [{ id: uid(), num, clientId: client.id, items: acc.items, prevDebt: client.debt || 0, total, date: Date.now() }, ...s.invoices],
      accounts: s.accounts.filter((a) => a.id !== accountId),
      clients: s.clients.map((c) => (c.id === client.id ? { ...c, debt: 0 } : c)),
    }));
    get().notify("ok", `${num} emitida a ${client.name} por ${money(total)}. Servicios e insumos consolidados.`);
  },
}));

/* ================================================================
   CAPA DE "API" SIMULADA — patrón para 6.000+ clientes
   Con volumen real el frontend NUNCA descarga el catálogo completo:
   pide coincidencias (typeahead con LIMIT) o páginas (LIMIT/OFFSET
   o cursor) a un endpoint indexado. Aquí se simula esa latencia de
   red y el contrato { results/rows, total } que devolvería el backend.
================================================================ */
const netDelay = () => 280 + Math.random() * 320;
function searchClientsApi(query, limit = 8) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.trim().toLowerCase();
      const all = useVet.getState().clients.filter((c) => (c.name + " " + c.phone + " " + c.email).toLowerCase().includes(q));
      resolve({ results: all.slice(0, limit), total: all.length });
    }, netDelay());
  });
}
function fetchClientsPageApi(query, page, pageSize) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.trim().toLowerCase();
      const all = useVet.getState().clients.filter((c) => !q || (c.name + " " + c.phone + " " + c.email).toLowerCase().includes(q));
      resolve({ rows: all.slice(page * pageSize, page * pageSize + pageSize), total: all.length });
    }, netDelay());
  });
}
function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

/* ========================= UI PRIMITIVOS ========================= */
const inputSt = {
  border: `1px solid ${T.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 14,
  width: "100%", background: "#FCFBF8", color: T.ink, outline: "none", fontFamily: F.body,
};
function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <div style={{ fontSize: 11.5, fontWeight: 600, color: T.sub, marginBottom: 5, letterSpacing: 0.3, textTransform: "uppercase" }}>{label}</div>
      {children}
    </label>
  );
}
function Btn({ children, onClick, kind = "primary", small, disabled, full }) {
  const styles = {
    primary: { background: T.green, color: "#fff", border: "1px solid transparent" },
    dark: { background: T.dark, color: "#fff", border: "1px solid transparent" },
    ghost: { background: "transparent", color: T.ink, border: `1px solid ${T.line}` },
    danger: { background: T.redSoft, color: T.red, border: "1px solid transparent" },
    amber: { background: T.amberSoft, color: T.amber, border: "1px solid transparent" },
    wa: { background: T.wa, color: "#fff", border: "1px solid transparent" },
  }[kind];
  return (
    <button
      onClick={onClick} disabled={disabled}
      className="inline-flex items-center justify-center gap-1 font-medium transition-opacity"
      style={{
        ...styles, borderRadius: 10, fontFamily: F.body, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, fontSize: small ? 12.5 : 13.5,
        padding: small ? "6px 10px" : "9px 15px", width: full ? "100%" : undefined,
      }}
    >
      {children}
    </button>
  );
}
function Badge({ tone = "green", children }) {
  const m = {
    green: [T.greenSoft, T.green], amber: [T.amberSoft, T.amber], red: [T.redSoft, T.red],
    blue: [T.blueSoft, T.blue], gray: ["#EEECE4", T.sub],
  }[tone];
  return (
    <span className="inline-flex items-center gap-1" style={{ background: m[0], color: m[1], fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999 }}>
      {children}
    </span>
  );
}
function Card({ children, className = "", style = {} }) {
  return (
    <div className={className} style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, ...style }}>
      {children}
    </div>
  );
}
function Modal({ title, onClose, children, width = 460 }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(18,28,24,0.5)" }} onClick={onClose}>
      <div className="w-full shadow-2xl" style={{ background: T.card, borderRadius: 18, maxWidth: width, maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10" style={{ borderBottom: `1px solid ${T.line}`, background: T.card, borderRadius: "18px 18px 0 0" }}>
          <h3 style={{ fontFamily: F.head, fontSize: 16, fontWeight: 600, color: T.ink }}>{title}</h3>
          <button onClick={onClose} style={{ color: T.sub }}><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
function SectionHead({ title, sub, action }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
      <div>
        <h1 style={{ fontFamily: F.head, fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: -0.3 }}>{title}</h1>
        {sub && <p style={{ fontSize: 13, color: T.sub, marginTop: 3 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
function Elapsed({ since }) {
  const [, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 1000); return () => clearInterval(t); }, []);
  const s = Math.max(0, Math.floor((Date.now() - since) / 1000));
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(Math.floor(s / 60)).padStart(2, "0")}:{String(s % 60).padStart(2, "0")}</span>;
}
function PatientAlerts({ p, small }) {
  return (
    <span className="inline-flex gap-1 flex-wrap">
      {p.aggressive && <Badge tone="red"><ShieldAlert size={11} /> Agresivo</Badge>}
      {p.allergies.map((a) => <Badge key={a} tone="amber"><AlertTriangle size={11} /> {small ? "Alergia" : a}</Badge>)}
    </span>
  );
}
function Spinner({ size = 14 }) {
  return <span className="shrink-0" style={{ width: size, height: size, border: `2px solid ${T.line}`, borderTopColor: T.green, borderRadius: 99, display: "inline-block", animation: "vsSpin .7s linear infinite" }} />;
}
function Pager({ page, total, pageSize, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap mt-3">
      <span style={{ fontSize: 11.5, color: T.sub }}>Mostrando {from}–{to} de {total}</span>
      <div className="flex gap-1.5">
        <Btn small kind="ghost" disabled={page === 0} onClick={() => onPage(page - 1)}><ChevronLeft size={13} /> Anterior</Btn>
        <Btn small kind="ghost" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>Siguiente <ChevronRight size={13} /></Btn>
      </div>
    </div>
  );
}

/* ================================================================
   CLIENT SEARCH — buscador globalizado de clientes (solo clientes)
   Patrón typeahead asíncrono: debounce 300 ms → consulta simulada
   al backend → máx. 8 coincidencias + total. Es el mismo patrón del
   selector de customers de Stripe/Shopify: nunca un <select> con
   miles de opciones. Todo flujo transaccional parte de aquí.
================================================================ */
function ClientSearch({ selected, onSelect, placeholder = "Buscar cliente por nombre, teléfono o correo…", autoFocus = false }) {
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [st, setSt] = useState({ loading: false, results: [], total: 0, searched: false });
  useEffect(() => {
    let alive = true;
    if (dq.trim().length < 2) { setSt({ loading: false, results: [], total: 0, searched: false }); return; }
    setSt((p) => ({ ...p, loading: true }));
    searchClientsApi(dq).then((r) => { if (alive) setSt({ loading: false, results: r.results, total: r.total, searched: true }); });
    return () => { alive = false; };
  }, [dq]);
  if (selected) {
    return (
      <div className="flex items-center justify-between gap-2" style={{ border: `1px solid ${T.green}`, background: T.greenSoft, borderRadius: 10, padding: "8px 12px" }}>
        <div className="min-w-0">
          <div className="truncate" style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{selected.name}</div>
          <div className="truncate" style={{ fontSize: 11.5, color: T.sub }}>{selected.phone} · {selected.email}</div>
        </div>
        <button onClick={() => onSelect(null)} title="Cambiar cliente" className="shrink-0" style={{ color: T.sub }}><X size={15} /></button>
      </div>
    );
  }
  const open = q.trim().length >= 2;
  return (
    <div className="relative">
      <div className="flex items-center gap-2" style={{ ...inputSt, padding: "8px 11px" }}>
        <Search size={14} color={T.sub} className="shrink-0" />
        <input autoFocus={autoFocus} value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder}
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%", color: T.ink }} />
        {st.loading && <Spinner />}
      </div>
      {q.trim().length === 1 && <div style={{ fontSize: 11.5, color: T.sub, marginTop: 4 }}>Escribe al menos 2 caracteres…</div>}
      {open && (
        <div className="absolute left-0 right-0 z-20 shadow-lg" style={{ top: "calc(100% + 4px)", background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden" }}>
          {st.loading && <div className="flex items-center gap-2 px-3 py-3" style={{ fontSize: 12.5, color: T.sub }}><Spinner /> Consultando clientes…</div>}
          {!st.loading && st.searched && st.results.length === 0 && (
            <div className="px-3 py-3" style={{ fontSize: 12.5, color: T.sub }}>Sin coincidencias para “{dq}”. Verifica el nombre o créalo en <b>Clientes y Pacientes</b>.</div>
          )}
          {!st.loading && st.results.map((c) => (
            <button key={c.id} onClick={() => { onSelect(c); setQ(""); }} className="vs-opt w-full text-left px-3 py-2.5" style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
              <div className="flex items-center justify-between gap-2">
                <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{c.name}</span>
                {c.debt > 0 && <Badge tone="red">Debe {money(c.debt)}</Badge>}
              </div>
              <div style={{ fontSize: 11.5, color: T.sub }}>{c.phone} · {c.email}</div>
            </button>
          ))}
          {!st.loading && st.total > st.results.length && (
            <div className="px-3 py-2" style={{ fontSize: 11.5, color: T.sub, background: "#FAF8F2" }}>{st.results.length} de {st.total} coincidencias — sigue escribiendo para afinar.</div>
          )}
        </div>
      )}
    </div>
  );
}
/* Selector dependiente: las mascotas se cargan SOLO del cliente elegido
   (pocas por cliente), nunca del catálogo global de 50.000. */
function PatientPicker({ clientId, value, onChange }) {
  const s = useVet();
  const pets = s.patients.filter((p) => p.clientId === clientId);
  useEffect(() => {
    if (clientId && pets.length === 1 && value !== pets[0].id) onChange(pets[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);
  if (!clientId) return <p style={{ fontSize: 12.5, color: T.sub, padding: "4px 2px" }}>Primero busca y selecciona al cliente.</p>;
  if (pets.length === 0) return <p style={{ fontSize: 12.5, color: T.sub, padding: "4px 2px" }}>Este cliente no tiene mascotas registradas. Añádela desde Clientes y Pacientes.</p>;
  return (
    <div className="flex flex-col gap-1.5">
      {pets.map((p) => {
        const Icon = SPECIES_ICON[p.species] || PawPrint;
        const active = value === p.id;
        return (
          <button key={p.id} onClick={() => onChange(p.id)} className="flex items-center gap-2.5 text-left px-3 py-2"
            style={{ borderRadius: 10, border: `1px solid ${active ? T.green : T.line}`, background: active ? T.greenSoft : T.card }}>
            <Icon size={16} color={active ? T.green : T.sub} className="shrink-0" />
            <span className="flex-1 min-w-0">
              <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{p.name}</span>
              <span style={{ fontSize: 11.5, color: T.sub }}> · {p.species} · {p.breed}</span>
            </span>
            <PatientAlerts p={p} small />
          </button>
        );
      })}
    </div>
  );
}

/* ============================ TOASTS ============================ */
function Toasts() {
  const s = useVet();
  const iconFor = { ok: <CheckCircle2 size={16} color={T.green} />, warn: <AlertTriangle size={16} color={T.amber} />, error: <X size={16} color={T.red} />, wa: <MessageCircle size={16} color="#fff" /> };
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" style={{ maxWidth: "min(340px, calc(100vw - 32px))" }}>
      {s.toasts.map((t) => (
        <div key={t.id} className="flex items-start gap-2 shadow-lg" style={{
          background: t.type === "wa" ? T.wa : T.card, color: t.type === "wa" ? "#fff" : T.ink,
          border: t.type === "wa" ? "none" : `1px solid ${T.line}`, borderRadius: 14, padding: "11px 13px", fontSize: 12.5, lineHeight: 1.45,
        }}>
          <span className="mt-px shrink-0">{iconFor[t.type]}</span>
          <span>{t.type === "wa" && <b style={{ display: "block", fontSize: 11, opacity: 0.85, marginBottom: 2 }}>Automatización · WhatsApp</b>}{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================ SIDEBAR ============================ */
const MODULES = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "crm", label: "Clientes y Pacientes", icon: Users },
  { key: "citas", label: "Citas", icon: CalendarDays },
  { key: "peluqueria", label: "Peluquería y Estética", icon: Scissors },
  { key: "clinica", label: "Clínica y Laboratorio", icon: FlaskConical },
  { key: "inventario", label: "Inventario", icon: Package },
  { key: "facturacion", label: "Facturación", icon: Receipt },
];
function SidebarContent({ collapsed, onNavigate }) {
  const s = useVet();
  const openAccounts = s.accounts.length;
  return (
    <>
      <div className={`flex items-center gap-2 pt-6 pb-5 ${collapsed ? "justify-center px-2" : "px-5"}`}>
        <div className="flex items-center justify-center shrink-0" style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.12)" }}>
          <PawPrint size={18} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: F.head, fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>VetSuite</div>
            <div style={{ fontSize: 10.5, opacity: 0.55 }}>Sistema clínico integral</div>
          </div>
        )}
      </div>
      <nav className={`flex-1 overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
        {MODULES.map((m) => {
          const active = s.nav.module === m.key;
          return (
            <button key={m.key} title={m.label}
              onClick={() => { s.go(m.key); if (onNavigate) onNavigate(); }}
              className={`w-full flex items-center gap-3 mb-1 transition-colors relative ${collapsed ? "justify-center" : "text-left"}`}
              style={{
                padding: collapsed ? "11px 0" : "9px 12px", borderRadius: 10, fontSize: 13.5, fontFamily: F.body,
                background: active ? "rgba(255,255,255,0.11)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.62)", fontWeight: active ? 600 : 400,
              }}>
              <m.icon size={17} className="shrink-0" />
              {!collapsed && <span className="flex-1">{m.label}</span>}
              {m.key === "facturacion" && openAccounts > 0 && (
                collapsed
                  ? <span className="absolute" style={{ top: 7, right: 12, width: 8, height: 8, borderRadius: 99, background: T.amber }} />
                  : <span style={{ background: T.amber, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "1px 7px" }}>{openAccounts}</span>
              )}
            </button>
          );
        })}
      </nav>
      {!collapsed && (
        <div className="mx-4 mb-3 p-3" style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, fontSize: 11, lineHeight: 1.5, color: "rgba(255,255,255,0.6)" }}>
          <b style={{ color: "#fff" }}>Demo MVP</b> · datos de ejemplo. Búsqueda y paginación simulan la API del backend.
        </div>
      )}
    </>
  );
}
function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className="hidden lg:flex flex-col shrink-0" style={{ width: collapsed ? 72 : 232, background: T.dark, color: "#fff", transition: "width .22s ease" }}>
      <SidebarContent collapsed={collapsed} />
      <button onClick={onToggle} title={collapsed ? "Expandir menú" : "Minimizar menú"}
        className={`flex items-center justify-center gap-2 mb-5 py-2.5 ${collapsed ? "mx-2" : "mx-3"}`}
        style={{ borderRadius: 10, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.06)", fontSize: 12.5 }}>
        {collapsed ? <ChevronsRight size={16} /> : <><ChevronsLeft size={16} /> Minimizar</>}
      </button>
    </aside>
  );
}
function MobileDrawer({ open, onClose }) {
  return (
    <div className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0 transition-opacity" style={{ background: "rgba(18,28,24,0.55)", opacity: open ? 1 : 0 }} onClick={onClose} />
      <aside className="absolute inset-y-0 left-0 flex flex-col shadow-2xl transition-transform"
        style={{ width: 262, maxWidth: "82vw", background: T.dark, color: "#fff", transform: open ? "translateX(0)" : "translateX(-102%)" }}>
        <button onClick={onClose} aria-label="Cerrar menú" className="absolute" style={{ top: 20, right: 14, color: "rgba(255,255,255,0.7)" }}><X size={18} /></button>
        <SidebarContent collapsed={false} onNavigate={onClose} />
      </aside>
    </div>
  );
}
function MobileTopBar({ onMenu, moduleLabel }) {
  return (
    <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 shrink-0" style={{ height: 54, background: T.card, borderBottom: `1px solid ${T.line}` }}>
      <button onClick={onMenu} aria-label="Abrir menú" style={{ color: T.ink }}><Menu size={20} /></button>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: 8, background: T.dark, color: "#fff" }}>
          <PawPrint size={14} />
        </div>
        <span style={{ fontFamily: F.head, fontWeight: 700, fontSize: 14 }}>VetSuite</span>
      </div>
      <span className="ml-auto truncate" style={{ fontSize: 12, color: T.sub }}>{moduleLabel}</span>
    </div>
  );
}

/* ============================ DASHBOARD ============================ */
function Dashboard() {
  const s = useVet();
  const citasHoy = s.appointments.filter((a) => a.status !== "cancelada");
  const enEstetica = s.grooming.filter((g) => g.status === "pendiente" || g.status === "proceso");
  const stockBajo = s.inventory.filter((p) => p.stock <= p.minStock);
  const porCaducar = s.inventory.filter((p) => daysUntil(p.expiry) <= 60);
  const conDeuda = s.clients.filter((c) => c.debt > 0);
  const ingresos = s.invoices.reduce((t, f) => t + f.total, 0);
  const MAXA = 3;
  const kpis = [
    { label: "Citas de hoy", value: citasHoy.length, sub: `${citasHoy.filter((a) => a.status === "confirmada").length} confirmadas`, icon: CalendarDays, tone: T.green, go: "citas" },
    { label: "En estética", value: enEstetica.length, sub: "pendientes o en proceso", icon: Scissors, tone: T.blue, go: "peluqueria" },
    { label: "Alertas de stock", value: stockBajo.length + porCaducar.length, sub: `${stockBajo.length} bajos · ${porCaducar.length} por caducar`, icon: Package, tone: T.amber, go: "inventario" },
    { label: "Ingresos de hoy", value: money(ingresos), sub: `${s.invoices.length} facturas emitidas`, icon: Receipt, tone: T.dark, go: "facturacion" },
  ];
  return (
    <div>
      <SectionHead title="Buen día 👋" sub={`Hoy es ${hoy}. Este es el pulso de la clínica.`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4 cursor-pointer hover:shadow-md transition-shadow" style={{}} >
            <button onClick={() => s.go(k.go)} className="w-full text-left">
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>{k.label}</span>
                <k.icon size={16} color={k.tone} />
              </div>
              <div style={{ fontFamily: F.head, fontSize: 26, fontWeight: 700, color: T.ink, letterSpacing: -0.5 }}>{k.value}</div>
              <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>{k.sub}</div>
            </button>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600 }}>Agenda de hoy</h2>
            <Btn small kind="ghost" onClick={() => s.go("citas")}>Ver calendario <ChevronRight size={13} /></Btn>
          </div>
          {citasHoy.sort((a, b) => a.time.localeCompare(b.time)).map((a) => {
            const pat = s.patients.find((p) => p.id === a.patientId);
            const owner = s.clients.find((c) => c.id === pat.clientId);
            const vet = s.vets.find((v) => v.id === a.vetId);
            return (
              <div key={a.id} className="flex items-center flex-wrap gap-x-3 gap-y-1 py-2.5" style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                <span style={{ fontFamily: F.head, fontWeight: 600, fontSize: 13, width: 46, color: T.ink, fontVariantNumeric: "tabular-nums" }}>{a.time}</span>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{pat.name} <span style={{ fontWeight: 400, color: T.sub }}>· {owner.name}</span></div>
                  <div style={{ fontSize: 12, color: T.sub }}>{a.reason} · {vet.name}</div>
                </div>
                <PatientAlerts p={pat} small />
                <Badge tone={a.status === "confirmada" ? "green" : a.status === "completada" ? "blue" : "amber"}>{a.status}</Badge>
              </div>
            );
          })}
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h2 style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600, marginBottom: 14 }} className="flex items-center gap-2"><Bell size={15} color={T.amber} /> Alertas operativas</h2>
          <div className="flex flex-col gap-2.5">
            {stockBajo.slice(0, MAXA).map((p) => (
              <div key={p.id} className="flex items-center gap-2" style={{ background: T.amberSoft, borderRadius: 10, padding: "9px 11px", fontSize: 12.5 }}>
                <Package size={14} color={T.amber} /><span><b>{p.name}</b>: {p.stock} uds (mín. {p.minStock}). Reabastecer.</span>
              </div>
            ))}
            {stockBajo.length > MAXA && (
              <button onClick={() => s.go("inventario")} className="text-left" style={{ fontSize: 12, color: T.amber, fontWeight: 600 }}>+{stockBajo.length - MAXA} productos más con stock bajo → Inventario</button>
            )}
            {porCaducar.slice(0, MAXA).map((p) => (
              <div key={p.id} className="flex items-center gap-2" style={{ background: T.redSoft, borderRadius: 10, padding: "9px 11px", fontSize: 12.5 }}>
                <Clock size={14} color={T.red} /><span><b>{p.name}</b> caduca en {daysUntil(p.expiry)} días.</span>
              </div>
            ))}
            {porCaducar.length > MAXA && (
              <button onClick={() => s.go("inventario")} className="text-left" style={{ fontSize: 12, color: T.red, fontWeight: 600 }}>+{porCaducar.length - MAXA} productos más por caducar → Inventario</button>
            )}
            {conDeuda.slice(0, MAXA).map((c) => (
              <button key={c.id} onClick={() => s.go("crm", { clientId: c.id })} className="flex items-center gap-2 text-left" style={{ background: T.blueSoft, borderRadius: 10, padding: "9px 11px", fontSize: 12.5 }}>
                <Receipt size={14} color={T.blue} /><span><b>{c.name}</b> tiene deuda pendiente de {money(c.debt)}.</span>
              </button>
            ))}
            {conDeuda.length > MAXA && (
              <button onClick={() => s.go("facturacion")} className="text-left" style={{ fontSize: 12, color: T.blue, fontWeight: 600 }}>+{conDeuda.length - MAXA} clientes más con deuda → Facturación</button>
            )}
            {stockBajo.length + porCaducar.length + conDeuda.length === 0 && (
              <p style={{ fontSize: 13, color: T.sub }}>Sin alertas. Todo en orden ✨</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================
   CRM — listado maestro-detalle con búsqueda SOLO por cliente
   (nombre/teléfono/correo, nunca mezclada con mascotas) y
   paginación del lado servidor (simulada): con 6.000 clientes
   jamás se renderiza el catálogo completo.
================================================================ */
const CRM_PAGE_SIZE = 6;
function CRM() {
  const s = useVet();
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [page, setPage] = useState(0);
  const [res, setRes] = useState({ loading: true, rows: [], total: 0 });
  const [sel, setSel] = useState(s.nav.ctx?.clientId || "c1");
  const [modal, setModal] = useState(null); // 'client' | 'patient'
  useEffect(() => { if (s.nav.ctx?.clientId) setSel(s.nav.ctx.clientId); }, [s.nav.ctx]);
  useEffect(() => { setPage(0); }, [dq]);
  useEffect(() => {
    let alive = true;
    setRes((r) => ({ ...r, loading: true }));
    fetchClientsPageApi(dq, page, CRM_PAGE_SIZE).then((r) => { if (alive) setRes({ loading: false, rows: r.rows, total: r.total }); });
    return () => { alive = false; };
  }, [dq, page, s.clients]);
  const client = s.clients.find((c) => c.id === sel);
  const pets = s.patients.filter((p) => p.clientId === sel);
  const account = s.accounts.find((a) => a.clientId === sel);
  const accTotal = account ? account.items.reduce((t, i) => t + i.amount, 0) : 0;
  return (
    <div>
      <SectionHead title="Clientes y Pacientes" sub="Una sola fuente de verdad: cada dueño vinculado a sus mascotas."
        action={<Btn onClick={() => setModal("client")}><Plus size={14} /> Nuevo cliente</Btn>} />
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-1" style={{ ...inputSt, padding: "8px 11px" }}>
            <Search size={14} color={T.sub} className="shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente (nombre, teléfono, correo)…"
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%", color: T.ink }} />
            {res.loading && <Spinner />}
          </div>
          <p style={{ fontSize: 11, color: T.sub, margin: "0 2px 10px" }}>La búsqueda es solo por cliente; sus mascotas se ven en el detalle.</p>
          <div className="flex flex-col">
            {res.loading && [0, 1, 2, 3].map((i) => (
              <div key={i} className="mb-1.5" style={{ height: 46, borderRadius: 10, background: "#F0EDE4", animation: "vsPulse 1.2s ease-in-out infinite" }} />
            ))}
            {!res.loading && res.rows.map((c) => {
              const petCount = s.patients.filter((p) => p.clientId === c.id).length;
              const active = c.id === sel;
              return (
                <button key={c.id} onClick={() => setSel(c.id)} className="text-left px-3 py-2.5 mb-1"
                  style={{ borderRadius: 10, background: active ? T.greenSoft : "transparent", border: `1px solid ${active ? T.green : "transparent"}` }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate" style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{c.name}</span>
                    {c.debt > 0 && <Badge tone="red">Debe {money(c.debt)}</Badge>}
                  </div>
                  <div style={{ fontSize: 11.5, color: T.sub }}>{c.phone} · {petCount} mascota{petCount !== 1 ? "s" : ""}</div>
                </button>
              );
            })}
            {!res.loading && res.rows.length === 0 && (
              <p className="px-3 py-4" style={{ fontSize: 13, color: T.sub }}>Sin resultados para “{dq}”. Crea el cliente en menos de 30 segundos con “Nuevo cliente”.</p>
            )}
          </div>
          <Pager page={page} total={res.total} pageSize={CRM_PAGE_SIZE} onPage={setPage} />
        </Card>
        {client && (
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 style={{ fontFamily: F.head, fontSize: 18, fontWeight: 700 }}>{client.name}</h2>
                  <p style={{ fontSize: 12.5, color: T.sub, marginTop: 2 }}>{client.phone} · {client.email}</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  {client.debt > 0 && <Badge tone="red"><AlertTriangle size={11} /> Deuda: {money(client.debt)}</Badge>}
                  {account && <Badge tone="blue">Cuenta abierta: {money(accTotal)}</Badge>}
                  <Btn small kind="ghost" onClick={() => setModal("patient")}><Plus size={13} /> Mascota</Btn>
                </div>
              </div>
            </Card>
            <div className="grid sm:grid-cols-2 gap-3">
              {pets.map((p) => {
                const Icon = SPECIES_ICON[p.species] || PawPrint;
                return (
                  <Card key={p.id} className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 12, background: T.greenSoft }}>
                        <Icon size={19} color={T.green} />
                      </div>
                      <div className="min-w-0">
                        <div style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: T.sub }}>{p.species} · {p.breed} · {p.age}</div>
                      </div>
                    </div>
                    <div className="mb-3"><PatientAlerts p={p} /></div>
                    <div className="flex gap-2">
                      <Btn small kind="ghost" onClick={() => s.go("clinica", { patientId: p.id })}><FileText size={12} /> Historial</Btn>
                      <Btn small kind="ghost" onClick={() => s.go("citas", { patientId: p.id })}><CalendarDays size={12} /> Agendar</Btn>
                    </div>
                  </Card>
                );
              })}
              {pets.length === 0 && (
                <Card className="p-6 sm:col-span-2 text-center">
                  <p style={{ fontSize: 13, color: T.sub }}>Este cliente aún no tiene pacientes. Añade la primera mascota para habilitar citas, estética y clínica.</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
      {modal === "client" && <NewClientModal onClose={() => setModal(null)} onCreated={(id) => { setSel(id); setModal(null); }} />}
      {modal === "patient" && <NewPatientModal clientId={sel} onClose={() => setModal(null)} />}
    </div>
  );
}
function NewClientModal({ onClose, onCreated }) {
  const s = useVet();
  const [f, setF] = useState({ name: "", phone: "", email: "" });
  return (
    <Modal title="Nuevo cliente" onClose={onClose}>
      <Field label="Nombre completo"><input style={inputSt} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ej: Ana Cevallos" /></Field>
      <Field label="Teléfono (WhatsApp)"><input style={inputSt} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="099 000 0000" /></Field>
      <Field label="Correo"><input style={inputSt} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="correo@mail.com" /></Field>
      <Btn full disabled={!f.name || !f.phone} onClick={() => onCreated(s.addClient(f))}>Crear cliente</Btn>
    </Modal>
  );
}
function NewPatientModal({ clientId, onClose }) {
  const s = useVet();
  const [f, setF] = useState({ name: "", species: "Perro", breed: "", age: "", allergiesText: "", aggressive: false });
  return (
    <Modal title="Nueva mascota" onClose={onClose}>
      <Field label="Nombre"><input style={inputSt} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ej: Toby" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Especie">
          <select style={inputSt} value={f.species} onChange={(e) => setF({ ...f, species: e.target.value })}>
            {["Perro", "Gato", "Ave", "Otro"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Edad"><input style={inputSt} value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} placeholder="3 años" /></Field>
      </div>
      <Field label="Raza"><input style={inputSt} value={f.breed} onChange={(e) => setF({ ...f, breed: e.target.value })} placeholder="Ej: Labrador" /></Field>
      <Field label="Alergias (separadas por coma)"><input style={inputSt} value={f.allergiesText} onChange={(e) => setF({ ...f, allergiesText: e.target.value })} placeholder="Penicilina, …" /></Field>
      <label className="flex items-center gap-2 mb-4" style={{ fontSize: 13, color: T.ink }}>
        <input type="checkbox" checked={f.aggressive} onChange={(e) => setF({ ...f, aggressive: e.target.checked })} />
        Marcar como paciente agresivo (alerta visual para el equipo)
      </label>
      <Btn full disabled={!f.name} onClick={() => {
        s.addPatient({ clientId, name: f.name, species: f.species, breed: f.breed, age: f.age, aggressive: f.aggressive, allergies: f.allergiesText.split(",").map((x) => x.trim()).filter(Boolean) });
        onClose();
      }}>Registrar paciente</Btn>
    </Modal>
  );
}

/* ============================ CITAS ============================ */
function Citas() {
  const s = useVet();
  const [modal, setModal] = useState(null); // {vetId, time} | 'free'
  const [detail, setDetail] = useState(null); // appointment id
  const apptAt = (vetId, time) => s.appointments.find((a) => a.vetId === vetId && a.time === time && a.status !== "cancelada");
  const statusTone = { pendiente: "amber", confirmada: "green", completada: "blue" };
  const det = detail && s.appointments.find((a) => a.id === detail);
  return (
    <div>
      <SectionHead title="Citas" sub={`Hoy, ${hoy} · la matriz cruza médicos y horarios: no permite sobreagendar.`}
        action={<Btn onClick={() => setModal("free")}><Plus size={14} /> Nueva cita</Btn>} />
      <Card className="p-4" style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 640 }}>
          <div className="grid" style={{ gridTemplateColumns: `64px repeat(${s.vets.length}, 1fr)`, gap: 6 }}>
            <div />
            {s.vets.map((v) => (
              <div key={v.id} className="flex items-center gap-2 px-2 py-2" style={{ borderBottom: `2px solid ${v.color}` }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: v.color }} />
                <span style={{ fontFamily: F.head, fontSize: 12.5, fontWeight: 600 }}>{v.name}</span>
              </div>
            ))}
            {HOURS.map((h) => (
              <React.Fragment key={h}>
                <div style={{ fontSize: 11.5, color: T.sub, padding: "12px 4px 0", fontVariantNumeric: "tabular-nums" }}>{h}</div>
                {s.vets.map((v) => {
                  const a = apptAt(v.id, h);
                  if (!a) return (
                    <button key={v.id + h} onClick={() => setModal({ vetId: v.id, time: h })}
                      className="group flex items-center justify-center"
                      style={{ border: `1px dashed ${T.line}`, borderRadius: 10, minHeight: 52, color: T.sub }}>
                      <Plus size={14} className="opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                  const pat = s.patients.find((p) => p.id === a.patientId);
                  return (
                    <button key={v.id + h} onClick={() => setDetail(a.id)} className="text-left px-2.5 py-2"
                      style={{ borderRadius: 10, minHeight: 52, background: a.status === "completada" ? "#F0EFE9" : T.greenSoft, borderLeft: `3px solid ${v.color}` }}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: T.ink }}>{pat.name}</span>
                        <PatientAlerts p={pat} small />
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <span style={{ fontSize: 11, color: T.sub }} className="truncate">{a.reason}</span>
                        <Badge tone={statusTone[a.status]}>{a.status}</Badge>
                      </div>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>
      {modal && <NewApptModal preset={modal === "free" ? null : modal} onClose={() => setModal(null)} />}
      {det && <ApptDetailModal appt={det} onClose={() => setDetail(null)} />}
    </div>
  );
}
/* La cita parte del cliente: primero se busca al dueño (typeahead
   asíncrono), luego se elige entre SUS mascotas. */
function NewApptModal({ preset, onClose }) {
  const s = useVet();
  const ctxPat = s.nav.ctx?.patientId ? s.patients.find((p) => p.id === s.nav.ctx.patientId) : null;
  const [client, setClient] = useState(ctxPat ? s.clients.find((c) => c.id === ctxPat.clientId) : null);
  const [patientId, setPatientId] = useState(ctxPat ? ctxPat.id : null);
  const [f, setF] = useState({ vetId: preset?.vetId || s.vets[0].id, time: preset?.time || "08:00", reason: "" });
  return (
    <Modal title="Nueva cita" onClose={onClose} width={500}>
      <Field label="1 · Cliente">
        <ClientSearch autoFocus selected={client} onSelect={(c) => { setClient(c); setPatientId(null); }} />
      </Field>
      <Field label="2 · Paciente (mascotas del cliente)">
        <PatientPicker clientId={client?.id} value={patientId} onChange={setPatientId} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Médico">
          <select style={inputSt} value={f.vetId} onChange={(e) => setF({ ...f, vetId: e.target.value })}>
            {s.vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </Field>
        <Field label="Hora">
          <select style={inputSt} value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })}>
            {HOURS.map((h) => <option key={h}>{h}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Motivo"><input style={inputSt} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} placeholder="Ej: Vacunación, control, cirugía…" /></Field>
      <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }} className="flex items-center gap-1.5">
        <MessageCircle size={13} color={T.wa} /> Al agendar se envía confirmación automática por WhatsApp, con recordatorios 24 h y 2 h antes.
      </p>
      <Btn full disabled={!patientId || !f.reason} onClick={() => { if (s.createAppt({ ...f, patientId })) onClose(); }}>Agendar y notificar</Btn>
    </Modal>
  );
}
function ApptDetailModal({ appt, onClose }) {
  const s = useVet();
  const pat = s.patients.find((p) => p.id === appt.patientId);
  const owner = s.clients.find((c) => c.id === pat.clientId);
  const vet = s.vets.find((v) => v.id === appt.vetId);
  return (
    <Modal title={`Cita · ${appt.time}`} onClose={onClose}>
      <div className="mb-4">
        <div style={{ fontFamily: F.head, fontSize: 17, fontWeight: 700 }}>{pat.name} <span style={{ fontWeight: 400, fontSize: 13, color: T.sub }}>({pat.species} · {pat.breed})</span></div>
        <div style={{ fontSize: 13, color: T.sub, marginTop: 3 }}>{owner.name} · {owner.phone}</div>
        <div style={{ fontSize: 13, color: T.sub }}>{appt.reason} · {vet.name}</div>
        <div className="mt-2"><PatientAlerts p={pat} /></div>
      </div>
      <div className="flex flex-col gap-2">
        {appt.status === "pendiente" && <Btn kind="wa" full onClick={() => { s.setAppt(appt.id, "confirmada"); onClose(); }}><MessageCircle size={14} /> Confirmar por WhatsApp</Btn>}
        {appt.status !== "completada" && <Btn kind="dark" full onClick={() => { s.setAppt(appt.id, "completada"); s.go("clinica", { patientId: pat.id }); }}><Stethoscope size={14} /> Pasar a consulta médica</Btn>}
        {appt.status !== "completada" && <Btn kind="danger" full onClick={() => { s.setAppt(appt.id, "cancelada"); onClose(); }}>Cancelar y liberar espacio</Btn>}
      </div>
    </Modal>
  );
}

/* ============================ PELUQUERÍA ============================ */
function Peluqueria() {
  const s = useVet();
  const [modal, setModal] = useState(false);
  const cols = [
    { k: "pendiente", label: "Pendiente", tone: T.amber, soft: T.amberSoft },
    { k: "proceso", label: "En proceso", tone: T.blue, soft: T.blueSoft },
    { k: "terminado", label: "Terminado", tone: T.green, soft: T.greenSoft },
  ];
  return (
    <div>
      <SectionHead title="Peluquería y Estética" sub="Tablero Kanban con cronómetro por peluquero. Al terminar, el sistema avisa al dueño por WhatsApp y carga el servicio a facturación."
        action={<Btn onClick={() => setModal(true)}><Plus size={14} /> Check-in</Btn>} />
      <div className="grid md:grid-cols-3 gap-4">
        {cols.map((col) => {
          const items = s.grooming.filter((g) => g.status === col.k);
          return (
            <div key={col.k}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <span style={{ width: 9, height: 9, borderRadius: 99, background: col.tone }} />
                <span style={{ fontFamily: F.head, fontSize: 13.5, fontWeight: 600 }}>{col.label}</span>
                <span style={{ fontSize: 12, color: T.sub }}>({items.length})</span>
              </div>
              <div className="flex flex-col gap-3" style={{ minHeight: 120, background: "#F1EFE7", borderRadius: 14, padding: 10 }}>
                {items.map((g) => {
                  const pat = s.patients.find((p) => p.id === g.patientId);
                  const owner = s.clients.find((c) => c.id === pat.clientId);
                  const dur = g.finishedAt && g.startedAt ? Math.round((g.finishedAt - g.startedAt) / 60000) : null;
                  return (
                    <Card key={g.id} className="p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontFamily: F.head, fontSize: 14, fontWeight: 700 }}>{pat.name}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: T.green }}>{money(g.price)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: T.sub }}>{g.service} · {owner.name}</div>
                      <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>🎒 {g.belongings || "Sin pertenencias"} · ✂️ {g.groomer}</div>
                      {pat.aggressive && <div className="mt-1.5"><Badge tone="red"><ShieldAlert size={11} /> Manejo con precaución</Badge></div>}
                      {g.status === "proceso" && (
                        <div className="mt-2 inline-flex items-center gap-1.5" style={{ background: T.blueSoft, color: T.blue, borderRadius: 8, padding: "3px 9px", fontSize: 12, fontWeight: 600 }}>
                          <Clock size={12} /> <Elapsed since={g.startedAt} />
                        </div>
                      )}
                      {dur !== null && <div className="mt-1.5" style={{ fontSize: 11.5, color: T.sub }}>⏱ Ejecutado en {dur} min</div>}
                      <div className="mt-3">
                        {g.status === "pendiente" && <Btn small full kind="dark" onClick={() => s.moveGroom(g.id, "proceso")}>Iniciar servicio</Btn>}
                        {g.status === "proceso" && <Btn small full onClick={() => s.moveGroom(g.id, "terminado")}><CheckCircle2 size={13} /> Terminar y notificar</Btn>}
                        {g.status === "terminado" && <Btn small full kind="ghost" onClick={() => s.moveGroom(g.id, "entregado")}>Marcar entregado</Btn>}
                      </div>
                    </Card>
                  );
                })}
                {items.length === 0 && <p className="text-center py-6" style={{ fontSize: 12, color: T.sub }}>Sin mascotas aquí.</p>}
              </div>
            </div>
          );
        })}
      </div>
      {modal && <CheckInModal onClose={() => setModal(false)} />}
    </div>
  );
}
function CheckInModal({ onClose }) {
  const s = useVet();
  const [client, setClient] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [f, setF] = useState({ service: "Baño completo", belongings: "", groomer: "Sofía" });
  return (
    <Modal title="Check-in de estética" onClose={onClose} width={500}>
      <Field label="1 · Cliente">
        <ClientSearch autoFocus selected={client} onSelect={(c) => { setClient(c); setPatientId(null); }} />
      </Field>
      <Field label="2 · Paciente (mascotas del cliente)">
        <PatientPicker clientId={client?.id} value={patientId} onChange={setPatientId} />
      </Field>
      <Field label="Servicio">
        <select style={inputSt} value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })}>
          {Object.entries(GROOM_SERVICES).map(([k, v]) => <option key={k} value={k}>{k} — {money(v)}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Peluquero asignado">
          <select style={inputSt} value={f.groomer} onChange={(e) => setF({ ...f, groomer: e.target.value })}>
            {["Sofía", "David", "Paola"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Pertenencias"><input style={inputSt} value={f.belongings} onChange={(e) => setF({ ...f, belongings: e.target.value })} placeholder="Collar, correa…" /></Field>
      </div>
      <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>📷 En producción: se adjunta foto del estado de llegada como respaldo.</p>
      <Btn full disabled={!patientId} onClick={() => { s.checkInGroom({ ...f, patientId }); onClose(); }}>Registrar check-in</Btn>
    </Modal>
  );
}

/* ================================================================
   CLÍNICA — el expediente también parte del cliente: se busca al
   dueño, se elige su mascota y se abre el historial. Se añade la
   lista de "atendidos recientemente" (patrón recents de los EHR
   grandes) para reabrir expedientes sin repetir la búsqueda.
================================================================ */
function Clinica() {
  const s = useVet();
  const ctxPatId = s.nav.ctx?.patientId || null;
  const [selPat, setSelPat] = useState(ctxPatId);
  const [client, setClient] = useState(() => {
    if (!ctxPatId) return null;
    const p = useVet.getState().patients.find((x) => x.id === ctxPatId);
    return p ? useVet.getState().clients.find((c) => c.id === p.clientId) : null;
  });
  const [modal, setModal] = useState(null); // 'consulta' | 'insumo' | 'lab' | 'receta'
  useEffect(() => {
    if (ctxPatId) {
      const p = useVet.getState().patients.find((x) => x.id === ctxPatId);
      if (p) { setSelPat(p.id); setClient(useVet.getState().clients.find((c) => c.id === p.clientId)); }
    }
  }, [ctxPatId]);
  const pat = s.patients.find((p) => p.id === selPat) || null;
  const owner = pat ? s.clients.find((c) => c.id === pat.clientId) : null;
  const recs = s.records.filter((r) => r.patientId === selPat);
  const latest = recs[0];
  const recents = useMemo(() => {
    const seen = new Set(); const out = [];
    for (const r of s.records) {
      if (!seen.has(r.patientId)) { seen.add(r.patientId); out.push(r.patientId); if (out.length >= 5) break; }
    }
    return out;
  }, [s.records]);
  const patientOrders = s.labOrders.filter((o) => o.patientId === selPat);
  const otherPending = s.labOrders.filter((o) => o.status === "solicitado" && o.patientId !== selPat);
  const pickRecent = (pid) => {
    const p = s.patients.find((x) => x.id === pid);
    if (p) { setSelPat(pid); setClient(s.clients.find((c) => c.id === p.clientId)); }
  };
  return (
    <div>
      <SectionHead title="Clínica y Laboratorio" sub="Historial clínico estructurado e inalterable. Cada insumo aplicado descuenta inventario y carga la cuenta del cliente automáticamente."
        action={pat && <Btn onClick={() => setModal("consulta")}><Stethoscope size={14} /> Nueva consulta</Btn>} />
      <div className="grid lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <Field label="1 · Cliente">
            <ClientSearch selected={client} onSelect={(c) => { setClient(c); setSelPat(null); }} />
          </Field>
          <Field label="2 · Paciente">
            <PatientPicker clientId={client?.id} value={selPat} onChange={setSelPat} />
          </Field>
          <div className="mt-4">
            <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 11, fontWeight: 600, color: T.sub, letterSpacing: 0.3, textTransform: "uppercase" }}>
              <History size={12} /> Atendidos recientemente
            </div>
            {recents.map((pid) => {
              const p = s.patients.find((x) => x.id === pid);
              const o = p && s.clients.find((c) => c.id === p.clientId);
              if (!p) return null;
              return (
                <button key={pid} onClick={() => pickRecent(pid)} className="vs-opt w-full text-left px-2.5 py-2 mb-1" style={{ borderRadius: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: T.sub }}> · {o?.name}</span>
                </button>
              );
            })}
            {recents.length === 0 && <p style={{ fontSize: 12, color: T.sub }}>Aún no hay consultas registradas.</p>}
          </div>
        </Card>
        <div className="lg:col-span-2 flex flex-col gap-3">
          {!pat && (
            <Card className="p-8 text-center">
              <Stethoscope size={22} color={T.sub} className="mx-auto mb-2" />
              <p style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>Busca al cliente para abrir un expediente</p>
              <p style={{ fontSize: 12.5, color: T.sub, marginTop: 4 }}>Escribe el nombre, teléfono o correo del dueño, elige la mascota y verás su historial completo. También puedes reabrir un paciente reciente.</p>
            </Card>
          )}
          {pat && (
            <Card className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span style={{ fontFamily: F.head, fontSize: 16, fontWeight: 700 }}>{pat.name}</span>
                  <span style={{ fontSize: 12.5, color: T.sub }}> · {pat.breed} · {pat.age} · Dueño: {owner.name}</span>
                </div>
                <PatientAlerts p={pat} />
              </div>
            </Card>
          )}
          {pat && latest && (
            <div className="flex gap-2 flex-wrap">
              <Btn small kind="ghost" onClick={() => setModal("insumo")}><Syringe size={13} /> Aplicar insumo</Btn>
              <Btn small kind="ghost" onClick={() => setModal("lab")}><FlaskConical size={13} /> Orden de laboratorio</Btn>
              <Btn small kind="ghost" onClick={() => setModal("receta")}><Send size={13} /> Emitir receta</Btn>
            </div>
          )}
          {pat && recs.map((r, i) => {
            const vet = s.vets.find((v) => v.id === r.vetId);
            return (
              <Card key={r.id} className="p-4" style={i === 0 ? { borderColor: T.green } : {}}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span style={{ fontFamily: F.head, fontSize: 13.5, fontWeight: 600 }}>
                    {new Date(r.date).toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" })} · {vet?.name}
                  </span>
                  {i === 0 && <Badge tone="green">Consulta activa</Badge>}
                </div>
                <div className="flex gap-2 flex-wrap mb-2">
                  {Object.entries(r.vitals || {}).map(([k, v]) => (
                    <span key={k} style={{ background: "#F1EFE7", borderRadius: 8, padding: "3px 9px", fontSize: 11.5, color: T.ink }}>
                      {k === "weight" ? "Peso" : k === "temp" ? "Temp" : "FC"}: <b>{v}</b>
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: 12.5, color: T.sub, marginBottom: 6 }}><b style={{ color: T.ink }}>Anamnesis:</b> {r.anamnesis}</p>
                <p style={{ fontSize: 12.5, color: T.sub }}><b style={{ color: T.ink }}>Diagnóstico:</b> {r.diagnosis}</p>
                {r.products.length > 0 && (
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    {r.products.map((p, j) => <Badge key={j} tone="blue"><Syringe size={11} /> {p.name} ×{p.qty}</Badge>)}
                  </div>
                )}
                {r.prescriptions.length > 0 && (
                  <div className="mt-2">
                    {r.prescriptions.map((rx, j) => (
                      <div key={j} style={{ fontSize: 12, color: T.sub }}>℞ <b style={{ color: T.ink }}>{rx.med}</b> — {rx.dosage}</div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
          {pat && recs.length === 0 && (
            <Card className="p-6 text-center">
              <p style={{ fontSize: 13, color: T.sub }}>Sin consultas registradas para {pat.name}. Abre la primera con “Nueva consulta”.</p>
            </Card>
          )}
        </div>
        <Card className="p-4">
          <h3 className="flex items-center gap-2 mb-3" style={{ fontFamily: F.head, fontSize: 14, fontWeight: 600 }}>
            <FlaskConical size={15} color={T.blue} /> Laboratorio
          </h3>
          {pat && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 8 }}>Órdenes de {pat.name}</div>
              <div className="flex flex-col gap-2.5 mb-4">
                {patientOrders.map((o) => <LabOrderCard key={o.id} order={o} />)}
                {patientOrders.length === 0 && <p style={{ fontSize: 12.5, color: T.sub }}>Sin órdenes para este paciente.</p>}
              </div>
            </>
          )}
          <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 8 }}>
            Cola pendiente de la clínica ({otherPending.length})
          </div>
          <div className="flex flex-col gap-2.5">
            {otherPending.slice(0, 4).map((o) => <LabOrderCard key={o.id} order={o} />)}
            {otherPending.length > 4 && <p style={{ fontSize: 11.5, color: T.sub }}>+{otherPending.length - 4} órdenes más en cola.</p>}
            {otherPending.length === 0 && <p style={{ fontSize: 12.5, color: T.sub }}>No hay resultados pendientes de otros pacientes.</p>}
          </div>
        </Card>
      </div>
      {modal === "consulta" && pat && <ConsultaModal patientId={pat.id} onClose={() => setModal(null)} />}
      {modal === "insumo" && latest && <InsumoModal record={latest} onClose={() => setModal(null)} />}
      {modal === "lab" && pat && <LabModal patientId={pat.id} onClose={() => setModal(null)} />}
      {modal === "receta" && latest && <RecetaModal record={latest} onClose={() => setModal(null)} />}
    </div>
  );
}
function LabOrderCard({ order }) {
  const s = useVet();
  const [result, setResult] = useState("");
  const pat = s.patients.find((p) => p.id === order.patientId);
  return (
    <div style={{ border: `1px solid ${T.lineSoft}`, borderRadius: 12, padding: "10px 12px" }}>
      <div className="flex items-center justify-between gap-2">
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{order.test}</span>
        <Badge tone={order.status === "resultado" ? "green" : "amber"}>{order.status}</Badge>
      </div>
      <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>{pat?.name} · {money(order.price)}</div>
      {order.status === "solicitado" ? (
        <div className="mt-2 flex flex-col gap-1.5">
          <input style={{ ...inputSt, padding: "6px 9px", fontSize: 12 }} value={result} onChange={(e) => setResult(e.target.value)} placeholder="Resumen del resultado…" />
          <Btn small kind="ghost" disabled={!result} onClick={() => s.loadLabResult(order.id, result)}>Cargar resultado</Btn>
        </div>
      ) : (
        <p style={{ fontSize: 11.5, color: T.ink, marginTop: 4, background: T.greenSoft, borderRadius: 8, padding: "5px 8px" }}>{order.result}</p>
      )}
    </div>
  );
}
function ConsultaModal({ patientId, onClose }) {
  const s = useVet();
  const [f, setF] = useState({ vetId: s.vets[0].id, weight: "", temp: "", hr: "", anamnesis: "", diagnosis: "" });
  return (
    <Modal title="Nueva consulta médica" onClose={onClose} width={520}>
      <Field label="Médico tratante">
        <select style={inputSt} value={f.vetId} onChange={(e) => setF({ ...f, vetId: e.target.value })}>
          {s.vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Peso"><input style={inputSt} value={f.weight} onChange={(e) => setF({ ...f, weight: e.target.value })} placeholder="12.5 kg" /></Field>
        <Field label="Temperatura"><input style={inputSt} value={f.temp} onChange={(e) => setF({ ...f, temp: e.target.value })} placeholder="38.5 °C" /></Field>
        <Field label="Frec. cardíaca"><input style={inputSt} value={f.hr} onChange={(e) => setF({ ...f, hr: e.target.value })} placeholder="90 lpm" /></Field>
      </div>
      <Field label="Anamnesis (síntomas reportados)"><textarea style={{ ...inputSt, minHeight: 64 }} value={f.anamnesis} onChange={(e) => setF({ ...f, anamnesis: e.target.value })} placeholder="¿Qué reporta el dueño?" /></Field>
      <Field label="Diagnóstico presuntivo"><textarea style={{ ...inputSt, minHeight: 64 }} value={f.diagnosis} onChange={(e) => setF({ ...f, diagnosis: e.target.value })} /></Field>
      <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>Al guardar se cobra la consulta ({money(CONSULT_FEE)}) a la cuenta abierta del cliente.</p>
      <Btn full disabled={!f.anamnesis || !f.diagnosis} onClick={() => {
        s.createRecord({ patientId, vetId: f.vetId, vitals: { weight: f.weight, temp: f.temp, hr: f.hr }, anamnesis: f.anamnesis, diagnosis: f.diagnosis });
        onClose();
      }}>Guardar consulta</Btn>
    </Modal>
  );
}
/* El insumo también se BUSCA (con miles de SKUs un <select> global
   es inusable): filtro por nombre/categoría, máx. 8 coincidencias. */
function InsumoModal({ record, onClose }) {
  const s = useVet();
  const [pq, setPq] = useState("");
  const [prodId, setProdId] = useState(null);
  const [qty, setQty] = useState(1);
  const prod = s.inventory.find((p) => p.id === prodId);
  const matches = s.inventory.filter((p) => p.stock > 0 && (p.name + " " + p.category).toLowerCase().includes(pq.toLowerCase())).slice(0, 8);
  return (
    <Modal title="Aplicar insumo clínico" onClose={onClose}>
      {!prod ? (
        <>
          <Field label="Buscar producto en inventario">
            <input autoFocus style={inputSt} value={pq} onChange={(e) => setPq(e.target.value)} placeholder="Nombre o categoría… (ej: vacuna)" />
          </Field>
          <div className="flex flex-col gap-1.5 mb-2">
            {matches.map((p) => (
              <button key={p.id} className="vs-opt flex items-center justify-between gap-2 text-left px-3 py-2" style={{ border: `1px solid ${T.line}`, borderRadius: 10 }} onClick={() => setProdId(p.id)}>
                <span className="min-w-0"><span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span><span style={{ fontSize: 11.5, color: T.sub }}> · {p.category}</span></span>
                <span className="shrink-0" style={{ fontSize: 12, color: T.sub }}>stock {p.stock} · {money(p.price)}</span>
              </button>
            ))}
            {matches.length === 0 && <p style={{ fontSize: 12.5, color: T.sub }}>Sin productos con stock que coincidan con “{pq}”.</p>}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 mb-3" style={{ border: `1px solid ${T.green}`, background: T.greenSoft, borderRadius: 10, padding: "8px 12px" }}>
            <div className="min-w-0">
              <div className="truncate" style={{ fontSize: 13.5, fontWeight: 700 }}>{prod.name}</div>
              <div style={{ fontSize: 11.5, color: T.sub }}>{prod.category} · stock {prod.stock} · {money(prod.price)} c/u</div>
            </div>
            <button onClick={() => setProdId(null)} title="Cambiar producto" className="shrink-0" style={{ color: T.sub }}><X size={15} /></button>
          </div>
          <Field label="Cantidad"><input type="number" min={1} style={inputSt} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} /></Field>
          <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>Se descontará del inventario de forma instantánea y se cargarán {money(prod.price * qty)} a la cuenta abierta del cliente.</p>
          <Btn full onClick={() => { s.applyProduct(record.id, record.patientId, prod.id, qty); onClose(); }}>Aplicar y descontar</Btn>
        </>
      )}
    </Modal>
  );
}
function LabModal({ patientId, onClose }) {
  const s = useVet();
  const [test, setTest] = useState(Object.keys(LAB_TESTS)[0]);
  return (
    <Modal title="Orden de laboratorio" onClose={onClose}>
      <Field label="Examen">
        <select style={inputSt} value={test} onChange={(e) => setTest(e.target.value)}>
          {Object.entries(LAB_TESTS).map(([k, v]) => <option key={k} value={k}>{k} — {money(v)}</option>)}
        </select>
      </Field>
      <Btn full onClick={() => { s.orderLab(patientId, test); onClose(); }}>Generar orden interna</Btn>
    </Modal>
  );
}
function RecetaModal({ record, onClose }) {
  const s = useVet();
  const [f, setF] = useState({ med: "", dosage: "" });
  return (
    <Modal title="Receta digital" onClose={onClose}>
      <Field label="Medicamento"><input style={inputSt} value={f.med} onChange={(e) => setF({ ...f, med: e.target.value })} placeholder="Ej: Amoxicilina 250 mg" /></Field>
      <Field label="Posología"><input style={inputSt} value={f.dosage} onChange={(e) => setF({ ...f, dosage: e.target.value })} placeholder="1 tableta cada 12 h por 7 días" /></Field>
      <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>La receta se valida con firma electrónica del veterinario y se envía por correo y WhatsApp.</p>
      <Btn full kind="wa" disabled={!f.med || !f.dosage} onClick={() => { s.addPrescription(record.id, record.patientId, f.med, f.dosage); onClose(); }}>
        <Send size={14} /> Firmar y enviar
      </Btn>
    </Modal>
  );
}

/* ================================================================
   INVENTARIO — búsqueda + filtro por categoría + paginación:
   con miles de SKUs la tabla nunca se renderiza completa.
================================================================ */
const INV_PAGE_SIZE = 5;
function Inventario() {
  const s = useVet();
  const [modal, setModal] = useState(null); // 'new' | {restockId}
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [q, cat]);
  const filtered = s.inventory.filter((p) =>
    (cat === "Todas" || p.category === cat) &&
    (p.name + " " + p.category).toLowerCase().includes(q.toLowerCase())
  );
  const rows = filtered.slice(page * INV_PAGE_SIZE, page * INV_PAGE_SIZE + INV_PAGE_SIZE);
  return (
    <div>
      <SectionHead title="Inventario" sub="Doble entrada: cada aplicación clínica descuenta stock y carga la cuenta del cliente en tiempo real."
        action={<Btn onClick={() => setModal("new")}><Plus size={14} /> Nuevo producto</Btn>} />
      <div className="flex gap-2 flex-wrap mb-3">
        <div className="flex items-center gap-2 flex-1" style={{ ...inputSt, padding: "8px 11px", minWidth: 200 }}>
          <Search size={14} color={T.sub} className="shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto o categoría…"
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%", color: T.ink }} />
        </div>
        <select style={{ ...inputSt, width: "auto", minWidth: 140 }} value={cat} onChange={(e) => setCat(e.target.value)}>
          {["Todas", "Vacunas", "Medicamentos", "Alimentos", "Estética", "Otros"].map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>
      <Card style={{ overflowX: "auto" }}>
        <table className="w-full" style={{ fontSize: 13, minWidth: 620 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.line}`, textAlign: "left" }}>
              {["Producto", "Categoría", "Stock", "P. venta", "Caducidad", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, color: T.sub, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const low = p.stock <= p.minStock;
              const du = daysUntil(p.expiry);
              return (
                <tr key={p.id} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                  <td style={{ padding: "11px 16px", fontWeight: 600, color: T.ink }}>{p.name}</td>
                  <td style={{ padding: "11px 16px", color: T.sub }}>{p.category}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span className="inline-flex items-center gap-1.5">
                      <b style={{ color: low ? T.red : T.ink, fontVariantNumeric: "tabular-nums" }}>{p.stock}</b>
                      <span style={{ fontSize: 11, color: T.sub }}>/ mín {p.minStock}</span>
                      {low && <Badge tone="red">Bajo</Badge>}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", fontVariantNumeric: "tabular-nums" }}>{money(p.price)}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ color: du <= 60 ? T.red : T.sub, fontSize: 12.5 }}>
                      {p.expiry}{du <= 60 && ` · ${du} días`}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "right" }}>
                    <Btn small kind="ghost" onClick={() => setModal({ restockId: p.id })}>Ingresar lote</Btn>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "20px 16px", fontSize: 12.5, color: T.sub, textAlign: "center" }}>Sin productos que coincidan con el filtro.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
      <Pager page={page} total={filtered.length} pageSize={INV_PAGE_SIZE} onPage={setPage} />
      {modal === "new" && <NewProductModal onClose={() => setModal(null)} />}
      {modal && modal.restockId && <RestockModal productId={modal.restockId} onClose={() => setModal(null)} />}
    </div>
  );
}
function NewProductModal({ onClose }) {
  const s = useVet();
  const [f, setF] = useState({ name: "", category: "Medicamentos", stock: 0, minStock: 5, price: 0, expiry: "2027-01-01" });
  return (
    <Modal title="Nuevo producto" onClose={onClose}>
      <Field label="Nombre"><input style={inputSt} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoría">
          <select style={inputSt} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            {["Vacunas", "Medicamentos", "Alimentos", "Estética", "Otros"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Precio de venta"><input type="number" style={inputSt} value={f.price} onChange={(e) => setF({ ...f, price: +e.target.value || 0 })} /></Field>
        <Field label="Stock inicial"><input type="number" style={inputSt} value={f.stock} onChange={(e) => setF({ ...f, stock: +e.target.value || 0 })} /></Field>
        <Field label="Stock mínimo"><input type="number" style={inputSt} value={f.minStock} onChange={(e) => setF({ ...f, minStock: +e.target.value || 0 })} /></Field>
      </div>
      <Field label="Fecha de caducidad"><input type="date" style={inputSt} value={f.expiry} onChange={(e) => setF({ ...f, expiry: e.target.value })} /></Field>
      <Btn full disabled={!f.name} onClick={() => { s.addProduct(f); onClose(); }}>Ingresar producto</Btn>
    </Modal>
  );
}
function RestockModal({ productId, onClose }) {
  const s = useVet();
  const p = s.inventory.find((x) => x.id === productId);
  const [qty, setQty] = useState(10);
  return (
    <Modal title={`Ingresar lote · ${p.name}`} onClose={onClose}>
      <Field label="Unidades del lote"><input type="number" min={1} style={inputSt} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} /></Field>
      <Btn full onClick={() => { s.restock(productId, qty); onClose(); }}>Añadir al stock</Btn>
    </Modal>
  );
}

/* ================================================================
   FACTURACIÓN — el cobro parte del cliente: buscador para traer su
   cuenta abierta al instante, y ambos listados paginados (con
   cientos de cuentas/facturas nunca se pinta todo el historial).
================================================================ */
const ACC_PAGE_SIZE = 4, INV_HIST_PAGE_SIZE = 5;
function Facturacion() {
  const s = useVet();
  const [fClient, setFClient] = useState(null);
  const [accPage, setAccPage] = useState(0);
  const [invPage, setInvPage] = useState(0);
  const sourceTone = { Clínica: "green", Peluquería: "blue", Laboratorio: "amber" };
  const allAcc = fClient ? s.accounts.filter((a) => a.clientId === fClient.id) : s.accounts;
  const allInv = fClient ? s.invoices.filter((i) => i.clientId === fClient.id) : s.invoices;
  useEffect(() => { setAccPage(0); setInvPage(0); }, [fClient]);
  useEffect(() => {
    const pages = Math.max(1, Math.ceil(allAcc.length / ACC_PAGE_SIZE));
    if (accPage > pages - 1) setAccPage(pages - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAcc.length]);
  const accRows = allAcc.slice(accPage * ACC_PAGE_SIZE, accPage * ACC_PAGE_SIZE + ACC_PAGE_SIZE);
  const invRows = allInv.slice(invPage * INV_HIST_PAGE_SIZE, invPage * INV_HIST_PAGE_SIZE + INV_HIST_PAGE_SIZE);
  return (
    <div>
      <SectionHead title="Facturación" sub="Cuentas abiertas por cliente: consolidan servicios médicos, estética, laboratorio e insumos en un solo cobro." />
      <Card className="p-4 mb-4">
        <Field label="El cobro parte del cliente — búscalo para ver su cuenta y su historial">
          <ClientSearch selected={fClient} onSelect={setFClient} placeholder="Buscar cliente para cobrar…" />
        </Field>
        {!fClient && <p style={{ fontSize: 12, color: T.sub, marginTop: -6 }}>Sin filtro se muestran todas las cuentas abiertas del día, paginadas.</p>}
      </Card>
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <h2 style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Cuentas abiertas ({allAcc.length})</h2>
          <div className="flex flex-col gap-3">
            {accRows.map((acc) => {
              const client = s.clients.find((c) => c.id === acc.clientId);
              const itemsTotal = acc.items.reduce((t, i) => t + i.amount, 0);
              const total = itemsTotal + (client.debt || 0);
              return (
                <Card key={acc.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontFamily: F.head, fontSize: 14.5, fontWeight: 700 }}>{client.name}</span>
                    <span style={{ fontSize: 12, color: T.sub }}>{client.phone}</span>
                  </div>
                  {acc.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 py-1.5" style={{ borderBottom: `1px solid ${T.lineSoft}`, fontSize: 12.5 }}>
                      <span className="flex items-center gap-2 min-w-0"><Badge tone={sourceTone[it.source] || "gray"}>{it.source}</Badge><span className="truncate" style={{ color: T.ink }}>{it.desc}</span></span>
                      <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{money(it.amount)}</span>
                    </div>
                  ))}
                  {client.debt > 0 && (
                    <div className="flex items-center justify-between py-1.5" style={{ fontSize: 12.5, color: T.red }}>
                      <span>Saldo anterior pendiente</span><span style={{ fontWeight: 600 }}>{money(client.debt)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span style={{ fontFamily: F.head, fontSize: 15, fontWeight: 700 }}>Total: {money(total)}</span>
                    <Btn onClick={() => s.cobrar(acc.id)}><Receipt size={14} /> Cobrar y facturar</Btn>
                  </div>
                </Card>
              );
            })}
            {allAcc.length === 0 && (
              <Card className="p-6 text-center">
                <p style={{ fontSize: 13, color: T.sub }}>
                  {fClient
                    ? `${fClient.name} no tiene cargos pendientes por cobrar.`
                    : "No hay cuentas abiertas. Los cargos de clínica, estética e insumos aparecerán aquí automáticamente."}
                </p>
              </Card>
            )}
          </div>
          {allAcc.length > ACC_PAGE_SIZE && <Pager page={accPage} total={allAcc.length} pageSize={ACC_PAGE_SIZE} onPage={setAccPage} />}
        </div>
        <div>
          <h2 style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Facturas emitidas hoy ({allInv.length})</h2>
          <div className="flex flex-col gap-3">
            {invRows.map((f) => {
              const client = s.clients.find((c) => c.id === f.clientId);
              return (
                <Card key={f.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span style={{ fontFamily: F.head, fontSize: 13.5, fontWeight: 700 }}>{f.num}</span>
                      <span style={{ fontSize: 12.5, color: T.sub }}> · {client.name}</span>
                    </div>
                    <span style={{ fontFamily: F.head, fontWeight: 700, color: T.green }}>{money(f.total)}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: T.sub, marginTop: 3 }}>
                    {f.items.length} ítems{f.prevDebt > 0 && ` + deuda anterior de ${money(f.prevDebt)}`} · {new Date(f.date).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </Card>
              );
            })}
            {allInv.length === 0 && (
              <Card className="p-6 text-center">
                <p style={{ fontSize: 13, color: T.sub }}>
                  {fClient ? `Sin facturas de ${fClient.name} el día de hoy.` : "Aún no se emiten facturas hoy. Cobra una cuenta abierta para generar la primera."}
                </p>
              </Card>
            )}
          </div>
          {allInv.length > INV_HIST_PAGE_SIZE && <Pager page={invPage} total={allInv.length} pageSize={INV_HIST_PAGE_SIZE} onPage={setInvPage} />}
        </div>
      </div>
    </div>
  );
}

/* ============================ APP ============================ */
export default function VetSuite() {
  const s = useVet();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  useEffect(() => { setDrawer(false); }, [s.nav]);
  const View = { dashboard: Dashboard, crm: CRM, citas: Citas, peluqueria: Peluqueria, clinica: Clinica, inventario: Inventario, facturacion: Facturacion }[s.nav.module] || Dashboard;
  const moduleLabel = (MODULES.find((m) => m.key === s.nav.module) || MODULES[0]).label;
  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ height: "100dvh", background: T.bg, fontFamily: F.body, color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #D8D3C5; border-radius: 8px; }
        @keyframes vsSpin { to { transform: rotate(360deg); } }
        @keyframes vsPulse { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
        .vs-opt:hover { background: #F4F1E9; }
      `}</style>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <MobileTopBar onMenu={() => setDrawer(true)} moduleLabel={moduleLabel} />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6 mx-auto" style={{ maxWidth: 1180 }}>
            <View />
          </div>
        </main>
      </div>
      <Toasts />
    </div>
  );
}
