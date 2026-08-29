import type { Availability, DayAvailability, TimeRange } from "./types";

/* ================================================================
   AVAILABILITY — horario de atención de la clínica (uno solo, no por
   médico). De aquí salen los slots de la agenda interna y los que el
   portal público ofrecerá al reservar en línea.
================================================================ */

export const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const SLOT_OPTIONS = [15, 20, 30, 45, 60, 90];
export const BUFFER_OPTIONS = [0, 5, 10, 15, 30];

/* Intl da la lista nativa; sin dependencia ni catálogo propio que mantener. */
export const TIMEZONES = Intl.supportedValuesOf("timeZone");

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export const ymd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/* Horario que se propone al activar un día que estaba cerrado. */
export const newWorkday = (): DayAvailability => ({ enabled: true, ranges: [{ start: "08:00", end: "18:00" }] });

/* Por defecto reproduce el horario que la agenda tenía fijo (08:00–17:00 en
   bloques de 1 h) para que las citas semilla sigan cayendo en la matriz. */
export const DEFAULT_AVAILABILITY: Availability = {
  timezone: "America/Guayaquil",
  week: [
    { enabled: false, ranges: [] },                                    // domingo
    { enabled: true, ranges: [{ start: "08:00", end: "18:00" }] },      // lunes
    { enabled: true, ranges: [{ start: "08:00", end: "18:00" }] },
    { enabled: true, ranges: [{ start: "08:00", end: "18:00" }] },
    { enabled: true, ranges: [{ start: "08:00", end: "18:00" }] },
    { enabled: true, ranges: [{ start: "08:00", end: "18:00" }] },      // viernes
    { enabled: true, ranges: [{ start: "09:00", end: "13:00" }] },      // sábado
  ],
  overrides: [
    { date: "2026-12-25", label: "Navidad", ranges: [] },
    { date: "2027-01-01", label: "Año nuevo", ranges: [] },
  ],
  slotMinutes: 60,
  bufferBefore: 0,
  bufferAfter: 0,
  minNoticeHours: 2,
  maxAdvanceDays: 60,
  maxPerDay: 0,
  onlineBooking: true,
  autoConfirm: false,
};

/* Rangos que aplican a una fecha: la excepción manda sobre el día de la semana. */
function rangesForDate(av: Availability, date: Date): TimeRange[] {
  const override = av.overrides.find((o) => o.date === ymd(date));
  if (override) return override.ranges;
  const day = av.week[date.getDay()];
  return day && day.enabled ? day.ranges : [];
}

/* Slots inicio-de-cita de una fecha. El paso incluye los buffers: una cita de
   30 min con 10 de margen posterior deja el siguiente inicio 40 min después. */
export function slotsForDate(av: Availability, date: Date): string[] {
  const step = av.slotMinutes + av.bufferBefore + av.bufferAfter;
  if (step <= 0) return []; // corre en cada render: sin guarda, bucle infinito
  const slots: string[] = [];
  for (const range of rangesForDate(av, date)) {
    const end = toMinutes(range.end);
    for (let t = toMinutes(range.start); t + av.slotMinutes <= end; t += step) slots.push(toTime(t));
  }
  return [...new Set(slots)].sort();
}

/* Devuelve el primer problema encontrado, o null si la configuración es válida. */
export function validateAvailability(av: Availability): string | null {
  if (av.slotMinutes <= 0) return "La duración de la cita debe ser mayor a 0 minutos.";
  for (let i = 0; i < av.week.length; i++) {
    const bad = checkRanges(av.week[i].ranges);
    if (av.week[i].enabled && bad) return `${WEEKDAYS[i]}: ${bad}`;
  }
  for (const o of av.overrides) {
    if (!o.date) return "Hay una excepción sin fecha.";
    const bad = checkRanges(o.ranges);
    if (bad) return `Excepción del ${o.date}: ${bad}`;
  }
  return null;
}

function checkRanges(ranges: TimeRange[]): string | null {
  // Un <input type="time"> vaciado devuelve "" → toMinutes da NaN y toda comparación
  // sale false: sin esta guarda se guardaría un bloque que no genera ningún slot.
  if (ranges.some((r) => !Number.isFinite(toMinutes(r.start)) || !Number.isFinite(toMinutes(r.end)))) return "hay un bloque con una hora vacía o inválida.";
  const sorted = [...ranges].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  for (let i = 0; i < sorted.length; i++) {
    if (toMinutes(sorted[i].end) <= toMinutes(sorted[i].start)) return `el bloque ${sorted[i].start}–${sorted[i].end} termina antes de empezar.`;
    if (i > 0 && toMinutes(sorted[i].start) < toMinutes(sorted[i - 1].end)) return `los bloques ${sorted[i - 1].start}–${sorted[i - 1].end} y ${sorted[i].start}–${sorted[i].end} se solapan.`;
  }
  return null;
}
