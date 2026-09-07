import { useState } from "react";
import { Toggle, Card } from "client";

/** Encendido y apagado, con etiqueta y pista de ayuda. */
export function Estados() {
  const [on, setOn] = useState(true);
  const [off, setOff] = useState(false);
  return (
    <Card className="p-5" style={{ maxWidth: 480 }}>
      <Toggle checked={on} onChange={setOn} label="Reservas en línea" hint="Los clientes pueden pedir cita desde el portal de la clínica." />
      <Toggle checked={off} onChange={setOff} label="Confirmar automáticamente" hint="Sin esto, cada reserva entra como pendiente." />
    </Card>
  );
}

/** Sin `hint`: solo la etiqueta. */
export function SinPista() {
  const [on, setOn] = useState(true);
  return (
    <Card className="p-5" style={{ maxWidth: 480 }}>
      <Toggle checked={on} onChange={setOn} label="Atender los sábados" />
    </Card>
  );
}
