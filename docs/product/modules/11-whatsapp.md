# Módulo 11: WhatsApp

## 1. Propósito y Valor
El submódulo de WhatsApp (workspace **Marketing**, ruta `/whatsapp`) conecta el **número de WhatsApp de la propia clínica** a Veti Suite para avisar a los tutores por el canal que ya usan. Reduce las inasistencias a citas y los refuerzos de vacuna olvidados, sin que la recepción tenga que escribir mensaje por mensaje.

> **Solo mensajes utility.** En esta fase la plataforma envía únicamente avisos sobre un hecho concreto del cliente: **recordatorios de citas** y **vacunas próximas a vencer**. No se envían promociones, campañas ni saludos de cumpleaños (Meta los considera marketing, con otras reglas y otra tarifa).

---

## 2. Usuarios y Roles
- **Administrador / Recepción**: conecta o desconecta el número, revisa la analítica y el estado de las plantillas.
- **Tutor de la mascota**: recibe el aviso en su WhatsApp desde el número oficial de la clínica y puede responder por la misma conversación.

---

## 3. Flujo Operativo

```text
[Conectar WhatsApp] ➔ [Popup de Meta: número propio (con coexistencia) o nuevo] ➔ [Plantillas utility creadas y enviadas a revisión]
                                                                                              │
                                                                                              ▼
[Cita / vacuna requiere aviso] ➔ [Mensaje en cola] ➔ [Tarea en segundo plano lo envía por la API oficial] ➔ [Enviado ➔ Entregado ➔ Leído]
                                                                                              │
                                                                                              ▼
                                                              [Analítica: enviados, entregados, leídos, fallidos y recibidos]
```

---

## 4. Funcionalidades Clave
- **Conexión guiada con Meta (Embedded Signup)**: la clínica conserva su número y puede seguir usando la app de WhatsApp Business (coexistencia), o registrar un número nuevo. La facturación de los mensajes la hace Meta directamente a la clínica.
- **Analítica**: enviados, entregados (% de los enviados), leídos, recibidos y fallidos en los últimos 7, 14 o 30 días, con gráfico diario. De cada mensaje solo se guarda quién, cuándo y su estado; nunca el contenido.
- **Plantillas**: estado de revisión de Meta y categoría vigente. Si Meta recategoriza una plantilla a marketing, deja de enviarse y la pantalla lo avisa.
- **Últimos mensajes**: historial reciente con el motivo de los fallos (por ejemplo, número que no usa WhatsApp).

---

## 5. Reglas de Negocio e Interconexiones
- **Consentimiento**: la clínica confirma al conectar que sus clientes aceptaron recibir avisos por WhatsApp.
- **Teléfono internacional**: el cliente debe tener su teléfono con código de país (`+593…`) para recibir mensajes.
- **Una clínica, un número**: para cambiar de número hay que desconectar el actual.
- **Integración con Clientes y Pacientes / Citas**: los avisos toman el nombre del tutor, la mascota y la clínica de la ficha; el historial se vincula al cliente.
- **Reconexión**: si Meta revoca el acceso, la conexión pasa a "Reconexión necesaria" y los envíos se detienen hasta volver a conectar.
