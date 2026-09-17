import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Eye, Globe, Pencil, Plus, Trash2 } from "lucide-react";
import { PALETTE_FIELDS, portalUrl, T } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { PortalLogo } from "./components/portal-logo";
import { ResourceListItem } from "@/components/resource-list-item";
import { DeletePortalModal } from "./components/delete-portal-modal";

export default function PortalsPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [actionPortalId, setActionPortalId] = useState<string | null>(null);

  const actionPortal = s.portals.find((p) => p.id === actionPortalId);
  const portalSubmissionsCount = (portalId: string) =>
    s.portalSubmissions.filter((sub) => sub.portalId === portalId).length;

  const filteredPortals = s.portals.filter((p) => {
    if (filterStatus === "all") return true;
    return p.status === filterStatus;
  });

  return (
    <CustomPage
      title="Portales"
      description="Páginas públicas de la clínica y campañas por etapas para reserva en línea y captura de pacientes."
      actions={
        <Btn onClick={() => navigate("/portals/new")}>
          <Plus size={14} /> Nuevo portal
        </Btn>
      }
    >
      <div className="flex gap-2 mb-4 border-b pb-2" style={{ borderColor: T.line }}>
        <button
          type="button"
          onClick={() => setFilterStatus("all")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: filterStatus === "all" ? T.dark : "transparent",
            color: filterStatus === "all" ? "#fff" : T.sub,
          }}
        >
          Todos ({s.portals.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus("published")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: filterStatus === "published" ? T.dark : "transparent",
            color: filterStatus === "published" ? "#fff" : T.sub,
          }}
        >
          Publicados ({s.portals.filter((p) => p.status === "published").length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus("draft")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: filterStatus === "draft" ? T.dark : "transparent",
            color: filterStatus === "draft" ? "#fff" : T.sub,
          }}
        >
          Borradores ({s.portals.filter((p) => p.status === "draft").length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus("archived")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: filterStatus === "archived" ? T.dark : "transparent",
            color: filterStatus === "archived" ? "#fff" : T.sub,
          }}
        >
          Archivados ({s.portals.filter((p) => p.status === "archived").length})
        </button>
      </div>

      {filteredPortals.map((p) => {
        const subCount = portalSubmissionsCount(p.id);
        const statusBadgeTone =
          p.status === "published" ? "green" : p.status === "archived" ? "amber" : "gray";
        const statusLabel =
          p.status === "published" ? "Publicado" : p.status === "archived" ? "Archivado" : "Borrador";

        return (
          <ResourceListItem
            key={p.id}
            icon={<PortalLogo url={p.logoUrl} size={40} />}
            title={p.name}
            subtitle={portalUrl(p.slug)}
            badges={
              <span className="inline-flex gap-1.5 items-center flex-wrap">
                <Badge tone={statusBadgeTone}>{statusLabel}</Badge>
                {p.campaignName && <Badge tone="blue">{p.campaignName}</Badge>}
                <span style={{ fontSize: 11.5, color: T.sub, fontWeight: 500 }}>
                  {subCount} {subCount === 1 ? "envío" : "envíos"}
                </span>
                <span className="inline-flex gap-1 items-center ml-1">
                  {PALETTE_FIELDS.map((f) => (
                    <span
                      key={f.key}
                      title={f.label}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 99,
                        background: p.palette[f.key],
                        border: `1px solid ${T.line}`,
                      }}
                    />
                  ))}
                </span>
              </span>
            }
            actions={
              <>
                <a
                  href={`/p/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border hover:bg-slate-50 transition-colors"
                  style={{ borderColor: T.line, color: T.ink }}
                  title="Abrir página pública del portal"
                >
                  <ExternalLink size={13} /> Público
                </a>
                <Btn small kind="ghost" onClick={() => navigate(`/portals/show/${p.id}`)}>
                  <Eye size={13} /> Ver
                </Btn>
                <Btn small kind="ghost" onClick={() => navigate(`/portals/edit/${p.id}`)}>
                  <Pencil size={13} /> Editar
                </Btn>
                <Btn small kind="danger" onClick={() => setActionPortalId(p.id)}>
                  <Trash2 size={13} /> {subCount > 0 ? "Gestionar" : "Eliminar"}
                </Btn>
              </>
            }
          />
        );
      })}

      {filteredPortals.length === 0 && (
        <Card className="p-10 text-center">
          <Globe size={26} color={T.sub} className="mx-auto mb-3" />
          <p style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>No hay portales en esta sección.</p>
          <p style={{ fontSize: 12.5, color: T.sub, marginTop: 4, marginBottom: 16 }}>
            Crea un nuevo portal para publicar una experiencia de captura o reserva.
          </p>
          <Btn onClick={() => navigate("/portals/new")}>
            <Plus size={14} /> Nuevo portal
          </Btn>
        </Card>
      )}

      {actionPortal && (
        <DeletePortalModal
          portal={actionPortal}
          hasSubmissions={portalSubmissionsCount(actionPortal.id) > 0}
          onClose={() => setActionPortalId(null)}
          onConfirmDelete={() => {
            s.removePortal(actionPortal.id);
            setActionPortalId(null);
          }}
          onConfirmArchive={() => {
            s.archivePortal(actionPortal.id);
            setActionPortalId(null);
          }}
        />
      )}
    </CustomPage>
  );
}
