import { useNavigate, useParams } from "react-router-dom";
import { useVetStore } from "../../states/app.state";
import { PageHeader } from "../../components/page-header";
import { ResourceNotFound } from "../../components/resource-not-found";
import { ProductForm } from "./components/product-form";

export default function ProductEditPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const product = s.inventory.find((p) => p.id === id);
  if (!product) return <ResourceNotFound backTo="/inventory" label="el producto" />;
  return (
    <div>
      <PageHeader backTo={`/inventory/show/${product.id}`} title={`Editar · ${product.name}`} sub="El stock no se edita aquí: cambia con lotes y aplicaciones clínicas." />
      <ProductForm initial={{ name: product.name, category: product.category, minStock: product.minStock, price: product.price, expiry: product.expiry }}
        submitLabel="Guardar cambios" onCancel={() => navigate(`/inventory/show/${product.id}`)}
        onSubmit={(data) => { s.updateProduct(product.id, data); navigate(`/inventory/show/${product.id}`); }} />
    </div>
  );
}
