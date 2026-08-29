import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Eye, Pencil, Plus, Search } from "lucide-react";
import { inputStyle, money, T } from "@/lib/constants";
import { fetchClientsPageApi, useDebounced } from "@/lib/api";
import type { Client } from "@/lib/types";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Pager, Spinner } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { ResourceListItem } from "@/components/resource-list-item";

/* ================================================================
   CLIENTS index — full-width listing with client-only search
   (name/phone/email) and simulated server-side pagination.
   Each row links to the CRUD screens: show/:id and edit/:id.
================================================================ */
const PAGE_SIZE = 6;

export default function ClientsPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 300);
  const [page, setPage] = useState(0);
  const [res, setRes] = useState({ rows: [] as Client[], total: 0, forKey: null as string | null });
  const fetchKey = `${debouncedQ}|${page}`;
  const loading = res.forKey !== fetchKey;
  useEffect(() => {
    let alive = true;
    fetchClientsPageApi(debouncedQ, page, PAGE_SIZE).then((r) => { if (alive) setRes({ rows: r.rows, total: r.total, forKey: fetchKey }); });
    return () => { alive = false; };
  }, [debouncedQ, page, s.clients, fetchKey]);
  return (
    <CustomPage title="Clientes y Pacientes" description="Una sola fuente de verdad: cada dueño vinculado a sus mascotas."
      actions={<Btn onClick={() => navigate("/clients/new")}><Plus size={14} /> Nuevo cliente</Btn>}>
      <div className="flex items-center gap-2 mb-1" style={{ ...inputStyle, padding: "8px 11px", maxWidth: 480 }}>
        <Search size={14} color={T.sub} className="shrink-0" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Buscar cliente (nombre, teléfono, correo)…"
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%", color: T.ink }} />
        {loading && <Spinner />}
      </div>
      <p style={{ fontSize: 11, color: T.sub, margin: "0 2px 12px" }}>La búsqueda es solo por cliente; sus mascotas se ven en el detalle.</p>
      {loading && [0, 1, 2, 3].map((i) => (
        <div key={i} className="mb-2" style={{ height: 68, borderRadius: 14, background: T.skeleton, animation: "vsPulse 1.2s ease-in-out infinite" }} />
      ))}
      {!loading && res.rows.map((c) => {
        const petCount = s.patients.filter((p) => p.clientId === c.id).length;
        const visit = s.visits.find((v) => v.clientId === c.id);
        return (
          <ResourceListItem key={c.id}
            icon={c.name.charAt(0)}
            title={c.name}
            subtitle={`${c.phone} · ${c.email}`}
            meta={`${petCount} mascota${petCount !== 1 ? "s" : ""}`}
            badges={<>
              {c.debt > 0 && <Badge tone="red">Debe {money(c.debt)}</Badge>}
              {visit && <Badge tone="blue">Visita abierta</Badge>}
            </>}
            actions={<>
              <Btn small kind="ghost" onClick={() => { const fp = s.patients.find((p) => p.clientId === c.id)?.id ?? ""; navigate(`/visits/edit/${s.openVisit(c.id, fp)}`); }}><ClipboardList size={13} /> Visita</Btn>
              <Btn small kind="ghost" onClick={() => navigate(`/clients/show/${c.id}`)}><Eye size={13} /> Ver</Btn>
              <Btn small kind="ghost" onClick={() => navigate(`/clients/edit/${c.id}`)}><Pencil size={13} /> Editar</Btn>
            </>}
          />
        );
      })}
      {!loading && res.rows.length === 0 && (
        <p className="px-3 py-4" style={{ fontSize: 13, color: T.sub }}>Sin resultados para “{debouncedQ}”. Crea el cliente en menos de 30 segundos con “Nuevo cliente”.</p>
      )}
      <Pager page={page} total={res.total} pageSize={PAGE_SIZE} onPage={setPage} />
    </CustomPage>
  );
}
