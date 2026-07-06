import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, PawPrint, Search } from "lucide-react";
import { inputStyle, SPECIES_ICON, T } from "../../lib/constants";
import { useVetStore } from "../../states/app.state";
import { Btn, Pager, PatientAlerts, SectionHead } from "../../components/ui";
import { ResourceListItem } from "../../components/resource-list-item";

/* ================================================================
   CLINIC index — same flow as the other modules: searchable,
   paginated patient listing; each row opens its medical record
   at show/:patientId.
================================================================ */
const PAGE_SIZE = 6;

export default function ClinicPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const lastVisitOf = (patientId: string) => s.records.find((r) => r.patientId === patientId)?.date;
  const filtered = s.patients.filter((p) => {
    const owner = s.clients.find((c) => c.id === p.clientId)!;
    return (p.name + " " + p.species + " " + p.breed + " " + owner.name).toLowerCase().includes(q.toLowerCase());
  });
  const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  return (
    <div>
      <SectionHead title="Clínica y Laboratorio" sub="Historial clínico estructurado e inalterable. Abre el expediente del paciente para consultar, aplicar insumos, ordenar laboratorio o recetar." />
      <div className="flex items-center gap-2 mb-3" style={{ ...inputStyle, padding: "8px 11px", maxWidth: 480 }}>
        <Search size={14} color={T.sub} className="shrink-0" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Buscar paciente (nombre, especie, raza, dueño)…"
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%", color: T.ink }} />
      </div>
      {rows.map((p) => {
        const owner = s.clients.find((c) => c.id === p.clientId)!;
        const Icon = SPECIES_ICON[p.species] || PawPrint;
        const lastVisit = lastVisitOf(p.id);
        return (
          <ResourceListItem key={p.id}
            icon={<Icon size={18} />}
            title={p.name}
            subtitle={`${p.species} · ${p.breed} · ${p.age} · Dueño: ${owner.name}`}
            meta={lastVisit ? `Última consulta: ${new Date(lastVisit).toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" })}` : "Sin consultas registradas"}
            badges={<PatientAlerts patient={p} small />}
            actions={<Btn small kind="ghost" onClick={() => navigate(`/clinic/show/${p.id}`)}><Eye size={13} /> Ver expediente</Btn>}
          />
        );
      })}
      {rows.length === 0 && (
        <p className="px-3 py-4" style={{ fontSize: 13, color: T.sub }}>Sin pacientes que coincidan con “{q}”. Regístralos desde Clientes y Pacientes.</p>
      )}
      <Pager page={page} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
    </div>
  );
}
