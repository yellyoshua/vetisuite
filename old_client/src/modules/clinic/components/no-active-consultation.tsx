import { useNavigate } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import { T } from "@/lib/constants";
import { Btn, Card } from "@/components/ui";

/* Precondición de negocio, no recurso inexistente: el paciente existe, lo que
   falta es una consulta abierta hoy sobre la que colgar insumos y recetas.
   Por eso NO se usa `ResourceNotFound`, cuyo mensaje habla de enlaces rotos. */
export function NoActiveConsultation({ backTo, patientId, patientName }: { backTo: string; patientId: string; patientName: string }) {
  const navigate = useNavigate();
  return (
    <Card className="p-10 text-center">
      <Stethoscope size={26} color={T.sub} className="mx-auto mb-3" />
      <p style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>{patientName} no tiene una consulta activa.</p>
      <p style={{ fontSize: 12.5, color: T.sub, marginTop: 4, marginBottom: 16 }}>
        Los insumos y las recetas se registran sobre una consulta abierta hoy. Abre una para continuar.
      </p>
      <div className="flex justify-center gap-2">
        <Btn kind="ghost" onClick={() => navigate(backTo)}>Volver al expediente</Btn>
        <Btn onClick={() => navigate(`/clinic/consultation/${patientId}`)}><Stethoscope size={14} /> Nueva consulta</Btn>
      </div>
    </Card>
  );
}
