import { useNavigate } from "react-router-dom";
import { useVetStore } from "../../states/app.state";
import { PageHeader } from "../../components/page-header";
import { ProductForm } from "./components/product-form";

export default function ProductNewPage() {
  const addProduct = useVetStore((s) => s.addProduct);
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader backTo="/inventory" title="Nuevo producto" sub="Ingresa el producto al catálogo del inventario." />
      <ProductForm submitLabel="Ingresar producto" onCancel={() => navigate("/inventory")}
        onSubmit={(data, initialStock) => { addProduct({ ...data, stock: initialStock }); navigate("/inventory"); }} />
    </div>
  );
}
