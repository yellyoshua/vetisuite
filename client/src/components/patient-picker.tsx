import { useEffect } from "react";
import { PawPrint } from "lucide-react";
import { SPECIES_ICON, T } from "../lib/constants";
import { useVetStore } from "../states/app.state";
import { PatientAlerts } from "./ui";

/* Dependent selector: pets load ONLY from the chosen client
   (few per client), never from the global 50,000-row catalog. */
interface PatientPickerProps {
  clientId?: string;
  value: string | null;
  onChange: (patientId: string) => void;
}

export function PatientPicker({ clientId, value, onChange }: PatientPickerProps) {
  const s = useVetStore();
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
            <PatientAlerts patient={p} small />
          </button>
        );
      })}
    </div>
  );
}
