import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { PALETTE_FIELDS, portalUrl, T } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import { Btn, Card } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { PortalLogo } from "./components/portal-logo";
import { InfoGrid } from "@/components/info-grid";
import { ResourceNotFound } from "@/components/resource-not-found";
import { DeletePortalModal } from "./components/delete-portal-modal";

export default function PortalShowPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const portal = s.portals.find((p) => p.id === id);
  if (!portal) return <ResourceNotFound backTo="/portals" label="el portal" />;
  return (
    <CustomPage goBack backTo="/portals" title={portal.name} description={portalUrl(portal.slug)}
      actions={
        <>
          <Btn kind="ghost" onClick={() => navigate(`/portals/edit/${portal.id}`)}><Pencil size={14} /> Editar</Btn>
          <Btn kind="danger" onClick={() => setDeleting(true)}><Trash2 size={14} /> Eliminar</Btn>
        </>
      }>
      <Card className="p-5 mb-3">
        <InfoGrid items={[
          { label: "Slug", value: portal.slug },
          {
            label: "Logo", value: <PortalLogo url={portal.logoUrl} size={48} alt="Logo del portal" />,
          },
          {
            label: "Paleta", value: (
              <span className="inline-flex gap-1.5">
                {PALETTE_FIELDS.map((f) => (
                  <span key={f.key} title={`${f.label}: ${portal.palette[f.key]}`} style={{ width: 22, height: 22, borderRadius: 7, background: portal.palette[f.key], border: `1px solid ${T.line}` }} />
                ))}
              </span>
            ),
          },
        ]} />
      </Card>
      <Card className="p-5">
        <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>Contenido (Markdown)</div>
        {/* ponytail: se muestra el markdown en crudo — el render lo hace el portal público, no el panel. */}
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "ui-monospace, monospace", fontSize: 13, lineHeight: 1.6, color: portal.markdown ? T.ink : T.sub, background: T.input, border: `1px solid ${T.line}`, borderRadius: 10, padding: 14, margin: 0 }}>
          {portal.markdown || "Sin contenido."}
        </pre>
      </Card>
      {deleting && <DeletePortalModal portal={portal} onClose={() => setDeleting(false)}
        onConfirm={() => { s.removePortal(portal.id); navigate("/portals"); }} />}
    </CustomPage>
  );
}
