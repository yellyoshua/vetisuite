import { useState } from "react";
import { inputStyle, money, T } from "../../../lib/constants";
import type { LabOrder } from "../../../lib/types";
import { useVetStore } from "../../../states/app.state";
import { Badge, Btn } from "../../../components/ui";

export function LabOrderCard({ order }: { order: LabOrder }) {
  const s = useVetStore();
  const [result, setResult] = useState("");
  const patient = s.patients.find((p) => p.id === order.patientId);
  return (
    <div style={{ border: `1px solid ${T.lineSoft}`, borderRadius: 12, padding: "10px 12px" }}>
      <div className="flex items-center justify-between gap-2">
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{order.test}</span>
        <Badge tone={order.status === "resultado" ? "green" : "amber"}>{order.status}</Badge>
      </div>
      <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>{patient?.name} · {money(order.price)}</div>
      {order.status === "solicitado" ? (
        <div className="mt-2 flex flex-col gap-1.5">
          <input style={{ ...inputStyle, padding: "6px 9px", fontSize: 12 }} value={result} onChange={(e) => setResult(e.target.value)} placeholder="Resumen del resultado…" />
          <Btn small kind="ghost" disabled={!result} onClick={() => s.loadLabResult(order.id, result)}>Cargar resultado</Btn>
        </div>
      ) : (
        <p style={{ fontSize: 11.5, color: T.ink, marginTop: 4, background: T.greenSoft, borderRadius: 8, padding: "5px 8px" }}>{order.result}</p>
      )}
    </div>
  );
}
