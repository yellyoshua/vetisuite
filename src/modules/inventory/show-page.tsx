import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PackagePlus, Pencil } from "lucide-react";
import { daysUntil, money, T } from "../../lib/constants";
import { useVetStore } from "../../states/app.state";
import { Badge, Btn, Card } from "../../components/ui";
import { PageHeader } from "../../components/page-header";
import { InfoGrid } from "../../components/info-grid";
import { ResourceNotFound } from "../../components/resource-not-found";
import { RestockModal } from "./components/restock-modal";

export default function ProductShowPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const [restocking, setRestocking] = useState(false);
  const product = s.inventory.find((p) => p.id === id);
  if (!product) return <ResourceNotFound backTo="/inventory" label="el producto" />;
  const low = product.stock <= product.minStock;
  const daysToExpiry = daysUntil(product.expiry);
  return (
    <div>
      <PageHeader backTo="/inventory" title={product.name} sub="Ficha del producto."
        action={
          <div className="flex gap-2">
            <Btn kind="ghost" onClick={() => navigate(`/inventory/edit/${product.id}`)}><Pencil size={14} /> Editar</Btn>
            <Btn onClick={() => setRestocking(true)}><PackagePlus size={14} /> Ingresar lote</Btn>
          </div>
        } />
      <Card className="p-5">
        <InfoGrid items={[
          { label: "Categoría", value: product.category },
          { label: "Stock", value: <span className="inline-flex items-center gap-1.5"><b style={{ color: low ? T.red : T.ink }}>{product.stock}</b><span style={{ fontSize: 11, color: T.sub }}>/ mín {product.minStock}</span>{low && <Badge tone="red">Bajo</Badge>}</span> },
          { label: "Precio de venta", value: money(product.price) },
          { label: "Caducidad", value: <span style={{ color: daysToExpiry <= 60 ? T.red : T.ink }}>{product.expiry}{daysToExpiry <= 60 && ` · ${daysToExpiry} días`}</span> },
        ]} />
      </Card>
      {restocking && <RestockModal productId={product.id} onClose={() => setRestocking(false)} />}
    </div>
  );
}
