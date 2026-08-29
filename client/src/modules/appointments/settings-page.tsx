import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Info, RotateCcw } from "lucide-react";
import { BUFFER_OPTIONS, DEFAULT_AVAILABILITY, SLOT_OPTIONS, TIMEZONES, slotsForDate } from "@/lib/availability";
import { inputStyle, T } from "@/lib/constants";
import type { Availability } from "@/lib/types";
import { useVetStore } from "@/states/app.state";
import { Btn, Card, Field } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { WeekEditor } from "./components/week-editor";
import { OverridesEditor } from "./components/overrides-editor";
import { Toggle } from "./components/toggle";

/* ================================================================
   DISPONIBILIDAD — configuración única de toda la clínica (no por
   médico). Alimenta la matriz de la agenda, los horarios que ofrecen
   las pantallas de cita y, a futuro, la reserva en línea de cada portal.
================================================================ */
function Section({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <Card className="p-5 mb-3">
      <div className="mb-4">
        <h2 style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{title}</h2>
        <p style={{ fontSize: 12.5, color: T.sub, marginTop: 2 }}>{sub}</p>
      </div>
      {children}
    </Card>
  );
}

export default function AppointmentSettingsPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Availability>(s.availability);
  const patch = (data: Partial<Availability>) => setDraft({ ...draft, ...data });
  const preview = slotsForDate(draft, new Date());
  return (
    <CustomPage goBack backTo="/appointments" title="Disponibilidad de la agenda"
      description="Configuración general de la clínica: la comparten la agenda interna y la reserva en línea de todos los portales."
      actions={<Btn kind="ghost" onClick={() => setDraft(DEFAULT_AVAILABILITY)}><RotateCcw size={14} /> Restablecer</Btn>}>
      <Section title="Horario semanal" sub="Días y bloques en los que la clínica atiende citas.">
        <WeekEditor week={draft.week} onChange={(week) => patch({ week })} />
      </Section>

      <Section title="Duración y márgenes" sub="Definen cada cuánto empieza una cita en la agenda.">
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Duración de la cita">
            <select style={inputStyle} value={draft.slotMinutes} onChange={(e) => patch({ slotMinutes: +e.target.value })}>
              {SLOT_OPTIONS.map((m) => <option key={m} value={m}>{m} min</option>)}
            </select>
          </Field>
          <Field label="Margen antes">
            <select style={inputStyle} value={draft.bufferBefore} onChange={(e) => patch({ bufferBefore: +e.target.value })}>
              {BUFFER_OPTIONS.map((m) => <option key={m} value={m}>{m} min</option>)}
            </select>
          </Field>
          <Field label="Margen después">
            <select style={inputStyle} value={draft.bufferAfter} onChange={(e) => patch({ bufferAfter: +e.target.value })}>
              {BUFFER_OPTIONS.map((m) => <option key={m} value={m}>{m} min</option>)}
            </select>
          </Field>
        </div>
        <p className="flex items-start gap-1.5" style={{ fontSize: 12, color: T.sub, marginBottom: 16 }}>
          <Info size={13} className="shrink-0 mt-0.5" />
          Los márgenes separan una cita de la siguiente: con {draft.slotMinutes} min de cita y {draft.bufferBefore + draft.bufferAfter} min de margen,
          los inicios van cada {draft.slotMinutes + draft.bufferBefore + draft.bufferAfter} min.
        </p>
        <Field label="Zona horaria">
          <select style={{ ...inputStyle, maxWidth: 320 }} value={draft.timezone} onChange={(e) => patch({ timezone: e.target.value })}>
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </Field>
      </Section>

      <Section title="Reglas de reserva" sub="Se aplican cuando un cliente reserva desde un portal público.">
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Antelación mínima (horas)">
            <input type="number" min={0} style={inputStyle} value={draft.minNoticeHours} onChange={(e) => patch({ minNoticeHours: Math.max(0, +e.target.value || 0) })} />
          </Field>
          <Field label="Se puede reservar hasta (días)">
            <input type="number" min={1} style={inputStyle} value={draft.maxAdvanceDays} onChange={(e) => patch({ maxAdvanceDays: Math.max(1, +e.target.value || 1) })} />
          </Field>
          <Field label="Máximo de citas por día">
            <input type="number" min={0} style={inputStyle} value={draft.maxPerDay} onChange={(e) => patch({ maxPerDay: Math.max(0, +e.target.value || 0) })} />
          </Field>
        </div>
        <p className="flex items-start gap-1.5" style={{ fontSize: 12, color: T.sub, marginBottom: 16 }}>
          <Info size={13} className="shrink-0 mt-0.5" />
          El máximo por día ya limita la agenda. La antelación y la ventana de reserva se guardan para el portal: la agenda de la demo es de un solo día y no tiene fechas futuras.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Toggle checked={draft.onlineBooking} onChange={(onlineBooking) => patch({ onlineBooking })}
            label="Reserva en línea" hint="Los portales publican el calendario y aceptan citas." />
          <Toggle checked={draft.autoConfirm} onChange={(autoConfirm) => patch({ autoConfirm })}
            label="Confirmar automáticamente" hint="Sin esto, la cita nace pendiente y el cliente confirma por WhatsApp." />
        </div>
      </Section>

      <Section title="Excepciones por fecha" sub="Feriados, cierres y jornadas especiales; mandan sobre el horario semanal.">
        <OverridesEditor overrides={draft.overrides} onChange={(overrides) => patch({ overrides })} />
      </Section>

      <Section title="Vista previa de hoy" sub={`${preview.length} horario${preview.length === 1 ? "" : "s"} disponible${preview.length === 1 ? "" : "s"} con esta configuración.`}>
        <div className="flex gap-1.5 flex-wrap">
          {preview.map((h) => (
            <span key={h} style={{ fontSize: 12, fontWeight: 600, color: T.green, background: T.greenSoft, borderRadius: 8, padding: "5px 9px", fontVariantNumeric: "tabular-nums" }}>{h}</span>
          ))}
          {preview.length === 0 && <span style={{ fontSize: 12.5, color: T.sub }}>Hoy la clínica no atiende con esta configuración.</span>}
        </div>
      </Section>

      <div className="flex justify-end gap-2 mb-2">
        <Btn kind="ghost" onClick={() => navigate("/appointments")}>Cancelar</Btn>
        <Btn onClick={() => { if (s.updateAvailability(draft)) navigate("/appointments"); }}>Guardar configuración</Btn>
      </div>
    </CustomPage>
  );
}
