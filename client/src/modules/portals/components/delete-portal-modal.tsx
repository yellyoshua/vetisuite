import { portalUrl, T } from "@/lib/constants";
import type { Portal } from "@/lib/types";
import { Btn, Modal } from "@/components/ui";

/* Deleting is the only portal action without its own route: confirmation modal. */
export function DeletePortalModal({ portal, onClose, onConfirm }: { portal: Portal; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal title="Eliminar portal" onClose={onClose}>
      <p style={{ fontSize: 13.5, color: T.ink }}>
        ¿Eliminar <b>{portal.name}</b>? La dirección <b>{portalUrl(portal.slug)}</b> dejará de estar publicada.
      </p>
      <p style={{ fontSize: 12.5, color: T.sub, marginTop: 6 }}>Esta acción no se puede deshacer.</p>
      <div className="flex justify-end gap-2 mt-5">
        <Btn kind="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn kind="danger" onClick={onConfirm}>Eliminar portal</Btn>
      </div>
    </Modal>
  );
}
