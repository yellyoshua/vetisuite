import { useState } from "react";
import { Globe } from "lucide-react";
import { T } from "@/lib/constants";

/* Logo del portal con reserva. Una URL rota (o vacía) cae al icono en vez de
   dejar la imagen rota del navegador; `broken` guarda la URL que falló, así
   corregirla vuelve a intentar sin efectos. */
export function PortalLogo({ url, size, alt = "" }: { url: string; size: number; alt?: string }) {
  const [broken, setBroken] = useState("");
  if (!url || broken === url) {
    return (
      <span className="inline-flex items-center justify-center" style={{ width: size, height: size, color: T.sub }}>
        <Globe size={Math.round(size * 0.45)} />
      </span>
    );
  }
  return (
    <img src={url} alt={alt} onError={() => setBroken(url)}
      style={{ width: size, height: size, objectFit: "contain", borderRadius: 12, border: `1px solid ${T.line}`, background: T.input }} />
  );
}
