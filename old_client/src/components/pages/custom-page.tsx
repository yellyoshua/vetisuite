import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { F, T } from "@/lib/constants";

/* Cáscara estándar de pantalla: retroceso, título, descripción y acciones.
   La usan todos los módulos; no contiene lógica de ninguna pantalla concreta.
   Las variantes se resuelven con `if` que devuelven el bloque completo: el
   componente es pequeño y repetir el JSX sale más barato que un ternario.
   El cuerpo siempre ocupa todo el ancho del contenedor de `App.tsx`. */

function BackButton({ backTo }: { backTo?: string }) {
  const navigate = useNavigate();
  const style = { fontSize: 12.5, color: T.sub, fontWeight: 600 } as const;

  if (backTo) {
    return (
      <Link to={backTo} className="inline-flex items-center gap-1.5 mb-2" style={style}>
        <ArrowLeft size={14} /> Volver
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 mb-2" style={style}>
      <ArrowLeft size={14} /> Volver
    </button>
  );
}

function PageTitle({ title }: { title: string }) {
  return <h1 style={{ fontFamily: F.head, fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: -0.3 }}>{title}</h1>;
}

function PageDescription({ description }: { description?: string }) {
  if (!description) return null;
  return <p style={{ fontSize: 13, color: T.sub, marginTop: 3 }}>{description}</p>;
}

function PageActions({ actions }: { actions?: ReactNode }) {
  if (!actions) return null;
  return <div className="flex items-center gap-2 flex-wrap">{actions}</div>;
}

function PageHead({ goBack, backTo, title, description, actions }: {
  goBack?: boolean;
  backTo?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  if (goBack) {
    return (
      <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
        <div>
          <BackButton backTo={backTo} />
          <PageTitle title={title} />
          <PageDescription description={description} />
        </div>
        <PageActions actions={actions} />
      </div>
    );
  }
  return (
    <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
      <div>
        <PageTitle title={title} />
        <PageDescription description={description} />
      </div>
      <PageActions actions={actions} />
    </div>
  );
}

interface CustomPageProps {
  /** Título de la pantalla. */
  title: string;
  /** Descripción bajo el título. */
  description?: string;
  /** Botones de acción de la pantalla (a la derecha del título). */
  actions?: ReactNode;
  /** `true` muestra el botón "Volver". */
  goBack?: boolean;
  /** Destino del botón "Volver". Sin él vuelve a la pantalla anterior. */
  backTo?: string;
  children: ReactNode;
}

export function CustomPage({ title, description, actions, goBack, backTo, children }: CustomPageProps) {
  return (
    <div>
      <PageHead goBack={goBack} backTo={backTo} title={title} description={description} actions={actions} />
      <div>{children}</div>
    </div>
  );
}
