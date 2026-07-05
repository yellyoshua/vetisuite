import { useState } from "react";
import { X } from "lucide-react";
import { inputStyle, money, T } from "../../../lib/constants";
import type { MedicalRecord } from "../../../lib/types";
import { useVetStore } from "../../../states/app.state";
import { Btn, Field, Modal } from "../../../components/ui";

/* The product is also SEARCHED (with thousands of SKUs a global
   <select> is unusable): filter by name/category, max 8 matches. */
export function ApplyProductModal({ record, onClose }: { record: MedicalRecord; onClose: () => void }) {
  const s = useVetStore();
  const [query, setQuery] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const product = s.inventory.find((p) => p.id === productId);
  const matches = s.inventory.filter((p) => p.stock > 0 && (p.name + " " + p.category).toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  return (
    <Modal title="Aplicar insumo clínico" onClose={onClose}>
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
          <Btn full onClick={() => { s.applyProduct(record.id, record.patientId, product.id, qty); onClose(); }}>Aplicar y descontar</Btn>
        </>
      )}
    </Modal>
  );
}
