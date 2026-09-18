import type { ReactNode } from "react";
import { T } from "@/lib/constants";

/* Label/value pairs for show screens — same look across all modules. */
export function InfoGrid({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>{item.label}</div>
          <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}
