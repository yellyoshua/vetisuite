import { useAuthStore } from "./states/auth.store";
import { StaffRoutes } from "./routes/staff.routes";

export default function App() {
  const profile = useAuthStore((s) => s.profile);

  if (profile === "staff") return <StaffRoutes />;

  return null;
}
