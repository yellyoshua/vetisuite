import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { F, T } from "../lib/constants";

/* Shared header for show/edit/new screens: back link + title + actions. */
export function PageHeader({ backTo, title, sub, action }: { backTo: string; title: string; sub?: string; action?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
      <div>
        <button onClick={() => navigate(backTo)} className="inline-flex items-center gap-1.5 mb-2" style={{ fontSize: 12.5, color: T.sub, fontWeight: 600 }}>
          <ArrowLeft size={14} /> Volver
        </button>
        <h1 style={{ fontFamily: F.head, fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: -0.3 }}>{title}</h1>
        {sub && <p style={{ fontSize: 13, color: T.sub, marginTop: 3 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
