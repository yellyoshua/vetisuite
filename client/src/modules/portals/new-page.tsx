import { useNavigate } from "react-router-dom";
import { useVetStore } from "@/states/app.state";
import { CustomPage } from "@/components/pages/custom-page";
import { PortalForm } from "./components/portal-form";

export default function PortalNewPage() {
  const addPortal = useVetStore((s) => s.addPortal);
  const navigate = useNavigate();
  return (
    <CustomPage goBack backTo="/portals" title="Nuevo portal" description="Define la dirección, la identidad visual y el contenido de la página pública.">
      <PortalForm submitLabel="Crear portal" onCancel={() => navigate("/portals")}
        onSubmit={(data) => { const id = addPortal(data); if (id) navigate(`/portals/show/${id}`); }} />
    </CustomPage>
  );
}
