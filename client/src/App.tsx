import { useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { F, MODULES, T } from "./lib/constants";
import { MobileDrawer, MobileTopBar, Sidebar } from "./components/layout";
import { Toasts } from "./components/toasts";
import DashboardPage from "./modules/dashboard/page";
import ClientsPage from "./modules/clients/page";
import ClientNewPage from "./modules/clients/new-page";
import ClientShowPage from "./modules/clients/show-page";
import ClientEditPage from "./modules/clients/edit-page";
import AppointmentsPage from "./modules/appointments/page";
import AppointmentNewPage from "./modules/appointments/new-page";
import AppointmentShowPage from "./modules/appointments/show-page";
import AppointmentEditPage from "./modules/appointments/edit-page";
import VisitsPage from "./modules/visits/page";
import VisitNewPage from "./modules/visits/new-page";
import VisitEditPage from "./modules/visits/edit-page";
import VisitShowPage from "./modules/visits/show-page";
import GroomingPage from "./modules/grooming/page";
import GroomingNewPage from "./modules/grooming/new-page";
import GroomingShowPage from "./modules/grooming/show-page";
import ClinicPage from "./modules/clinic/page";
import ClinicShowPage from "./modules/clinic/show-page";
import ConsultationNewPage from "./modules/clinic/consultation-page";
import ApplyProductPage from "./modules/clinic/apply-product-page";
import LabOrderNewPage from "./modules/clinic/lab-order-page";
import PrescriptionNewPage from "./modules/clinic/prescription-page";
import InventoryPage from "./modules/inventory/page";
import ProductNewPage from "./modules/inventory/new-page";
import ProductShowPage from "./modules/inventory/show-page";
import ProductEditPage from "./modules/inventory/edit-page";
import BillingPage from "./modules/billing/page";
import CollectPage from "./modules/billing/collect-page";
import InvoiceShowPage from "./modules/billing/show-page";
import FinancePage from "./modules/finance/page";

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();
  const moduleLabel = (MODULES.find((m) => m.path !== "/" && location.pathname.startsWith(m.path)) || MODULES[0]).label;
  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ height: "100dvh", background: T.bg, fontFamily: F.body, color: T.ink }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <MobileTopBar onMenu={() => setDrawer(true)} moduleLabel={moduleLabel} />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6 mx-auto" style={{ maxWidth: 1180 }}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/clients">
                <Route index element={<ClientsPage />} />
                <Route path="new" element={<ClientNewPage />} />
                <Route path="show/:id" element={<ClientShowPage />} />
                <Route path="edit/:id" element={<ClientEditPage />} />
              </Route>
              <Route path="/appointments">
                <Route index element={<AppointmentsPage />} />
                <Route path="new" element={<AppointmentNewPage />} />
                <Route path="show/:id" element={<AppointmentShowPage />} />
                <Route path="edit/:id" element={<AppointmentEditPage />} />
              </Route>
              <Route path="/visits">
                <Route index element={<VisitsPage />} />
                <Route path="new" element={<VisitNewPage />} />
                <Route path="edit/:id" element={<VisitEditPage />} />
                <Route path="show/:id" element={<VisitShowPage />} />
              </Route>
              <Route path="/grooming">
                <Route index element={<GroomingPage />} />
                <Route path="new" element={<GroomingNewPage />} />
                <Route path="show/:id" element={<GroomingShowPage />} />
              </Route>
              <Route path="/clinic">
                <Route index element={<ClinicPage />} />
                <Route path="show/:patientId" element={<ClinicShowPage />} />
                <Route path="consultation/:patientId" element={<ConsultationNewPage />} />
                <Route path="apply-product/:patientId" element={<ApplyProductPage />} />
                <Route path="lab-order/:patientId" element={<LabOrderNewPage />} />
                <Route path="prescription/:patientId" element={<PrescriptionNewPage />} />
              </Route>
              <Route path="/inventory">
                <Route index element={<InventoryPage />} />
                <Route path="new" element={<ProductNewPage />} />
                <Route path="show/:id" element={<ProductShowPage />} />
                <Route path="edit/:id" element={<ProductEditPage />} />
              </Route>
              <Route path="/billing">
                <Route index element={<BillingPage />} />
                <Route path="collect/:id" element={<CollectPage />} />
                <Route path="show/:id" element={<InvoiceShowPage />} />
              </Route>
              <Route path="/finance" element={<FinancePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
      <Toasts />
    </div>
  );
}
