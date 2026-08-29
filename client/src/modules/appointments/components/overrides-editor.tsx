import { CalendarPlus, Plus, X } from "lucide-react";
import { ymd } from "@/lib/availability";
import { inputStyle, T } from "@/lib/constants";
import type { DateOverride } from "@/lib/types";
import { Btn } from "@/components/ui";

/* Excepciones por fecha (feriados, jornadas cortas, cierres). Sin bloques =
   cerrado ese día; con bloques, mandan sobre el horario semanal. */
export function OverridesEditor({ overrides, onChange }: { overrides: DateOverride[]; onChange: (overrides: DateOverride[]) => void }) {
  const patch = (index: number, override: DateOverride) => onChange(overrides.map((o, i) => (i === index ? override : o)));
  return (
    <div>
      {overrides.length === 0 && <p style={{ fontSize: 12.5, color: T.sub, marginBottom: 12 }}>Sin excepciones: todos los días siguen el horario semanal.</p>}
      {overrides.map((override, i) => (
        <div key={i} className="p-3 mb-2" style={{ border: `1px solid ${T.line}`, borderRadius: 12 }}>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <input type="date" style={{ ...inputStyle, width: 168 }} value={override.date}
              onChange={(e) => patch(i, { ...override, date: e.target.value })} />
            <input style={{ ...inputStyle, flex: 1, minWidth: 160 }} placeholder="Motivo (ej: Feriado)" value={override.label}
              onChange={(e) => patch(i, { ...override, label: e.target.value })} />
            <button title="Quitar excepción" style={{ color: T.sub }} onClick={() => onChange(overrides.filter((_, x) => x !== i))}><X size={15} /></button>
          </div>
          {override.ranges.length === 0 && <span style={{ fontSize: 12.5, color: T.red, fontWeight: 600 }}>Cerrado todo el día</span>}
          {override.ranges.map((range, ri) => (
            <div key={ri} className="flex items-center gap-2 mb-2 flex-wrap">
              <input type="time" style={{ ...inputStyle, width: 118 }} value={range.start}
                onChange={(e) => patch(i, { ...override, ranges: override.ranges.map((r, x) => (x === ri ? { ...r, start: e.target.value } : r)) })} />
              <span style={{ color: T.sub, fontSize: 13 }}>a</span>
              <input type="time" style={{ ...inputStyle, width: 118 }} value={range.end}
                onChange={(e) => patch(i, { ...override, ranges: override.ranges.map((r, x) => (x === ri ? { ...r, end: e.target.value } : r)) })} />
              <button title="Quitar bloque" style={{ color: T.sub }}
                onClick={() => patch(i, { ...override, ranges: override.ranges.filter((_, x) => x !== ri) })}><X size={15} /></button>
            </div>
          ))}
          <Btn small kind="ghost" onClick={() => patch(i, { ...override, ranges: [...override.ranges, { start: "09:00", end: "13:00" }] })}>
            <Plus size={13} /> Bloque de atención
          </Btn>
        </div>
      ))}
      <Btn kind="ghost" onClick={() => onChange([...overrides, { date: ymd(new Date()), label: "", ranges: [] }])}>
        <CalendarPlus size={14} /> Añadir excepción
      </Btn>
    </div>
  );
}
