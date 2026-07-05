import { AlertTriangle, CheckCircle2, MessageCircle, X } from "lucide-react";
import { T } from "../lib/constants";
import { useVetStore } from "../states/app.state";

export function Toasts() {
  const s = useVetStore();
  const iconFor = {
    ok: <CheckCircle2 size={16} color={T.green} />,
    warn: <AlertTriangle size={16} color={T.amber} />,
    error: <X size={16} color={T.red} />,
    wa: <MessageCircle size={16} color="#fff" />,
  };
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" style={{ maxWidth: "min(340px, calc(100vw - 32px))" }}>
      {s.toasts.map((t) => (
        <div key={t.id} className="flex items-start gap-2 shadow-lg" style={{
          background: t.type === "wa" ? T.wa : T.card, color: t.type === "wa" ? "#fff" : T.ink,
          border: t.type === "wa" ? "none" : `1px solid ${T.line}`, borderRadius: 14, padding: "11px 13px", fontSize: 12.5, lineHeight: 1.45,
        }}>
          <span className="mt-px shrink-0">{iconFor[t.type]}</span>
          <span>{t.type === "wa" && <b style={{ display: "block", fontSize: 11, opacity: 0.85, marginBottom: 2 }}>Automatización · WhatsApp</b>}{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
