/*
 * Puente entre los servicios de dominio de shared y el contrato de errores de base-route.
 *
 * Los servicios de shared (meeting-room, wallet, account-tokens) lanzan `new Error('mensaje en
 * español')` porque nacieron bajo el wrapper de Server Actions, que trata el mensaje lanzado como
 * user-facing y lo muestra en el toast. base-route, en cambio, solo expone errores con contrato
 * explícito (`{error, status}`) y convierte cualquier Error crudo en un 500 genérico para no filtrar
 * detalles técnicos: sin traducir, "No tienes créditos suficientes" o "Aún no es la hora de tu
 * tutoría" llegarían al usuario como "Error interno del servidor".
 *
 * Se aplica SOLO alrededor de la llamada al servicio (nunca sobre un bloque entero), de modo que lo
 * que se expone es el mensaje curado de ese servicio y no el de un fallo de infraestructura vecino.
 */
export default function domainError (error, status = 400) {
  // Ya viene con contrato (lo lanzó otra ruta/servicio del server): pasa tal cual.
  if (error?.error) {
    return error;
  }

  return {error: error?.message || 'errors.internal', status};
}
