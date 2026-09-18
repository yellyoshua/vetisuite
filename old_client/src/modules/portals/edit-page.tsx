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

  const hasSubmissions = s.portalSubmissions.some((sub) => sub.portalId === portal.id);

  return (
    <CustomPage
      goBack
      backTo={`/portals/show/${portal.id}`}
      title={`Editar · ${portal.name}`}
      description="Configura el propósito, las reglas de reserva y la presentación del portal."
    >
      <PortalForm
        initial={{
          name: portal.name,
          slug: portal.slug,
          purpose: portal.purpose,
          campaignName: portal.campaignName,
          status: portal.status,
          palette: portal.palette,
          markdown: portal.markdown,
          logoUrl: portal.logoUrl,
          vetPolicy: portal.vetPolicy,
          defaultVetId: portal.defaultVetId,
          defaultReason: portal.defaultReason,
          autoConfirm: portal.autoConfirm,
        }}
        hasSubmissions={hasSubmissions}
        submitLabel="Guardar cambios"
        takenSlugs={s.portals.filter((p) => p.id !== portal.id).map((p) => p.slug)}
        onCancel={() => navigate(`/portals/show/${portal.id}`)}
        onSubmit={(data) => {
          if (s.updatePortal(portal.id, data)) navigate(`/portals/show/${portal.id}`);
        }}
      />
    </CustomPage>
  );
}
