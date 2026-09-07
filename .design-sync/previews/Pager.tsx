import { Pager, Card } from "client";

/** Primera página: "Anterior" deshabilitado. */
export function PrimeraPagina() {
  return (
    <Card className="p-4" style={{ maxWidth: 520 }}>
      <Pager page={0} total={48} pageSize={8} onPage={() => {}} />
    </Card>
  );
}

/** Página intermedia: ambos botones activos. */
export function PaginaIntermedia() {
  return (
    <Card className="p-4" style={{ maxWidth: 520 }}>
      <Pager page={3} total={48} pageSize={8} onPage={() => {}} />
    </Card>
  );
}

/** Última página: "Siguiente" deshabilitado. */
export function UltimaPagina() {
  return (
    <Card className="p-4" style={{ maxWidth: 520 }}>
      <Pager page={5} total={48} pageSize={8} onPage={() => {}} />
    </Card>
  );
}

/** Sin resultados: "Mostrando 0–0 de 0". */
export function SinResultados() {
  return (
    <Card className="p-4" style={{ maxWidth: 520 }}>
      <Pager page={0} total={0} pageSize={8} onPage={() => {}} />
    </Card>
  );
}
