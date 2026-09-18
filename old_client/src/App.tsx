import { Route, Routes } from "react-router-dom";
import { useAuthStore } from "./states/auth.store";
import { StaffRoutes } from "./routes/staff.routes";
import PublicPortalPage from "./modules/portals/public/portal-public-page";

export default function App() {
  const profile = useAuthStore((s) => s.profile);

  return (
    <Routes>
      <Route path="/p/:slug" element={<PublicPortalPage />} />
      <Route path="/*" element={profile === "staff" ? <StaffRoutes /> : null} />
    </Routes>
  );
}
