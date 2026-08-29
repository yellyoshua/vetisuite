import type { ReactNode } from "react";
import { F, T } from "@/lib/constants";

/* Standard list row for module indexes: avatar/icon, title + badges,
   subtitle/meta, and an action group (Ver / Editar / extras) on the right. */
interface ResourceListItemProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  meta?: string;
  badges?: ReactNode;
  actions: ReactNode;
}

export function ResourceListItem({ icon, title, subtitle, meta, badges, actions }: ResourceListItemProps) {
  return (
    <div className="flex items-center gap-3 p-3.5 mb-2" style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 14 }}>
      <div className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 12, background: T.greenSoft, color: T.green, fontFamily: F.head, fontWeight: 700, fontSize: 15 }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="truncate" style={{ fontFamily: F.head, fontSize: 14.5, fontWeight: 600, color: T.ink }}>{title}</span>
          {badges}
        </div>
        {subtitle && <div className="truncate" style={{ fontSize: 12, color: T.sub, marginTop: 1 }}>{subtitle}</div>}
        {meta && <div style={{ fontSize: 11.5, color: T.sub, marginTop: 1 }}>{meta}</div>}
      </div>
      <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">{actions}</div>
    </div>
  );
}
