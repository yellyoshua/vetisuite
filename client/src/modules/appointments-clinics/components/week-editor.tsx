import { Copy, Plus, X } from "lucide-react";
import { WEEKDAYS, newWorkday } from "@/lib/availability";
import { T } from "@/lib/constants";
import type { DayAvailability } from "@/lib/types";
import { Btn, Input } from "@/components/ui";
import { Toggle } from "./toggle";

/* Horario semanal al estilo Calendly: cada día se activa y admite varios
   bloques (mañana/tarde). Copiar replica el día en el resto de días activos. */
export function WeekEditor({ week, onChange }: { week: DayAvailability[]; onChange: (week: DayAvailability[]) => void }) {
  const patch = (index: number, day: DayAvailability) => onChange(week.map((d, i) => (i === index ? day : d)));
  const copyToOthers = (index: number) => onChange(week.map((d, i) => (i === index || !d.enabled ? d : { ...d, ranges: week[index].ranges.map((r) => ({ ...r })) })));
  return (
    <div>
      {week.map((day, i) => (
        <div key={WEEKDAYS[i]} className="flex flex-wrap items-start gap-3 py-3" style={{ borderTop: i === 0 ? "none" : `1px solid ${T.lineSoft}` }}>
          <div style={{ width: 150 }} className="shrink-0 pt-1">
            <Toggle checked={day.enabled} label={WEEKDAYS[i]}
              onChange={(enabled) => patch(i, enabled ? (day.ranges.length ? { ...day, enabled } : newWorkday()) : { ...day, enabled })} />
          </div>
          <div className="flex-1 min-w-0">
            {!day.enabled && <span style={{ fontSize: 12.5, color: T.sub }}>Cerrado</span>}
            {day.enabled && day.ranges.map((range, ri) => (
              <div key={ri} className="flex items-center gap-2 mb-2 flex-wrap">
                <Input type="time" style={{ width: 118 }} value={range.start}
                  onChange={(e) => patch(i, { ...day, ranges: day.ranges.map((r, x) => (x === ri ? { ...r, start: e.target.value } : r)) })} />
                <span style={{ color: T.sub, fontSize: 13 }}>a</span>
                <Input type="time" style={{ width: 118 }} value={range.end}
                  onChange={(e) => patch(i, { ...day, ranges: day.ranges.map((r, x) => (x === ri ? { ...r, end: e.target.value } : r)) })} />
                <button title="Quitar bloque" style={{ color: T.sub }}
                  onClick={() => patch(i, { ...day, ranges: day.ranges.filter((_, x) => x !== ri) })}><X size={15} /></button>
              </div>
            ))}
            {day.enabled && (
              <div className="flex gap-2 flex-wrap">
                <Btn small kind="ghost" onClick={() => patch(i, { ...day, ranges: [...day.ranges, { start: "08:00", end: "18:00" }] })}>
                  <Plus size={13} /> Bloque
                </Btn>
                <Btn small kind="ghost" onClick={() => copyToOthers(i)}><Copy size={13} /> Copiar a los demás días</Btn>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
