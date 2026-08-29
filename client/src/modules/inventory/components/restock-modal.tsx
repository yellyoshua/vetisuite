import { useState } from "react";
import { inputStyle } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import { Btn, Field, Modal } from "@/components/ui";

export function RestockModal({ productId, onClose }: { productId: string; onClose: () => void }) {
  const s = useVetStore();
  const product = s.inventory.find((x) => x.id === productId)!;
  const [qty, setQty] = useState(10);
  return (
    <Modal title={`Ingresar lote · ${product.name}`} onClose={onClose}>
      <Field label="Unidades del lote"><input type="number" min={1} style={inputStyle} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} /></Field>
      <Btn full onClick={() => { s.restock(productId, qty); onClose(); }}>Añadir al stock</Btn>
    </Modal>
  );
}
