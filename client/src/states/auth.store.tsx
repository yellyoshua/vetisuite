import { create } from "zustand";

/* ================================================================
   SESIÓN — datos del usuario que entró. Hoy están quemados: no hay
   login ni backend todavía, así que la app arranca con una sesión de
   staff ya abierta.

   Todas las claves son planas a propósito: nada anidado. Cuando el
   backend devuelva la sesión real, esto se llena desde la respuesta y
   la forma no cambia.
================================================================ */
export const useAuthStore = create(() => ({
  userId: "u1",
  staffId: "v1", // coincide con el veterinario semilla del store de la clínica
  profile: "staff",
  role: "veterinaria",
  name: "Dra. María Torres",
  email: "maria.torres@vetisuite.com",
  phone: "099 555 1020",
  clinicId: "cl1",
  clinicName: "Clínica A",
  timezone: "America/Guayaquil",
  locale: "es-EC",
  active: true,
}));
