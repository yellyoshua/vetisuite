import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { inputStyle, money, T } from "../lib/constants";
import { searchClientsApi, useDebounced } from "../lib/api";
import type { Client } from "../lib/types";
import { Badge, Spinner } from "./ui";

/* ================================================================
   CLIENT SEARCH — global client-only typeahead.
   Async pattern: 300 ms debounce → simulated backend query →
   max 8 matches + total. Same pattern as the Stripe/Shopify
   customer picker: never a <select> with thousands of options.
   Every transactional flow starts here.
================================================================ */
interface ClientSearchProps {
  selected: Client | null;
  onSelect: (client: Client | null) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function ClientSearch({ selected, onSelect, placeholder = "Buscar cliente por nombre, teléfono o correo…", autoFocus = false }: ClientSearchProps) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 300);
  const [st, setSt] = useState({ results: [] as Client[], total: 0, forQuery: "" });
  const active = debouncedQ.trim().length >= 2;
  // Derived instead of set in the effect: we are loading while the last response doesn't match the current query.
  const loading = active && st.forQuery !== debouncedQ;
  const searched = active && st.forQuery === debouncedQ;
  useEffect(() => {
    if (debouncedQ.trim().length < 2) return;
    let alive = true;
    searchClientsApi(debouncedQ).then((r) => { if (alive) setSt({ results: r.results, total: r.total, forQuery: debouncedQ }); });
    return () => { alive = false; };
  }, [debouncedQ]);
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
      <div className="flex items-center gap-2" style={{ ...inputStyle, padding: "8px 11px" }}>
        <Search size={14} color={T.sub} className="shrink-0" />
        <input autoFocus={autoFocus} value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder}
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%", color: T.ink }} />
        {loading && <Spinner />}
      </div>
      {q.trim().length === 1 && <div style={{ fontSize: 11.5, color: T.sub, marginTop: 4 }}>Escribe al menos 2 caracteres…</div>}
      {open && (
        <div className="absolute left-0 right-0 z-20 shadow-lg" style={{ top: "calc(100% + 4px)", background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden" }}>
          {loading && <div className="flex items-center gap-2 px-3 py-3" style={{ fontSize: 12.5, color: T.sub }}><Spinner /> Consultando clientes…</div>}
          {searched && st.results.length === 0 && (
            <div className="px-3 py-3" style={{ fontSize: 12.5, color: T.sub }}>Sin coincidencias para “{debouncedQ}”. Verifica el nombre o créalo en <b>Clientes y Pacientes</b>.</div>
          )}
          {searched && st.results.map((c) => (
            <button key={c.id} onClick={() => { onSelect(c); setQ(""); }} className="vs-opt w-full text-left px-3 py-2.5" style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
              <div className="flex items-center justify-between gap-2">
                <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{c.name}</span>
                {c.debt > 0 && <Badge tone="red">Debe {money(c.debt)}</Badge>}
              </div>
              <div style={{ fontSize: 11.5, color: T.sub }}>{c.phone} · {c.email}</div>
            </button>
          ))}
          {searched && st.total > st.results.length && (
            <div className="px-3 py-2" style={{ fontSize: 11.5, color: T.sub, background: "#FAF8F2" }}>{st.results.length} de {st.total} coincidencias — sigue escribiendo para afinar.</div>
          )}
        </div>
      )}
    </div>
  );
}
