import { useEffect } from "react";
import { ToastProvider, showToast, Card, Btn } from "client";

/** Provider de notificaciones montado junto a `<App />`. Abajo a la derecha, 5.2 s,
    fondo `card`, borde `line`, radio 14. El icono lo pone el tipo: `ok` (check verde),
    `warn` (triángulo ámbar) y `error` (aspa roja). */
export function NotificacionDeExito() {
  useEffect(() => {
    showToast("ok", "Cliente Ana Cevallos creado.");
  }, []);
  return (
    <div style={{ minHeight: 220 }}>
      <ToastProvider />
      <Card className="p-5" style={{ maxWidth: 420 }}>
        <p style={{ fontSize: 13, color: "var(--color-ink)" }}>
          Las pantallas nunca llaman a <code>showToast</code>: lo hace <code>notify()</code> del store
          tras una acción con nombre propio.
        </p>
        <div className="flex justify-end mt-3">
          <Btn small kind="ghost">Entendido</Btn>
        </div>
      </Card>
    </div>
  );
}
