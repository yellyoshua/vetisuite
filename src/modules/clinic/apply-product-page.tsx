import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { inputStyle, money, T } from "../../lib/constants";
import { useVetStore } from "../../states/app.state";
import { Btn, Card, Field } from "../../components/ui";
import { PageHeader } from "../../components/page-header";
import { ResourceNotFound } from "../../components/resource-not-found";

/* The product is SEARCHED (with thousands of SKUs a global <select>
   is unusable): filter by name/category, max 8 matches. The charge
   goes to the patient's active (latest) consultation. */
export default function ApplyProductPage() {
  const { patientId } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const patient = s.patients.find((p) => p.id === patientId);
  if (!patient) return <ResourceNotFound backTo="/clinic" label="el paciente" />;
  const latestRecord = s.records.filter((r) => r.patientId === patient.id)[0];
  const backTo = `/clinic/show/${patient.id}`;
  if (!latestRecord) return <ResourceNotFound backTo={backTo} label={`una consulta activa para ${patient.name}: abre primero una consulta`} />;
  const product = s.inventory.find((p) => p.id === productId);
  const matches = s.inventory.filter((p) => p.stock > 0 && (p.name + " " + p.category).toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  return (
    <div>
      <PageHeader backTo={backTo} title="Aplicar insumo clínico" sub={`Paciente: ${patient.name} · Descuenta inventario y carga la cuenta del cliente en tiempo real.`} />
      <Card className="p-5" style={{ maxWidth: 560 }}>
        {!product ? (
          <>
            <Field label="Buscar producto en inventario">
              <input autoFocus style={inputStyle} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nombre o categoría… (ej: vacuna)" />
            </Field>
            <div className="flex flex-col gap-1.5 mb-2">
              {matches.map((p) => (
                <button key={p.id} className="vs-opt flex items-center justify-between gap-2 text-left px-3 py-2" style={{ border: `1px solid ${T.line}`, borderRadius: 10 }} onClick={() => setProductId(p.id)}>
                  <span className="min-w-0"><span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span><span style={{ fontSize: 11.5, color: T.sub }}> · {p.category}</span></span>
                  <span className="shrink-0" style={{ fontSize: 12, color: T.sub }}>stock {p.stock} · {money(p.price)}</span>
                </button>
              ))}
              {matches.length === 0 && <p style={{ fontSize: 12.5, color: T.sub }}>Sin productos con stock que coincidan con “{query}”.</p>}
            </div>
            <div className="flex justify-end">
              <Btn kind="ghost" onClick={() => navigate(backTo)}>Cancelar</Btn>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 mb-3" style={{ border: `1px solid ${T.green}`, background: T.greenSoft, borderRadius: 10, padding: "8px 12px" }}>
              <div className="min-w-0">
                <div className="truncate" style={{ fontSize: 13.5, fontWeight: 700 }}>{product.name}</div>
                <div style={{ fontSize: 11.5, color: T.sub }}>{product.category} · stock {product.stock} · {money(product.price)} c/u</div>
              </div>
              <button onClick={() => setProductId(null)} title="Cambiar producto" className="shrink-0" style={{ color: T.sub }}><X size={15} /></button>
            </div>
            <Field label="Cantidad"><input type="number" min={1} style={inputStyle} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} /></Field>
            <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>Se descontará del inventario de forma instantánea y se cargarán {money(product.price * qty)} a la cuenta abierta del cliente.</p>
            <div className="flex justify-end gap-2">
              <Btn kind="ghost" onClick={() => navigate(backTo)}>Cancelar</Btn>
              <Btn onClick={() => { s.applyProduct(latestRecord.id, patient.id, product.id, qty); navigate(backTo); }}>Aplicar y descontar</Btn>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
