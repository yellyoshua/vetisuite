import { T } from "@/lib/constants";

/* Interruptor de la pantalla de disponibilidad: checkbox nativo (accesible,
   sin dependencias) con la pista pintada encima. */
export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <span className="relative shrink-0 mt-0.5" style={{ width: 38, height: 22 }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <span className="block w-full h-full transition-colors" style={{ borderRadius: 999, background: checked ? T.green : T.track }} />
        <span className="absolute top-0.5 transition-all" style={{ left: checked ? 18 : 2, width: 18, height: 18, borderRadius: 999, background: "#fff" }} />
      </span>
      <span>
        <span className="block" style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{label}</span>
        {hint && <span className="block" style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{hint}</span>}
      </span>
    </label>
  );
}
