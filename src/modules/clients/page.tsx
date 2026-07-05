import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, CalendarDays, FileText, Plus, PawPrint, Search } from "lucide-react";
import { F, inputStyle, money, SPECIES_ICON, T } from "../../lib/constants";
import { fetchClientsPageApi, useDebounced } from "../../lib/api";
import type { Client } from "../../lib/types";
import { useVetStore } from "../../states/app.state";
import { Badge, Btn, Card, Pager, PatientAlerts, SectionHead, Spinner } from "../../components/ui";
import { NewClientModal } from "./components/new-client-modal";
import { NewPatientModal } from "./components/new-patient-modal";

/* ================================================================
   CLIENTS — master-detail listing with client-only search
   (name/phone/email, never mixed with pets) and simulated
   server-side pagination: with 6,000 clients the full catalog
   is never rendered.
================================================================ */
const PAGE_SIZE = 6;

export default function ClientsPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // The URL is the single source of truth for the selected client (deep-linkable).
  const selectedId = searchParams.get("clientId") || "c1";
  const selectClient = (id: string) => setSearchParams({ clientId: id }, { replace: true });
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 300);
  const [page, setPage] = useState(0);
  const [res, setRes] = useState({ rows: [] as Client[], total: 0, forKey: null as string | null });
  const [modal, setModal] = useState<"client" | "patient" | null>(null);
  // Loading is derived: we are loading while the last response doesn't match the current query/page.
  const fetchKey = `${debouncedQ}|${page}`;
  const loading = res.forKey !== fetchKey;
  useEffect(() => {
    let alive = true;
    fetchClientsPageApi(debouncedQ, page, PAGE_SIZE).then((r) => { if (alive) setRes({ rows: r.rows, total: r.total, forKey: fetchKey }); });
    return () => { alive = false; };
  }, [debouncedQ, page, s.clients, fetchKey]);
  const client = s.clients.find((c) => c.id === selectedId);
  const pets = s.patients.filter((p) => p.clientId === selectedId);
  const account = s.accounts.find((a) => a.clientId === selectedId);
  const accountTotal = account ? account.items.reduce((t, i) => t + i.amount, 0) : 0;
  return (
    <div>
      <SectionHead title="Clientes y Pacientes" sub="Una sola fuente de verdad: cada dueño vinculado a sus mascotas."
        action={<Btn onClick={() => setModal("client")}><Plus size={14} /> Nuevo cliente</Btn>} />
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-1" style={{ ...inputStyle, padding: "8px 11px" }}>
            <Search size={14} color={T.sub} className="shrink-0" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Buscar cliente (nombre, teléfono, correo)…"
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%", color: T.ink }} />
            {loading && <Spinner />}
          </div>
          <p style={{ fontSize: 11, color: T.sub, margin: "0 2px 10px" }}>La búsqueda es solo por cliente; sus mascotas se ven en el detalle.</p>
          <div className="flex flex-col">
            {loading && [0, 1, 2, 3].map((i) => (
              <div key={i} className="mb-1.5" style={{ height: 46, borderRadius: 10, background: "#F0EDE4", animation: "vsPulse 1.2s ease-in-out infinite" }} />
            ))}
            {!loading && res.rows.map((c) => {
              const petCount = s.patients.filter((p) => p.clientId === c.id).length;
              const active = c.id === selectedId;
              return (
                <button key={c.id} onClick={() => selectClient(c.id)} className="text-left px-3 py-2.5 mb-1"
                  style={{ borderRadius: 10, background: active ? T.greenSoft : "transparent", border: `1px solid ${active ? T.green : "transparent"}` }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate" style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{c.name}</span>
                    {c.debt > 0 && <Badge tone="red">Debe {money(c.debt)}</Badge>}
                  </div>
                  <div style={{ fontSize: 11.5, color: T.sub }}>{c.phone} · {petCount} mascota{petCount !== 1 ? "s" : ""}</div>
                </button>
              );
            })}
            {!loading && res.rows.length === 0 && (
              <p className="px-3 py-4" style={{ fontSize: 13, color: T.sub }}>Sin resultados para “{debouncedQ}”. Crea el cliente en menos de 30 segundos con “Nuevo cliente”.</p>
            )}
          </div>
          <Pager page={page} total={res.total} pageSize={PAGE_SIZE} onPage={setPage} />
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
                  {account && <Badge tone="blue">Cuenta abierta: {money(accountTotal)}</Badge>}
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
                    <div className="mb-3"><PatientAlerts patient={p} /></div>
                    <div className="flex gap-2">
                      <Btn small kind="ghost" onClick={() => navigate(`/clinic?patientId=${p.id}`)}><FileText size={12} /> Historial</Btn>
                      <Btn small kind="ghost" onClick={() => navigate(`/appointments?patientId=${p.id}`)}><CalendarDays size={12} /> Agendar</Btn>
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
      {modal === "client" && <NewClientModal onClose={() => setModal(null)} onCreated={(id) => { selectClient(id); setModal(null); }} />}
      {modal === "patient" && <NewPatientModal clientId={selectedId} onClose={() => setModal(null)} />}
    </div>
  );
}
