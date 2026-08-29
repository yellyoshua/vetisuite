import { useNavigate } from "react-router-dom";
import { useVetStore } from "@/states/app.state";
import { CustomPage } from "@/components/pages/custom-page";
import { ProductForm } from "./components/product-form";

export default function ProductNewPage() {
  const addProduct = useVetStore((s) => s.addProduct);
  const navigate = useNavigate();
  return (
    <CustomPage goBack backTo="/inventory" title="Nuevo producto" description="Ingresa el producto al catálogo del inventario.">
      <ProductForm submitLabel="Ingresar producto" onCancel={() => navigate("/inventory")}
        onSubmit={(data, initialStock) => { addProduct({ ...data, stock: initialStock }); navigate("/inventory"); }} />
    </CustomPage>
  );
}
