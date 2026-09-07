import { Select, Field, Card } from "client";

/** Mismo aspecto que `Input`: el desplegable no se estiliza aparte. */
export function Basico() {
  return (
    <Card className="p-5" style={{ maxWidth: 460 }}>
      <Field label="Categoría">
        <Select defaultValue="Vacunas">
          <option>Vacunas</option>
          <option>Medicamentos</option>
          <option>Estética</option>
          <option>Alimento</option>
        </Select>
      </Field>
      <Field label="Especie">
        <Select defaultValue="Perro">
          <option>Perro</option>
          <option>Gato</option>
          <option>Ave</option>
        </Select>
      </Field>
    </Card>
  );
}

/** Estados: opción vacía como marcador y control deshabilitado. */
export function Estados() {
  return (
    <Card className="p-5" style={{ maxWidth: 460 }}>
      <Field label="Sin registrar">
        <Select defaultValue="">
          <option value="">Sin registrar</option>
          <option>Macho</option>
          <option>Hembra</option>
        </Select>
      </Field>
      <Field label="Deshabilitado">
        <Select defaultValue="Efectivo" disabled>
          <option>Efectivo</option>
          <option>Tarjeta</option>
        </Select>
      </Field>
    </Card>
  );
}

/** Como filtro de listado: ancho automático, no el 100% del formulario. */
export function ComoFiltro() {
  return (
    <Card className="p-5" style={{ maxWidth: 460 }}>
      <div className="flex items-center gap-2 flex-wrap">
        <Select defaultValue="Todos los estados" style={{ width: "auto", minWidth: 140, padding: "8px 11px" }}>
          <option>Todos los estados</option>
          <option>Pendiente</option>
          <option>Confirmada</option>
          <option>Completada</option>
        </Select>
        <Select defaultValue="Este mes" style={{ width: "auto", minWidth: 140, padding: "8px 11px" }}>
          <option>Hoy</option>
          <option>Esta semana</option>
          <option>Este mes</option>
        </Select>
      </div>
    </Card>
  );
}
