import { useNavigate } from "react-router-dom";
import { Bell, CalendarDays, ChevronRight, Clock, Package, Receipt, Scissors } from "lucide-react";
import { daysUntil, F, money, T, todayLabel } from "../../lib/constants";
import { useVetStore } from "../../states/app.state";
import { Badge, Btn, Card, PatientAlerts, SectionHead } from "../../components/ui";

const MAX_ALERTS = 3;

export default function DashboardPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  const todayAppointments = s.appointments.filter((a) => a.status !== "cancelada");
  const inGrooming = s.grooming.filter((g) => g.status === "pendiente" || g.status === "proceso");
  const lowStock = s.inventory.filter((p) => p.stock <= p.minStock);
  const expiringSoon = s.inventory.filter((p) => daysUntil(p.expiry) <= 60);
  const clientsWithDebt = s.clients.filter((c) => c.debt > 0);
  const revenue = s.invoices.reduce((t, f) => t + f.total, 0);
  const kpis = [
    { label: "Citas de hoy", value: todayAppointments.length, sub: `${todayAppointments.filter((a) => a.status === "confirmada").length} confirmadas`, icon: CalendarDays, tone: T.green, to: "/appointments" },
    { label: "En estética", value: inGrooming.length, sub: "pendientes o en proceso", icon: Scissors, tone: T.blue, to: "/grooming" },
    { label: "Alertas de stock", value: lowStock.length + expiringSoon.length, sub: `${lowStock.length} bajos · ${expiringSoon.length} por caducar`, icon: Package, tone: T.amber, to: "/inventory" },
    { label: "Ingresos de hoy", value: money(revenue), sub: `${s.invoices.length} facturas emitidas`, icon: Receipt, tone: T.dark, to: "/billing" },
  ];
  return (
    <div>
      <SectionHead title="Buen día 👋" sub={`Hoy es ${todayLabel}. Este es el pulso de la clínica.`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
            <button onClick={() => navigate(k.to)} className="w-full text-left">
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>{k.label}</span>
                <k.icon size={16} color={k.tone} />
              </div>
              <div style={{ fontFamily: F.head, fontSize: 26, fontWeight: 700, color: T.ink, letterSpacing: -0.5 }}>{k.value}</div>
              <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>{k.sub}</div>
            </button>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600 }}>Agenda de hoy</h2>
            <Btn small kind="ghost" onClick={() => navigate("/appointments")}>Ver calendario <ChevronRight size={13} /></Btn>
          </div>
          {todayAppointments.sort((a, b) => a.time.localeCompare(b.time)).map((a) => {
            const patient = s.patients.find((p) => p.id === a.patientId)!;
            const owner = s.clients.find((c) => c.id === patient.clientId)!;
            const vet = s.vets.find((v) => v.id === a.vetId)!;
            return (
              <div key={a.id} className="flex items-center flex-wrap gap-x-3 gap-y-1 py-2.5" style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                <span style={{ fontFamily: F.head, fontWeight: 600, fontSize: 13, width: 46, color: T.ink, fontVariantNumeric: "tabular-nums" }}>{a.time}</span>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{patient.name} <span style={{ fontWeight: 400, color: T.sub }}>· {owner.name}</span></div>
                  <div style={{ fontSize: 12, color: T.sub }}>{a.reason} · {vet.name}</div>
                </div>
                <PatientAlerts patient={patient} small />
                <Badge tone={a.status === "confirmada" ? "green" : a.status === "completada" ? "blue" : "amber"}>{a.status}</Badge>
              </div>
            );
          })}
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h2 style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600, marginBottom: 14 }} className="flex items-center gap-2"><Bell size={15} color={T.amber} /> Alertas operativas</h2>
          <div className="flex flex-col gap-2.5">
            {lowStock.slice(0, MAX_ALERTS).map((p) => (
              <div key={p.id} className="flex items-center gap-2" style={{ background: T.amberSoft, borderRadius: 10, padding: "9px 11px", fontSize: 12.5 }}>
                <Package size={14} color={T.amber} /><span><b>{p.name}</b>: {p.stock} uds (mín. {p.minStock}). Reabastecer.</span>
              </div>
            ))}
            {lowStock.length > MAX_ALERTS && (
              <button onClick={() => navigate("/inventory")} className="text-left" style={{ fontSize: 12, color: T.amber, fontWeight: 600 }}>+{lowStock.length - MAX_ALERTS} productos más con stock bajo → Inventario</button>
            )}
            {expiringSoon.slice(0, MAX_ALERTS).map((p) => (
              <div key={p.id} className="flex items-center gap-2" style={{ background: T.redSoft, borderRadius: 10, padding: "9px 11px", fontSize: 12.5 }}>
                <Clock size={14} color={T.red} /><span><b>{p.name}</b> caduca en {daysUntil(p.expiry)} días.</span>
              </div>
            ))}
            {expiringSoon.length > MAX_ALERTS && (
              <button onClick={() => navigate("/inventory")} className="text-left" style={{ fontSize: 12, color: T.red, fontWeight: 600 }}>+{expiringSoon.length - MAX_ALERTS} productos más por caducar → Inventario</button>
            )}
            {clientsWithDebt.slice(0, MAX_ALERTS).map((c) => (
              <button key={c.id} onClick={() => navigate(`/clients/show/${c.id}`)} className="flex items-center gap-2 text-left" style={{ background: T.blueSoft, borderRadius: 10, padding: "9px 11px", fontSize: 12.5 }}>
                <Receipt size={14} color={T.blue} /><span><b>{c.name}</b> tiene deuda pendiente de {money(c.debt)}.</span>
              </button>
            ))}
            {clientsWithDebt.length > MAX_ALERTS && (
              <button onClick={() => navigate("/billing")} className="text-left" style={{ fontSize: 12, color: T.blue, fontWeight: 600 }}>+{clientsWithDebt.length - MAX_ALERTS} clientes más con deuda → Facturación</button>
            )}
            {lowStock.length + expiringSoon.length + clientsWithDebt.length === 0 && (
              <p style={{ fontSize: 13, color: T.sub }}>Sin alertas. Todo en orden ✨</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
