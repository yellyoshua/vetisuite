import { useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { F, MODULES, T } from "./lib/constants";
import { MobileDrawer, MobileTopBar, Sidebar } from "./components/layout";
import { Toasts } from "./components/toasts";
import DashboardPage from "./modules/dashboard/page";
import ClientsPage from "./modules/clients/page";
import AppointmentsPage from "./modules/appointments/page";
import GroomingPage from "./modules/grooming/page";
import ClinicPage from "./modules/clinic/page";
import InventoryPage from "./modules/inventory/page";
import BillingPage from "./modules/billing/page";

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();
  const moduleLabel = (MODULES.find((m) => m.path === location.pathname) || MODULES[0]).label;
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
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/grooming" element={<GroomingPage />} />
              <Route path="/clinic" element={<ClinicPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
      <Toasts />
    </div>
  );
}
