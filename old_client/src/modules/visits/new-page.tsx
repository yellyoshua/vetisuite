import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { T } from "@/lib/constants";
import type { Client } from "@/lib/types";
import { useVetStore } from "@/states/app.state";
import { Btn, Card, Field } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { ClientSearch } from "@/components/client-search";

export default function VisitNewPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const pets = client ? s.patients.filter((p) => p.clientId === client.id) : [];
  const start = () => {
    if (!client || pets.length === 0) return;
    navigate(`/visits/edit/${s.openVisit(client.id, pets[0].id)}`);
  };
  return (
    <CustomPage goBack backTo="/visits" title="Check-in general" description="Selecciona el cliente para iniciar su visita. Las mascotas y servicios se agregan en el siguiente paso.">
      <Card className="p-5">
        <Field label="Cliente">
          <ClientSearch autoFocus selected={client} onSelect={setClient} />
        </Field>
        <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>Si el cliente ya tiene una visita abierta, se reutiliza en lugar de crear otra.</p>
        {client && pets.length === 0 && (
          <p style={{ fontSize: 12.5, color: T.amber, marginBottom: 14 }}>{client.name} no tiene mascotas registradas: una visita necesita al menos un paciente.</p>
        )}
        <div className="flex justify-end gap-2">
          <Btn kind="ghost" onClick={() => navigate("/visits")}>Cancelar</Btn>
          <Btn disabled={!client || pets.length === 0} onClick={start}>Iniciar visita</Btn>
        </div>
      </Card>
    </CustomPage>
  );
}
