import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Receipt } from "lucide-react";
import { F, IVA_RATE, PAY_METHODS, inputStyle, isServiceDone, money, round2, T } from "@/lib/constants";
import type { PayMethod } from "@/lib/types";
import { useVetStore } from "@/states/app.state";
import { Btn, Card, Field } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { ResourceNotFound } from "@/components/resource-not-found";

/* Paso de cobro sobre una visita con todos sus servicios terminados: descuento, IVA y método → factura. */
export default function CollectPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const visit = s.visits.find((v) => v.id === id);
  const [discountPct, setDiscountPct] = useState(0);
  const [ivaOn, setIvaOn] = useState(true);
  const [method, setMethod] = useState<PayMethod>(PAY_METHODS[0]);
  if (!visit) return <ResourceNotFound backTo="/billing" label="la visita" />;
  const client = s.clients.find((c) => c.id === visit.clientId)!;
  const svcs = s.services.filter((x) => x.visitId === visit.id);
  const backTo = `/visits/show/${visit.id}`;
  const pending = svcs.filter((x) => !isServiceDone(x.type, x.status)).length;
  if (svcs.length === 0 || pending > 0) {
    return (
      <CustomPage goBack backTo={backTo} title={`Cobrar · ${client.name}`} description="Aplica descuento e IVA, elige el método de pago y emite la factura.">
        <Card className="p-6 text-center">
          <p style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{svcs.length === 0 ? "La visita no tiene servicios." : `La visita tiene ${pending} servicio${pending !== 1 ? "s" : ""} sin terminar.`}</p>
          <p style={{ fontSize: 12.5, color: T.sub, marginTop: 4, marginBottom: 16 }}>Termina todos los servicios antes de cobrar.</p>
          <Btn kind="ghost" onClick={() => navigate(backTo)}>Volver a la visita</Btn>
        </Card>
      </CustomPage>
    );
  }
  const subtotal = round2(svcs.reduce((t, i) => t + i.price, 0));
  const pct = Math.min(100, Math.max(0, discountPct || 0));
  const discount = round2(subtotal * (pct / 100));
  const base = round2(subtotal - discount);
  const ivaRate = ivaOn ? IVA_RATE : 0;
  const iva = round2(base * ivaRate);
  const total = round2(base + iva + client.debt);

  const row = (label: string, value: string, opts: { strong?: boolean; color?: string } = {}) => (
    <div className="flex items-center justify-between py-1.5" style={{ fontSize: opts.strong ? 15 : 13, color: opts.color || T.ink }}>
      <span style={{ fontFamily: opts.strong ? F.head : undefined, fontWeight: opts.strong ? 700 : 400 }}>{label}</span>
      <span style={{ fontFamily: opts.strong ? F.head : undefined, fontWeight: opts.strong ? 700 : 600, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );

  return (
    <CustomPage goBack backTo={backTo} title={`Cobrar · ${client.name}`} description="Aplica descuento e IVA, elige el método de pago y emite la factura.">
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <Field label="Descuento (%)">
            <input type="number" min={0} max={100} style={inputStyle} value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value))} />
          </Field>
          <Field label="IVA">
            <label className="flex items-center gap-2" style={{ fontSize: 13.5, color: T.ink }}>
              <input type="checkbox" checked={ivaOn} onChange={(e) => setIvaOn(e.target.checked)} />
              Aplicar IVA ({Math.round(IVA_RATE * 100)}%)
            </label>
          </Field>
          <Field label="Método de pago">
            <select style={inputStyle} value={method} onChange={(e) => setMethod(e.target.value as PayMethod)}>
              {PAY_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        </Card>
        <Card className="p-5">
          {row("Subtotal servicios", money(subtotal))}
          {discount > 0 && row("Descuento", `− ${money(discount)}`, { color: T.red })}
          {discount > 0 && row("Base imponible", money(base))}
          {ivaOn && row(`IVA (${Math.round(IVA_RATE * 100)}%)`, `+ ${money(iva)}`)}
          {client.debt > 0 && row("Saldo anterior", `+ ${money(client.debt)}`, { color: T.red })}
          <div style={{ borderTop: `1px solid ${T.line}`, marginTop: 6, paddingTop: 6 }}>
            {row("Total a cobrar", money(total), { strong: true })}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Btn kind="ghost" onClick={() => navigate(backTo)}>Cancelar</Btn>
            <Btn onClick={() => {
              const invId = s.billVisit(visit.id, { discount, ivaRate, method });
              if (invId) navigate(`/billing/show/${invId}`);
            }}><Receipt size={14} /> Emitir factura</Btn>
          </div>
        </Card>
      </div>
    </CustomPage>
  );
}
