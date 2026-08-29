import { useNavigate } from "react-router-dom";
import { useVetStore } from "@/states/app.state";
import { CustomPage } from "@/components/pages/custom-page";
import { ClientForm } from "./components/client-form";

export default function ClientNewPage() {
  const addClient = useVetStore((s) => s.addClient);
  const navigate = useNavigate();
  return (
    <CustomPage goBack backTo="/clients" title="Nuevo cliente" description="Registra al dueño; después vincula sus mascotas desde su ficha.">
      <ClientForm submitLabel="Crear cliente" onCancel={() => navigate("/clients")}
        onSubmit={(data) => { const id = addClient(data); navigate(`/clients/show/${id}`); }} />
    </CustomPage>
  );
}
