import { useNavigate } from "react-router-dom";
import { SearchX } from "lucide-react";
import { T } from "@/lib/constants";
import { Btn, Card } from "./ui";

/* Shown by show/edit screens when the :id doesn't exist (broken deep-link). */
export function ResourceNotFound({ backTo, label }: { backTo: string; label: string }) {
  const navigate = useNavigate();
  return (
    <Card className="p-10 text-center">
      <SearchX size={26} color={T.sub} className="mx-auto mb-3" />
      <p style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>No se encontró {label}.</p>
      <p style={{ fontSize: 12.5, color: T.sub, marginTop: 4, marginBottom: 16 }}>El registro pudo haber sido eliminado o el enlace es incorrecto.</p>
      <Btn kind="ghost" onClick={() => navigate(backTo)}>Volver al listado</Btn>
    </Card>
  );
}
