import { Avatar, Card, Badge } from "client";
import { Dog, Cat, Bird } from "lucide-react";

/** Iniciales sobre `green-soft`, radio 12, Sora 700. El tamaño por defecto es 40. */
export function Iniciales() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 flex-wrap">
        <Avatar>CR</Avatar>
        <Avatar>MS</Avatar>
        <Avatar>JP</Avatar>
        <Avatar>VS</Avatar>
      </div>
    </Card>
  );
}

/** Con icono en vez de texto: pacientes por especie. */
export function ConIcono() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 flex-wrap">
        <Avatar><Dog size={19} /></Avatar>
        <Avatar><Cat size={19} /></Avatar>
        <Avatar><Bird size={19} /></Avatar>
      </div>
    </Card>
  );
}

/** La tipografía escala con `size`: 28 para filas densas, 56 para fichas. */
export function Tamanos() {
  return (
    <Card className="p-5">
      <div className="flex items-end gap-3 flex-wrap">
        <Avatar size={28}>CR</Avatar>
        <Avatar>CR</Avatar>
        <Avatar size={56}>CR</Avatar>
      </div>
    </Card>
  );
}

/** En una fila de listado: avatar, título con badge y metadatos. */
export function EnFilaDeListado() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <Avatar>MS</Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontFamily: "var(--font-head)", fontSize: 14.5, fontWeight: 600, color: "var(--color-ink)" }}>Marco Salazar</span>
            <Badge tone="red">Deuda $45.50</Badge>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-sub)", marginTop: 1 }}>098 452 1330 · 1 mascota</div>
        </div>
      </div>
    </Card>
  );
}
