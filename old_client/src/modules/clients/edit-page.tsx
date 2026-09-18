import { useNavigate, useParams } from "react-router-dom";
import { useVetStore } from "@/states/app.state";
import { CustomPage } from "@/components/pages/custom-page";
import { ResourceNotFound } from "@/components/resource-not-found";
import { ClientForm } from "./components/client-form";

export default function ClientEditPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const client = s.clients.find((c) => c.id === id);
  if (!client) return <ResourceNotFound backTo="/clients" label="el cliente" />;
  return (
    <CustomPage goBack backTo={`/clients/show/${client.id}`} title={`Editar · ${client.name}`} description="Actualiza los datos de contacto del dueño.">
      <ClientForm initial={{ name: client.name, phone: client.phone, email: client.email }} submitLabel="Guardar cambios"
        onCancel={() => navigate(`/clients/show/${client.id}`)}
        onSubmit={(data) => { s.updateClient(client.id, data); navigate(`/clients/show/${client.id}`); }} />
    </CustomPage>
  );
}
