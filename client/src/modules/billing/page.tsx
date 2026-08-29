import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";
import { F, isServiceDone, money, T } from "@/lib/constants";
import type { Client } from "@/lib/types";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card, Field, Pager } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { ClientSearch } from "@/components/client-search";

/* ================================================================
   BILLING — worklist de cobro: visitas abiertas (con estado de cada
   servicio) → detalle en /visits → cobro (descuento/IVA/método) →
   factura. El estado de cada servicio se avanza en el módulo Visitas.
================================================================ */
const VISITS_PAGE_SIZE = 4, INVOICES_PAGE_SIZE = 5;

export default function BillingPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  const [filterClient, setFilterClient] = useState<Client | null>(null);
  const [visitsPage, setVisitsPage] = useState(0);
  const [invoicesPage, setInvoicesPage] = useState(0);
  const allVisits = filterClient ? s.visits.filter((v) => v.clientId === filterClient.id) : s.visits;
  const allInvoices = filterClient ? s.invoices.filter((i) => i.clientId === filterClient.id) : s.invoices;
  // Clamp instead of resetting in an effect: facturar la última visita de una página no debe dejar una página vacía.
  const visitPages = Math.max(1, Math.ceil(allVisits.length / VISITS_PAGE_SIZE));
  const currentVisitsPage = Math.min(visitsPage, visitPages - 1);
  const visitRows = allVisits.slice(currentVisitsPage * VISITS_PAGE_SIZE, currentVisitsPage * VISITS_PAGE_SIZE + VISITS_PAGE_SIZE);
  const invoiceRows = allInvoices.slice(invoicesPage * INVOICES_PAGE_SIZE, invoicesPage * INVOICES_PAGE_SIZE + INVOICES_PAGE_SIZE);
  return (
    <CustomPage title="Facturación" description="Visita abierta → detalle con el estado de cada servicio → cobro con descuento, IVA y método de pago → factura.">
      <Card className="p-4 mb-4">
        <Field label="El cobro parte del cliente — búscalo para ver sus visitas y su historial">
          <ClientSearch selected={filterClient} onSelect={(c) => { setFilterClient(c); setVisitsPage(0); setInvoicesPage(0); }} placeholder="Buscar cliente para cobrar…" />
        </Field>
        {!filterClient && <p style={{ fontSize: 12, color: T.sub, marginTop: -6 }}>Sin filtro se muestran todas las visitas abiertas del día, paginadas.</p>}
      </Card>
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <h2 style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Visitas abiertas ({allVisits.length})</h2>
          <div className="flex flex-col gap-3">
            {visitRows.map((visit) => {
              const client = s.clients.find((c) => c.id === visit.clientId)!;
              const svcs = s.services.filter((x) => x.visitId === visit.id);
              const subtotal = svcs.reduce((t, i) => t + i.price, 0);
              const done = svcs.filter((x) => isServiceDone(x.type, x.status)).length;
              const ready = svcs.length > 0 && done === svcs.length;
              return (
                <Card key={visit.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontFamily: F.head, fontSize: 14.5, fontWeight: 700 }}>{client.name}</span>
                    <span style={{ fontSize: 12, color: T.sub }}>{client.phone}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <span style={{ fontSize: 12.5, color: T.sub }}>{svcs.length} servicio{svcs.length !== 1 ? "s" : ""} · <b style={{ color: T.ink }}>{money(subtotal)}</b>{client.debt > 0 && <span style={{ color: T.red }}> · +{money(client.debt)} deuda</span>}</span>
                      {!visit.started
                        ? <Badge tone="gray">Borrador · sin comenzar</Badge>
                        : <Badge tone={ready ? "green" : svcs.length === 0 ? "gray" : "amber"}>{svcs.length === 0 ? "Sin servicios" : ready ? "Listo para cobrar" : `${done}/${svcs.length} terminados`}</Badge>}
                    </div>
                    {visit.started
                      ? <Btn small kind="ghost" onClick={() => navigate(`/visits/show/${visit.id}`)}><Eye size={13} /> Ver detalle</Btn>
                      : <Btn small kind="ghost" onClick={() => navigate(`/visits/edit/${visit.id}`)}><Pencil size={13} /> Editar</Btn>}
                  </div>
                </Card>
              );
            })}
            {allVisits.length === 0 && (
              <Card className="p-6 text-center">
                <p style={{ fontSize: 13, color: T.sub }}>
                  {filterClient
                    ? `${filterClient.name} no tiene visitas abiertas.`
                    : "No hay visitas abiertas. Inicia una en Visitas o desde una cita."}
                </p>
              </Card>
            )}
          </div>
          {allVisits.length > VISITS_PAGE_SIZE && <Pager page={currentVisitsPage} total={allVisits.length} pageSize={VISITS_PAGE_SIZE} onPage={setVisitsPage} />}
        </div>
        <div>
          <h2 style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Facturas emitidas hoy ({allInvoices.length})</h2>
          <div className="flex flex-col gap-3">
            {invoiceRows.map((invoice) => {
              const client = s.clients.find((c) => c.id === invoice.clientId)!;
              return (
                <Card key={invoice.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span style={{ fontFamily: F.head, fontSize: 13.5, fontWeight: 700 }}>{invoice.num}</span>
                      <span style={{ fontSize: 12.5, color: T.sub }}> · {client.name}</span>
                    </div>
                    <span style={{ fontFamily: F.head, fontWeight: 700, color: T.green }}>{money(invoice.total)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span style={{ fontSize: 11.5, color: T.sub }}>
                      {invoice.items.length} ítems · {invoice.method} · {new Date(invoice.date).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <Btn small kind="ghost" onClick={() => navigate(`/billing/show/${invoice.id}`)}><Eye size={13} /> Ver</Btn>
                  </div>
                </Card>
              );
            })}
            {allInvoices.length === 0 && (
              <Card className="p-6 text-center">
                <p style={{ fontSize: 13, color: T.sub }}>
                  {filterClient ? `Sin facturas de ${filterClient.name} el día de hoy.` : "Aún no se emiten facturas hoy. Cobra una visita lista para generar la primera."}
                </p>
              </Card>
            )}
          </div>
          {allInvoices.length > INVOICES_PAGE_SIZE && <Pager page={invoicesPage} total={allInvoices.length} pageSize={INVOICES_PAGE_SIZE} onPage={setInvoicesPage} />}
        </div>
      </div>
    </CustomPage>
  );
}
