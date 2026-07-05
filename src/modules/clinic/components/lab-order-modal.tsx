import { useState } from "react";
import { inputStyle, LAB_TESTS, money } from "../../../lib/constants";
import { useVetStore } from "../../../states/app.state";
import { Btn, Field, Modal } from "../../../components/ui";

export function LabOrderModal({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const orderLab = useVetStore((s) => s.orderLab);
  const [test, setTest] = useState(Object.keys(LAB_TESTS)[0]);
  return (
    <Modal title="Orden de laboratorio" onClose={onClose}>
      <Field label="Examen">
        <select style={inputStyle} value={test} onChange={(e) => setTest(e.target.value)}>
          {Object.entries(LAB_TESTS).map(([name, price]) => <option key={name} value={name}>{name} — {money(price)}</option>)}
        </select>
      </Field>
      <Btn full onClick={() => { orderLab(patientId, test); onClose(); }}>Generar orden interna</Btn>
    </Modal>
  );
}
