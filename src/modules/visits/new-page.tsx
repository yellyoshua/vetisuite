import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { T } from "../../lib/constants";
import type { Client } from "../../lib/types";
import { useVetStore } from "../../states/app.state";
import { Btn, Card, Field } from "../../components/ui";
import { PageHeader } from "../../components/page-header";
import { ClientSearch } from "../../components/client-search";

export default function VisitNewPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const start = () => {
    if (!client) return;
    const firstPet = s.patients.find((p) => p.clientId === client.id)?.id ?? "";
    navigate(`/visits/edit/${s.openVisit(client.id, firstPet)}`);
  };
  return (
    <div>
      <PageHeader backTo="/visits" title="Check-in general" sub="Selecciona el cliente para iniciar su visita. Las mascotas y servicios se agregan en el siguiente paso." />
      <Card className="p-5" style={{ maxWidth: 560 }}>
        <Field label="Cliente">
          <ClientSearch autoFocus selected={client} onSelect={setClient} />
        </Field>
        <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>Si el cliente ya tiene una visita abierta, se reutiliza en lugar de crear otra.</p>
        <div className="flex justify-end gap-2">
          <Btn kind="ghost" onClick={() => navigate("/visits")}>Cancelar</Btn>
          <Btn disabled={!client} onClick={start}>Iniciar visita</Btn>
        </div>
      </Card>
    </div>
  );
}
