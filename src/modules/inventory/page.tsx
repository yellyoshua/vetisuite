import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { daysUntil, inputStyle, money, T } from "../../lib/constants";
import { useVetStore } from "../../states/app.state";
import { Badge, Btn, Card, Pager, SectionHead } from "../../components/ui";
import { NewProductModal } from "./components/new-product-modal";
import { RestockModal } from "./components/restock-modal";

/* ================================================================
   INVENTORY — search + category filter + pagination: with
   thousands of SKUs the table never renders in full.
================================================================ */
const PAGE_SIZE = 5;

export default function InventoryPage() {
  const s = useVetStore();
  const [modal, setModal] = useState<"new" | { restockId: string } | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("Todas");
  const [page, setPage] = useState(0);
  const filtered = s.inventory.filter((p) =>
    (category === "Todas" || p.category === category) &&
    (p.name + " " + p.category).toLowerCase().includes(q.toLowerCase())
  );
  const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  return (
    <div>
      <SectionHead title="Inventario" sub="Doble entrada: cada aplicación clínica descuenta stock y carga la cuenta del cliente en tiempo real."
        action={<Btn onClick={() => setModal("new")}><Plus size={14} /> Nuevo producto</Btn>} />
      <div className="flex gap-2 flex-wrap mb-3">
        <div className="flex items-center gap-2 flex-1" style={{ ...inputStyle, padding: "8px 11px", minWidth: 200 }}>
          <Search size={14} color={T.sub} className="shrink-0" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Buscar producto o categoría…"
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%", color: T.ink }} />
        </div>
        <select style={{ ...inputStyle, width: "auto", minWidth: 140 }} value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }}>
          {["Todas", "Vacunas", "Medicamentos", "Alimentos", "Estética", "Otros"].map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>
      <Card style={{ overflowX: "auto" }}>
        <table className="w-full" style={{ fontSize: 13, minWidth: 620 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.line}`, textAlign: "left" }}>
              {["Producto", "Categoría", "Stock", "P. venta", "Caducidad", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, color: T.sub, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const low = p.stock <= p.minStock;
              const daysToExpiry = daysUntil(p.expiry);
              return (
                <tr key={p.id} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                  <td style={{ padding: "11px 16px", fontWeight: 600, color: T.ink }}>{p.name}</td>
                  <td style={{ padding: "11px 16px", color: T.sub }}>{p.category}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span className="inline-flex items-center gap-1.5">
                      <b style={{ color: low ? T.red : T.ink, fontVariantNumeric: "tabular-nums" }}>{p.stock}</b>
                      <span style={{ fontSize: 11, color: T.sub }}>/ mín {p.minStock}</span>
                      {low && <Badge tone="red">Bajo</Badge>}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", fontVariantNumeric: "tabular-nums" }}>{money(p.price)}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ color: daysToExpiry <= 60 ? T.red : T.sub, fontSize: 12.5 }}>
                      {p.expiry}{daysToExpiry <= 60 && ` · ${daysToExpiry} días`}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "right" }}>
                    <Btn small kind="ghost" onClick={() => setModal({ restockId: p.id })}>Ingresar lote</Btn>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "20px 16px", fontSize: 12.5, color: T.sub, textAlign: "center" }}>Sin productos que coincidan con el filtro.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
      <Pager page={page} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
      {modal === "new" && <NewProductModal onClose={() => setModal(null)} />}
      {modal !== null && modal !== "new" && <RestockModal productId={modal.restockId} onClose={() => setModal(null)} />}
    </div>
  );
}
