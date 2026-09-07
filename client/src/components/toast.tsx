import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Toaster, toast } from "sonner";
import { F, T } from "@/lib/constants";
import type { ToastType } from "@/lib/types";

/* ================================================================
   TOASTS — sobre `sonner`. Toda la superficie de notificaciones vive
   aquí: el provider que se monta junto a `<App />` y el `notify` que
   consume el store. Nadie más habla con sonner.
================================================================ */

const DURATION = 5200;

/** Provider de notificaciones. Se monta una sola vez, junto a `<App />`. */
export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      duration={DURATION}
      gap={8}
      offset={16}
      toastOptions={{
        style: {
          background: T.card, color: T.ink, border: `1px solid ${T.line}`,
          borderRadius: 14, padding: "11px 13px", fontSize: 12.5, lineHeight: 1.45, fontFamily: F.body,
        },
      }}
    />
  );
}

/** Lanza una notificación. Lo usa `notify` del store; no se llama desde las pantallas. */
/* Provider y disparador viven juntos a propósito: toda la superficie de toasts en un
   archivo. El coste es que este archivo recarga entero en vez de hacer fast refresh —
   monta un <Toaster/>, da igual. */
// eslint-disable-next-line react-refresh/only-export-components
export function showToast(type: ToastType, msg: string) {
  if (type === "ok") {
    toast(msg, { icon: <CheckCircle2 size={16} color={T.green} /> });
    return;
  }
  if (type === "warn") {
    toast(msg, { icon: <AlertTriangle size={16} color={T.amber} /> });
    return;
  }
  toast(msg, { icon: <X size={16} color={T.red} /> });
}
