import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Receipt } from "lucide-react";
import { F, money, T } from "../../lib/constants";
import type { Client } from "../../lib/types";
import { useVetStore } from "../../states/app.state";
import { Badge, Btn, Card, Field, Pager, SectionHead } from "../../components/ui";
import { ClientSearch } from "../../components/client-search";

/* ================================================================
   BILLING — collection starts from the client: search to bring up
   their open account instantly; both lists paginated (with
   hundreds of accounts/invoices the full history never renders).
================================================================ */
const ACCOUNTS_PAGE_SIZE = 4, INVOICES_PAGE_SIZE = 5;
const sourceTone: Record<string, "green" | "blue" | "amber"> = { Clínica: "green", Peluquería: "blue", Laboratorio: "amber" };

export default function BillingPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  const [filterClient, setFilterClient] = useState<Client | null>(null);
  const [accountsPage, setAccountsPage] = useState(0);
  const [invoicesPage, setInvoicesPage] = useState(0);
  const allAccounts = filterClient ? s.accounts.filter((a) => a.clientId === filterClient.id) : s.accounts;
  const allInvoices = filterClient ? s.invoices.filter((i) => i.clientId === filterClient.id) : s.invoices;
  // Clamp instead of resetting in an effect: collecting the last account of a page must not leave an empty page.
  const accountPages = Math.max(1, Math.ceil(allAccounts.length / ACCOUNTS_PAGE_SIZE));
  const currentAccountsPage = Math.min(accountsPage, accountPages - 1);
  const accountRows = allAccounts.slice(currentAccountsPage * ACCOUNTS_PAGE_SIZE, currentAccountsPage * ACCOUNTS_PAGE_SIZE + ACCOUNTS_PAGE_SIZE);
  const invoiceRows = allInvoices.slice(invoicesPage * INVOICES_PAGE_SIZE, invoicesPage * INVOICES_PAGE_SIZE + INVOICES_PAGE_SIZE);
  return (
    <div>
      <SectionHead title="Facturación" sub="Cuentas abiertas por cliente: consolidan servicios médicos, estética, laboratorio e insumos en un solo cobro." />
      <Card className="p-4 mb-4">
        <Field label="El cobro parte del cliente — búscalo para ver su cuenta y su historial">
          <ClientSearch selected={filterClient} onSelect={(c) => { setFilterClient(c); setAccountsPage(0); setInvoicesPage(0); }} placeholder="Buscar cliente para cobrar…" />
        </Field>
        {!filterClient && <p style={{ fontSize: 12, color: T.sub, marginTop: -6 }}>Sin filtro se muestran todas las cuentas abiertas del día, paginadas.</p>}
      </Card>
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <h2 style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Cuentas abiertas ({allAccounts.length})</h2>
          <div className="flex flex-col gap-3">
            {accountRows.map((account) => {
              const client = s.clients.find((c) => c.id === account.clientId)!;
              const itemsTotal = account.items.reduce((t, i) => t + i.amount, 0);
              const total = itemsTotal + (client.debt || 0);
              return (
                <Card key={account.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontFamily: F.head, fontSize: 14.5, fontWeight: 700 }}>{client.name}</span>
                    <span style={{ fontSize: 12, color: T.sub }}>{client.phone}</span>
                  </div>
                  {account.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 py-1.5" style={{ borderBottom: `1px solid ${T.lineSoft}`, fontSize: 12.5 }}>
                      <span className="flex items-center gap-2 min-w-0"><Badge tone={sourceTone[item.source] || "gray"}>{item.source}</Badge><span className="truncate" style={{ color: T.ink }}>{item.desc}</span></span>
                      <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{money(item.amount)}</span>
                    </div>
                  ))}
                  {client.debt > 0 && (
                    <div className="flex items-center justify-between py-1.5" style={{ fontSize: 12.5, color: T.red }}>
                      <span>Saldo anterior pendiente</span><span style={{ fontWeight: 600 }}>{money(client.debt)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span style={{ fontFamily: F.head, fontSize: 15, fontWeight: 700 }}>Total: {money(total)}</span>
                    <Btn onClick={() => s.collectAccount(account.id)}><Receipt size={14} /> Cobrar y facturar</Btn>
                  </div>
                </Card>
              );
            })}
            {allAccounts.length === 0 && (
              <Card className="p-6 text-center">
                <p style={{ fontSize: 13, color: T.sub }}>
                  {filterClient
                    ? `${filterClient.name} no tiene cargos pendientes por cobrar.`
                    : "No hay cuentas abiertas. Los cargos de clínica, estética e insumos aparecerán aquí automáticamente."}
                </p>
              </Card>
            )}
          </div>
          {allAccounts.length > ACCOUNTS_PAGE_SIZE && <Pager page={currentAccountsPage} total={allAccounts.length} pageSize={ACCOUNTS_PAGE_SIZE} onPage={setAccountsPage} />}
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
                      {invoice.items.length} ítems{invoice.prevDebt > 0 && ` + deuda anterior de ${money(invoice.prevDebt)}`} · {new Date(invoice.date).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <Btn small kind="ghost" onClick={() => navigate(`/billing/show/${invoice.id}`)}><Eye size={13} /> Ver</Btn>
                  </div>
                </Card>
              );
            })}
            {allInvoices.length === 0 && (
              <Card className="p-6 text-center">
                <p style={{ fontSize: 13, color: T.sub }}>
                  {filterClient ? `Sin facturas de ${filterClient.name} el día de hoy.` : "Aún no se emiten facturas hoy. Cobra una cuenta abierta para generar la primera."}
                </p>
              </Card>
            )}
          </div>
          {allInvoices.length > INVOICES_PAGE_SIZE && <Pager page={invoicesPage} total={allInvoices.length} pageSize={INVOICES_PAGE_SIZE} onPage={setInvoicesPage} />}
        </div>
      </div>
    </div>
  );
}
