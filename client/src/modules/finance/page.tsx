import { Coins, Percent, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { F, PAY_METHODS, isOpenVisit, money, round2, T } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import { Card } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";

const AREA_TONE: Record<string, string> = { Clínica: T.green, Peluquería: T.blue, Laboratorio: T.amber };
const METHOD_TONE: Record<string, string> = { Efectivo: T.green, Tarjeta: T.blue, Transferencia: T.dark };

type Slice = { label: string; value: number; color: string };

/* Donut CSS-only (conic-gradient) — sin librería de gráficos. */
function Donut({ data, size = 156 }: { data: Slice[]; size?: number }) {
  const total = data.reduce((t, d) => t + d.value, 0);
  if (total <= 0) {
    return <div role="img" aria-label="Sin datos todavía" className="shrink-0" style={{ width: size, height: size, borderRadius: "50%", border: `14px solid ${T.lineSoft}` }} />;
  }
  const positive = data.filter((d) => d.value > 0);
  const stops = positive
    .map((d, i) => {
      const before = positive.slice(0, i).reduce((t, x) => t + x.value, 0); // prefix sum (n≤4)
      const start = (before / total) * 100;
      const end = ((before + d.value) / total) * 100;
      return `${d.color} ${start}% ${end}%`;
    })
    .join(", ");
  const summary = positive.map((d) => `${d.label} ${money(d.value)}`).join(", ");
  return (
    <div role="img" aria-label={`Distribución: ${summary}`} className="shrink-0" style={{ width: size, height: size, borderRadius: "50%", background: `conic-gradient(${stops})`, position: "relative" }}>
      <div style={{ position: "absolute", inset: size * 0.24, background: T.card, borderRadius: "50%" }} />
    </div>
  );
}

function Legend({ data }: { data: Slice[] }) {
  const total = data.reduce((t, d) => t + d.value, 0);
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-2.5">
      {data.map((d) => {
        const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
        return (
          <div key={d.label} className="flex items-center gap-2.5" style={{ fontSize: 13 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flex: "none" }} />
            <span className="flex-1 truncate" style={{ color: T.ink, fontWeight: 600 }}>{d.label}</span>
            <span style={{ color: T.sub, fontVariantNumeric: "tabular-nums" }}>{money(d.value)}</span>
            <span style={{ width: 42, textAlign: "right", fontWeight: 700, color: T.ink, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function FinancePage() {
  const s = useVetStore();

  // `revenue` es caja cobrada (incluye IVA y saldo anterior). `netSales` es la venta
  // del periodo — el único denominador honesto para margen y peso del IVA.
  const revenue = round2(s.invoices.reduce((t, f) => t + f.total, 0));
  const netSales = round2(s.invoices.reduce((t, f) => t + f.subtotal - f.discount, 0));
  const ivaCollected = round2(s.invoices.reduce((t, f) => t + f.iva, 0));
  const totalExpenses = round2(s.expenses.reduce((t, e) => t + e.amount, 0));
  const profit = round2(netSales - totalExpenses);
  const margin = netSales > 0 ? Math.round((profit / netSales) * 100) : null;
  const ivaPct = netSales > 0 ? Math.round((ivaCollected / netSales) * 100) : null;
  const openVisitIds = new Set(s.visits.filter(isOpenVisit).map((v) => v.id));
  const receivable = round2(
    s.clients.reduce((t, c) => t + c.debt, 0) + s.services.filter((sv) => openVisitIds.has(sv.visitId)).reduce((t, sv) => t + sv.price, 0)
  );

  const byArea: Record<string, number> = {};
  s.invoices.forEach((f) => f.items.forEach((it) => { byArea[it.source] = round2((byArea[it.source] || 0) + it.amount); }));
  const areaData: Slice[] = Object.entries(byArea)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value, color: AREA_TONE[label] || T.sub }));

  const byMethod: Record<string, number> = {};
  s.invoices.forEach((f) => { byMethod[f.method] = round2((byMethod[f.method] || 0) + f.total); });
  const methodData: Slice[] = PAY_METHODS.map((m) => ({ label: m, value: byMethod[m] || 0, color: METHOD_TONE[m] }));

  const kpis = [
    { label: "Ingresos cobrados", value: money(revenue), sub: `${s.invoices.length} facturas · ventas netas ${money(netSales)}`, icon: Receipt, tone: T.dark },
    { label: "Utilidad", value: money(profit), sub: margin === null ? "sin ventas: margen no aplica" : `margen ${margin}% sobre ventas netas`, icon: profit >= 0 ? TrendingUp : TrendingDown, tone: profit >= 0 ? T.green : T.red },
    { label: "IVA recaudado", value: money(ivaCollected), sub: ivaPct === null ? "sin ventas" : `${ivaPct}% de las ventas netas`, icon: Percent, tone: T.blue },
    { label: "Por cobrar", value: money(receivable), sub: "deuda + visitas abiertas (incluye borradores)", icon: Coins, tone: T.amber },
  ];

  return (
    <CustomPage title="Finanzas" description="El pulso económico de la clínica en gráficos. Datos de la sesión actual; los gastos son de ejemplo y no se editan desde la app.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>{k.label}</span>
              <k.icon size={16} color={k.tone} />
            </div>
            <div style={{ fontFamily: F.head, fontSize: 24, fontWeight: 700, color: k.tone, letterSpacing: -0.5, fontVariantNumeric: "tabular-nums" }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Ingresos por área</h2>
          {areaData.length > 0 ? (
            <div className="flex items-center gap-6">
              <Donut data={areaData} />
              <Legend data={areaData} />
            </div>
          ) : (
            <p style={{ fontSize: 13, color: T.sub }}>Aún no hay ventas hoy. Cobra una cuenta abierta en Facturación.</p>
          )}
        </Card>
        <Card className="p-5">
          <h2 style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Ingresos por método de pago</h2>
          <p style={{ fontSize: 11.5, color: T.sub, marginBottom: 16 }}>Arqueo de caja: suma el total cobrado, saldo anterior incluido — por eso no coincide con el donut de áreas.</p>
          <div className="flex items-center gap-6">
            <Donut data={methodData} />
            <Legend data={methodData} />
          </div>
        </Card>
      </div>
    </CustomPage>
  );
}
