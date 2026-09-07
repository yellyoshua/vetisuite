import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PackagePlus, Pencil } from "lucide-react";
import { expiryLabel, expiryState, isLowStock, money, T } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { InfoGrid } from "@/components/info-grid";
import { ResourceNotFound } from "@/components/resource-not-found";
import { RestockModal } from "./components/restock-modal";

export default function ProductShowPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const [restocking, setRestocking] = useState(false);
  const product = s.inventory.find((p) => p.id === id);
  if (!product) return <ResourceNotFound backTo="/inventory" label="el producto" />;
  const low = isLowStock(product);
  const expiry = expiryState(product.expiry);
  return (
    <CustomPage goBack backTo="/inventory" title={product.name} description="Ficha del producto."
      actions={
        <>
          <Btn kind="ghost" onClick={() => navigate(`/inventory/edit/${product.id}`)}><Pencil size={14} /> Editar</Btn>
          <Btn onClick={() => setRestocking(true)}><PackagePlus size={14} /> Ingresar lote</Btn>
        </>
      }>
      <Card className="p-5">
        <InfoGrid items={[
          { label: "Categoría", value: product.category },
          { label: "Stock", value: <span className="inline-flex items-center gap-1.5"><b style={{ color: low ? T.red : T.ink }}>{product.stock}</b><span style={{ fontSize: 11, color: T.sub }}>/ mín {product.minStock}</span>{low && <Badge tone="red">Bajo</Badge>}</span> },
          { label: "Precio de venta", value: money(product.price) },
          { label: "Caducidad", value: <span className="inline-flex items-center gap-1.5" style={{ color: T.ink }}>{product.expiry || "—"}{expiry === "caducado" && <Badge tone="red">Caducado</Badge>}{expiry === "por-caducar" && <Badge tone="amber">{expiryLabel(product.expiry)}</Badge>}</span> },
        ]} />
      </Card>
      {restocking && <RestockModal productId={product.id} onClose={() => setRestocking(false)} />}
    </CustomPage>
  );
}
