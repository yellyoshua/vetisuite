import { useNavigate, useParams } from "react-router-dom";
import { useVetStore } from "@/states/app.state";
import { CustomPage } from "@/components/pages/custom-page";
import { ResourceNotFound } from "@/components/resource-not-found";
import { PortalForm } from "./components/portal-form";

export default function PortalEditPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const portal = s.portals.find((p) => p.id === id);
  if (!portal) return <ResourceNotFound backTo="/portals" label="el portal" />;
  return (
    <CustomPage goBack backTo={`/portals/show/${portal.id}`} title={`Editar · ${portal.name}`} description="Cambiar el slug cambia la dirección pública del portal.">
      <PortalForm initial={{ name: portal.name, slug: portal.slug, palette: portal.palette, markdown: portal.markdown, logoUrl: portal.logoUrl }}
        submitLabel="Guardar cambios" onCancel={() => navigate(`/portals/show/${portal.id}`)}
        onSubmit={(data) => { if (s.updatePortal(portal.id, data)) navigate(`/portals/show/${portal.id}`); }} />
    </CustomPage>
  );
}
