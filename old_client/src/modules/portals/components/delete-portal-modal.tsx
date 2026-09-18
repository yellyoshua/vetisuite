import { portalUrl, T } from "@/lib/constants";
import type { Portal } from "@/lib/types";
import { Btn, Modal } from "@/components/ui";

export function DeletePortalModal({
  portal,
  hasSubmissions,
  onClose,
  onConfirmDelete,
  onConfirmArchive,
}: {
  portal: Portal;
  hasSubmissions: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  onConfirmArchive: () => void;
}) {
  if (hasSubmissions) {
    return (
      <Modal title="Portal con envíos registrados" onClose={onClose}>
        <p style={{ fontSize: 13.5, color: T.ink }}>
          El portal <b>{portal.name}</b> cuenta con envíos y citas vinculadas en su historial. Por integridad de datos, no se permite su eliminación física.
        </p>
        <p style={{ fontSize: 12.5, color: T.sub, marginTop: 8 }}>
          Puedes <b>Archivar</b> este portal para que deje de estar visible al público y ya no acepte nuevas solicitudes, conservando intacto su historial.
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <Btn kind="ghost" onClick={onClose}>
            Cancelar
          </Btn>
          <Btn kind="amber" onClick={onConfirmArchive}>
            Archivar portal
          </Btn>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Eliminar portal" onClose={onClose}>
      <p style={{ fontSize: 13.5, color: T.ink }}>
        ¿Eliminar definitivamente <b>{portal.name}</b>? Se liberará la dirección web <b>{portalUrl(portal.slug)}</b> y se borrarán sus etapas y campos configurados.
      </p>
      <p style={{ fontSize: 12.5, color: T.red, marginTop: 8, fontWeight: 600 }}>
        Esta acción no se puede deshacer.
      </p>
      <div className="flex justify-end gap-2 mt-6">
        <Btn kind="ghost" onClick={onClose}>
          Cancelar
        </Btn>
        <Btn kind="danger" onClick={onConfirmDelete}>
          Eliminar portal
        </Btn>
      </div>
    </Modal>
  );
}
