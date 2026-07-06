import { useParams } from "react-router-dom";
import { F, money, T } from "../../lib/constants";
import { useVetStore } from "../../states/app.state";
import { Badge, Card } from "../../components/ui";
import { PageHeader } from "../../components/page-header";
import { InfoGrid } from "../../components/info-grid";
import { ResourceNotFound } from "../../components/resource-not-found";

const SOURCE_TONE: Record<string, "green" | "blue" | "amber"> = { Clínica: "green", Peluquería: "blue", Laboratorio: "amber" };

/* Read-only: invoices are immutable once issued. */
export default function InvoiceShowPage() {
  const { id } = useParams();
  const s = useVetStore();
  const invoice = s.invoices.find((i) => i.id === id);
  if (!invoice) return <ResourceNotFound backTo="/billing" label="la factura" />;
  const client = s.clients.find((c) => c.id === invoice.clientId)!;
  return (
    <div>
      <PageHeader backTo="/billing" title={invoice.num} sub="Detalle de la factura emitida." />
      <Card className="p-5 mb-4">
        <InfoGrid items={[
          { label: "Cliente", value: client.name },
          { label: "Teléfono", value: client.phone },
          { label: "Emitida", value: new Date(invoice.date).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }) },
        ]} />
      </Card>
      <Card className="p-5" style={{ maxWidth: 640 }}>
        <h2 style={{ fontFamily: F.head, fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Ítems ({invoice.items.length})</h2>
        {invoice.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-2 py-2" style={{ borderBottom: `1px solid ${T.lineSoft}`, fontSize: 12.5 }}>
            <span className="flex items-center gap-2 min-w-0"><Badge tone={SOURCE_TONE[item.source] || "gray"}>{item.source}</Badge><span className="truncate" style={{ color: T.ink }}>{item.desc}</span></span>
            <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{money(item.amount)}</span>
          </div>
        ))}
        {invoice.prevDebt > 0 && (
          <div className="flex items-center justify-between py-2" style={{ fontSize: 12.5, color: T.red, borderBottom: `1px solid ${T.lineSoft}` }}>
            <span>Saldo anterior pendiente</span><span style={{ fontWeight: 600 }}>{money(invoice.prevDebt)}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-3">
          <span style={{ fontFamily: F.head, fontSize: 15, fontWeight: 700 }}>Total</span>
          <span style={{ fontFamily: F.head, fontSize: 17, fontWeight: 700, color: T.green }}>{money(invoice.total)}</span>
        </div>
      </Card>
    </div>
  );
}
