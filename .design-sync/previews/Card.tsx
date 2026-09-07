import { Card, Btn, Badge } from "client";

/** Contenedor base: blanco, borde `line`, radio 16, sin sombra en reposo. */
export function Basica() {
  return (
    <Card className="p-5" style={{ maxWidth: 420 }}>
      <h2 style={{ fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 600, color: "var(--color-ink)" }}>Resumen del día</h2>
      <p style={{ fontSize: 12.5, color: "var(--color-sub)", marginTop: 6 }}>
        8 citas agendadas, 3 servicios en curso y 2 cuentas abiertas por cobrar.
      </p>
    </Card>
  );
}

/** Card de detalle: cabecera con badge y pares label/valor de la pantalla `show`. */
export function ConCabecera() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 600, color: "var(--color-ink)" }}>Carolina Ríos</h2>
        <Badge tone="green">Sin deuda</Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
        {[["Teléfono", "099 812 3344"], ["Correo", "caro.rios@mail.com"], ["Mascotas", "2"]].map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-sub)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13.5, color: "var(--color-ink)", fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Card de KPI del dashboard: cifra Sora 26/700 sobre label en `sub`. */
export function Kpi() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[["Citas de hoy", "8"], ["En atención", "3"], ["Por cobrar", "$182.40"]].map(([label, value]) => (
        <Card key={label} className="p-4">
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-sub)", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 700, color: "var(--color-ink)", letterSpacing: -0.5, marginTop: 4 }}>{value}</div>
        </Card>
      ))}
    </div>
  );
}

/** Pie de formulario: acciones alineadas a la derecha, `Cancelar` en ghost. */
export function ConAcciones() {
  return (
    <Card className="p-5" style={{ maxWidth: 420 }}>
      <p style={{ fontSize: 13, color: "var(--color-ink)" }}>
        Se cargará la consulta ($25.00) a la visita abierta de Jorge Paredes.
      </p>
      <div className="flex justify-end gap-2 mt-4">
        <Btn kind="ghost">Cancelar</Btn>
        <Btn>Confirmar</Btn>
      </div>
    </Card>
  );
}
