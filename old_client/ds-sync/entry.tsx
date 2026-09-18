/* Barrel de design-sync: la superficie pública del design system de Veti Suite.
   No lo importa la app — existe solo para que el converter de claude.ai/design
   compile un bundle con exactamente estos componentes.

   Solo componentes BASE. Nada específico de módulo (formularios de cliente,
   tarjetas de laboratorio, editores de horario…) entra aquí: esas pantallas se
   componen con estas piezas, no se sincronizan como piezas. Al añadir un
   componente base, añádelo aquí y en `componentSrcMap` de
   .design-sync/config.json. */

// Acción
export { Btn } from "@/components/ui";

// Etiquetas y estado
export { Badge } from "@/components/ui";

// Superficie
export { Card, Modal } from "@/components/ui";

// Formulario
export { Field, Input, Select, DateInput } from "@/components/ui";
export { Toggle } from "@/modules/appointments-clinics/components/toggle";

// Identidad
export { Avatar } from "@/components/ui";

// Navegación de listados
export { Pager } from "@/components/ui";

// Retroalimentación
export { Spinner } from "@/components/ui";
export { ToastProvider, showToast } from "@/components/toast";
