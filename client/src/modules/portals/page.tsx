import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Globe, Pencil, Plus, Trash2 } from "lucide-react";
import { PALETTE_FIELDS, portalUrl, T } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { PortalLogo } from "./components/portal-logo";
import { ResourceListItem } from "@/components/resource-list-item";
import { DeletePortalModal } from "./components/delete-portal-modal";

/* ================================================================
   PORTALS index — cada portal es una página pública de la clínica.
   ponytail: sin búsqueda ni paginación, una clínica tiene pocos portales.
================================================================ */
export default function PortalsPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleting = s.portals.find((p) => p.id === deleteId);
  return (
    <CustomPage title="Portales" description="Contenido, colores y logo de cada página de la clínica. La dirección queda reservada; las páginas públicas aún no se sirven."
      actions={<Btn onClick={() => navigate("/portals/new")}><Plus size={14} /> Nuevo portal</Btn>}>
      {s.portals.map((p) => (
        <ResourceListItem key={p.id}
          icon={<PortalLogo url={p.logoUrl} size={40} />}
          title={p.name}
          subtitle={portalUrl(p.slug)}
          badges={
            <span className="inline-flex gap-1 items-center">
              <Badge tone="gray">No publicado</Badge>
              {PALETTE_FIELDS.map((f) => (
                <span key={f.key} title={f.label} style={{ width: 12, height: 12, borderRadius: 99, background: p.palette[f.key], border: `1px solid ${T.line}` }} />
              ))}
            </span>
          }
          actions={<>
            <Btn small kind="ghost" onClick={() => navigate(`/portals/show/${p.id}`)}><Eye size={13} /> Ver</Btn>
            <Btn small kind="ghost" onClick={() => navigate(`/portals/edit/${p.id}`)}><Pencil size={13} /> Editar</Btn>
            <Btn small kind="danger" onClick={() => setDeleteId(p.id)}><Trash2 size={13} /> Eliminar</Btn>
          </>}
        />
      ))}
      {s.portals.length === 0 && (
        <Card className="p-10 text-center">
          <Globe size={26} color={T.sub} className="mx-auto mb-3" />
          <p style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>Aún no hay portales.</p>
          <p style={{ fontSize: 12.5, color: T.sub, marginTop: 4, marginBottom: 16 }}>Crea el primero para preparar una página de la clínica.</p>
          <Btn onClick={() => navigate("/portals/new")}><Plus size={14} /> Nuevo portal</Btn>
        </Card>
      )}
      {deleting && <DeletePortalModal portal={deleting} onClose={() => setDeleteId(null)}
        onConfirm={() => { s.removePortal(deleting.id); setDeleteId(null); }} />}
    </CustomPage>
  );
}
