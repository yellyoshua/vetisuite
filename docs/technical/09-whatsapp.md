# 09. Integración con WhatsApp Business (Meta)

Submódulo **WhatsApp** del workspace **Marketing** (`/whatsapp` en el panel). Integración oficial con la
WhatsApp Business Platform (Cloud API) de Meta, pensada como plugin: cada clínica conecta **su propio
número** y los mensajes salen desde ahí.

> **Alcance de la fase 1: solo mensajes _utility_** (recordatorios de citas y de vacunas). No hay promociones,
> campañas ni saludos de cumpleaños. Se impone en tres capas (ver [§6](#6-solo-utility-cómo-se-impone)).

Investigado contra la documentación oficial de Meta el 2026-10-05 (Graph API **v26.0**). Lo que no pudo
confirmarse en una página oficial está marcado como **[sin verificar]** y listado en [§9](#9-pendientes-de-verificar).

---

## 1. Decisión: modelo de proveedor

| Opción | Qué es | Veredicto |
|---|---|---|
| **Tech Provider + Embedded Signup** | Tu LLC es una app de Meta verificada que onboardea a cada clínica con un flujo guiado. Cada clínica tiene su propia WABA y **Meta le cobra directo** con su método de pago. | **Elegida** |
| Cuenta directa con una sola WABA | Un único número y WABA para toda la plataforma. | Descartada: rompe el multi-tenant (el número, la calidad y la facturación serían de todos). |
| Solution Partner / BSP | Tiene línea de crédito de Meta y puede facturar el consumo. Programa selectivo. | Descartada hoy: no es realista para una LLC pequeña; los requisitos no son públicos. Se puede pedir el upgrade más adelante. |
| BSP de terceros (Twilio, 360dialog…) | Intermediario con su propia API. | Descartada: sobrecosto e intermediario. Queda como plan B si la verificación de Meta se estanca. |

**Por qué Tech Provider**: es el único modelo oficial que permite que cada clínica use **su número** con la menor
fricción (un popup de Meta, sin llaves ni consolas), sin que la LLC tenga que ser Solution Partner. Contra: la LLC
**no puede revender ni facturar el consumo** de Meta (no tiene línea de crédito); cualquier margen tendría que ser
una tarifa de software aparte **[sin verificar]**.

### Número propio de la clínica

- **Coexistencia** (recomendada): la clínica sigue usando la **app de WhatsApp Business** en su teléfono y a la vez
  el número queda conectado a la API. Requiere la app v2.24.17 o superior. Límites oficiales: throughput fijo de
  20 mensajes/s, sin grupos, mensajes temporales, ver una vez, ubicación en vivo ni llamadas desde la API. El
  historial (180 días) se sincroniza una sola vez en las 24 h posteriores. Si la app queda sin abrirse ~14 días,
  Meta desconecta el número (`PRIMARY_INACTIVITY`).
- **Migración clásica**: el número se borra de WhatsApp/WhatsApp Business y pasa solo a la API (se pierde el uso
  de la app y el historial; la clínica debe respaldarlo).
- **Número nuevo**: sirve cualquier número que reciba SMS o llamada de voz (incluido fijo, verificado por voz).

La elección entre las tres la hace la clínica dentro del popup de Meta. La disponibilidad de coexistencia por país
se valida por número durante el alta **[sin verificar la lista oficial]**.

### Pasos para la LLC (una vez)

1. Crear el *business portfolio* de Meta y completar la **verificación del negocio** de la LLC (documentos legales + sitio web).
2. Crear la app de Meta con el caso de uso de WhatsApp y una configuración de **Facebook Login for Business** para Embedded Signup (v4: v2 y v3 se retiran el 2026-10-15).
3. Suscribir el webhook de la app a `messages`, `message_template_status_update`, `template_category_update`, `account_update`, `smb_message_echoes` (y `history`, `smb_app_state_sync` si se sincroniza el historial) con URL `https://api.<dominio>/api/webhooks/whatsapp`.
4. **App Review**: acceso avanzado a `whatsapp_business_management` y `whatsapp_business_messaging` (ícono, política de privacidad, categoría y dos videos: envío/recepción y creación de plantillas).
5. Completar la *access verification* si el panel de Meta la pide (aparece solo en fuentes de terceros: tope de ~200 clientes nuevos por 7 días **[sin verificar]**).

### Pasos por clínica (autoservicio)

1. Tener (o crear en el flujo) su portfolio de Meta.
2. En `/whatsapp` pulsar **Conectar WhatsApp**, aceptar las condiciones y completar el popup de Meta (elegir número / coexistencia).
3. **Agregar un método de pago** a su WABA en Meta Business Suite (Meta cobra a la clínica directamente).
4. Esperar la aprobación de las plantillas (hasta ~24 h). Se crean solas al conectar.
5. Opcional: verificar su negocio en Meta para subir el límite de 250 destinatarios únicos/24 h.

---

## 2. ¿Se puede sacar analítica de la API oficial?

| Métrica | ¿API oficial? | Cómo se resuelve aquí |
|---|---|---|
| Mensajes **enviados** y **entregados** | **Sí**: `GET /{waba_id}?fields=analytics.start().end().granularity(DAY)` → `data_points[{sent, delivered}]`. Retención de 1 año. | Se guardan además por mensaje (el webhook de estados). |
| **Leídos** | Parcial: `template_analytics` (por plantilla, hasta 90 días, los datos de lectura solo 7 días tras el envío, requiere `is_enabled_for_insights`, no disponible en la UE/Japón). | Estado `read` del webhook. |
| Costo / volumen por categoría | **Sí**: `pricing_analytics` (VOLUME/COST, por categoría y tipo). El costo no se devuelve si factura un Solution Partner. | Fuera de la fase 1. Cada clínica lo ve en Meta Business Suite. |
| Mensajes **recibidos** | **No hay endpoint de conteo.** `analytics` acepta `product_types([100])` ("mensajes entrantes") pero no se pudo confirmar que devuelva cifras utilizables **[sin verificar]**. | Se cuentan desde el webhook `messages` (solo metadatos: quién y cuándo, **nunca el contenido**). |
| Mensajes escritos desde la **app** (coexistencia) | La documentación no aclara si `analytics` los incluye **[sin verificar]**. | Llegan por el webhook `smb_message_echoes` y se muestran aparte ("desde la app"). |

**Decisión**: la pantalla se alimenta del **registro propio** (`whatsapp_messages`), alimentado por la cola y por
los webhooks. Es la única fuente que cubre *enviados, entregados, leídos, fallidos y recibidos* con la misma
ventana de tiempo, y no depende de la retención de Meta. `analytics` / `pricing_analytics` quedan como cruce
posible para una fase 2 (no se implementó: código sin consumidor).

---

## 3. Arquitectura

```
Panel /whatsapp ──► api/whatsapp-*.js ──► modules/whatsapp-*/ ──► @vetisuite/database
                          │                                            ▲
                          │ events.whatsappUtilityMessage.publish      │
                          ▼                                            │
                 SQS vetisuite-<env>-cloudtask-whatsapp-utility-message│
                          │                                            │
                          ▼                                            │
             cloudtasks/whatsapp-utility-message ──► @vetisuite/whatsapp ──► Graph API
                                                                       ▲
Meta ──► POST /api/webhooks/whatsapp (firma HMAC) ──► estados, entrantes, plantillas
```

### `packages/whatsapp` (`@vetisuite/whatsapp`)

Librería única para `server/` y `cloudtasks/`. Solo expone métodos (ningún tipo):

| Método | Para qué |
|---|---|
| `connectAccount({code, wabaId, phoneNumberId?})` | Cierra el Embedded Signup: canjea el code (30 s), suscribe la WABA al webhook, resuelve el número si el evento no lo trae y lo registra si Meta no lo dejó conectado. Devuelve el token **ya cifrado**. |
| `syncUtilityTemplates({wabaId, encryptedAccessToken, templates})` | Crea en la WABA de la clínica las plantillas que faltan, **siempre como `UTILITY`**, e informa la categoría/estado reales. Idempotente. |
| `sendUtilityTemplate({…, to, template, language, parameters})` | **Única vía de salida**: no existe envío de texto libre. |
| `disconnectAccount({wabaId, encryptedAccessToken})` | Cancela la suscripción del webhook. |
| `describeError(error)` | `{code, message, isRetryable, requiresReauth}` a partir de un error de Meta o de red. |
| `verifyWebhookSignature({rawBody, signature})` | HMAC-SHA256 con el App Secret (`X-Hub-Signature-256`), comparación en tiempo constante. |
| `parseWebhook(payload)` | Normaliza el POST de Meta (estados, entrantes, ecos, plantillas, desconexión). |

Los tokens de cada clínica se guardan **cifrados (AES-256-GCM)** y el paquete es el único que los descifra: ni el
server ni la task manejan el token en claro.

### Cloud Task `whatsapp-utility-message`

Cola SQS `vetisuite-<APP_ENV>-cloudtask-whatsapp-utility-message` (+ DLQ, 3 reintentos). El server inserta la fila
`whatsapp_messages` en `queued` y publica `{organization, message, to, template, language, parameters}`; la task:

1. Ignora el mensaje si ya no está `queued` (SQS entrega al menos una vez).
2. Busca la cuenta **activa** de la organización y envía con `sendUtilityTemplate`.
3. Éxito → `sent` + `wamid`. Error **transitorio** (límite de throughput, 5xx, red) → relanza y SQS reintenta.
   Error **permanente** → `failed` con el código de Meta, sin reintento. Token vencido (190/401) → además marca la
   cuenta `reauth_required`.

Limitación conocida: si Meta acepta el mensaje y la base falla justo después, el reintento reenvía (duplicado).
Meta no ofrece clave de idempotencia. Un mensaje cuyo reintento se agota va a la DLQ y queda `queued`; la
analítica lo muestra como "en cola".

Envío: `POST /api/whatsapp-messages` `{client, template, variables}` (módulo `whatsapp-messages`). El server completa
`client_name` y `clinic_name`, exige cuenta activa, plantilla **aprobada y categoría `utility`**, cliente de la
organización con teléfono en formato internacional.

### Webhook `api/webhooks/whatsapp`

Público (prefijo `webhooks/`), autenticado por la **firma HMAC** del cuerpo crudo. GET = handshake (`hub.verify_token`).
POST procesa en línea y es idempotente: los estados solo **avanzan** (`queued→sent→delivered→read`), los entrantes se
insertan con `ON CONFLICT DO NOTHING` sobre el `wamid`, y si falla responde 500 para que Meta reintente (hasta 7 días,
sin orden garantizado). Los webhooks de plantillas y de cuenta **no admiten URL por WABA**: siempre llegan a la URL de
la app, por eso se enrutan por `entry.id` (waba) o `metadata.phone_number_id`.

### Datos (`packages/database`)

| Tabla | Contenido |
|---|---|
| `whatsapp_accounts` | Una por organización: `waba_id`, `phone_number_id`, número y nombre verificado, **token cifrado**, `status` (`active` / `reauth_required`), `consent_accepted_at`. |
| `whatsapp_templates` | Plantillas de la clínica con la categoría y el estado **que reporta Meta** (puede recategorizar a marketing). |
| `whatsapp_messages` | Un registro por mensaje (enviado, recibido o eco de la app): dirección, estado, `wamid`, teléfono, plantilla, error, facturable. **Sin contenido.** |

### API del server

| Ruta | Módulo (pkit) | Uso |
|---|---|---|
| `GET /api/whatsapp-account` | `whatsapp-account` | Estado de la conexión (sin token). |
| `POST` / `DELETE /api/whatsapp-connection` | `whatsapp-connection` | Conectar / desconectar. |
| `GET` / `POST /api/whatsapp-templates` | `whatsapp-templates` | Listar / sincronizar plantillas. |
| `GET /api/whatsapp-analytics?days=7\|14\|30` | `whatsapp-analytics` | Totales y serie diaria. |
| `GET` / `POST /api/whatsapp-messages` | `whatsapp-messages` | Historial / encolar un mensaje utility. |
| `GET` / `POST /api/webhooks/whatsapp` | — (público) | Webhook de Meta. |

Permisos: `owner` y `employee` (delta `011-attach-whatsapp-permissions`). Hoy conectar/desconectar lo puede hacer
cualquier usuario con el módulo `whatsapp-connection`; si se quiere restringir a dueños, se quita el identificador
de los empleados.

---

## 4. Variables de entorno

| Variable | Dónde | Descripción |
|---|---|---|
| `WHATSAPP_APP_ID`, `WHATSAPP_APP_SECRET` | server, cloudtask | App de Meta (canje del code y firma del webhook). |
| `WHATSAPP_TOKEN_ENCRYPTION_KEY` | server, cloudtask | 32 bytes en base64 (`openssl rand -base64 32`). **Perderla invalida todos los tokens.** |
| `WHATSAPP_VERIFY_TOKEN` | server | Secreto del handshake del webhook. |
| `WHATSAPP_GRAPH_VERSION` | opcional | Por defecto `v26.0`. |
| `VETISUITE_META_APP_ID`, `VETISUITE_WHATSAPP_CONFIG_ID` | client | App y configuración de Embedded Signup (públicos). |

Los valores de `.env.local` son de desarrollo; en la nube se cargan en la consola de la Lambda.

## 5. Local

`bun run dev:setup` crea la cola; `bun run dev:cloudtasks` consume las colas declaradas en `cloudtasks/app.ts`.
Embedded Signup y el webhook solo funcionan contra una app real de Meta (el webhook necesita una URL pública, p. ej. un túnel).
En la nube hay que **crear la cola y su DLQ** (`infrastructure/server/bootstrap.sh` ya las incluye; en entornos existentes
crearlas a mano con el mismo nombre) y desplegar la task como Lambda con trigger SQS (el repo todavía no tiene deploy de cloudtasks).

## 6. Solo utility: cómo se impone

1. **Catálogo cerrado** (`server/constants/whatsapp-templates.js`): solo recordatorio de cita y vacuna próxima a vencer, con texto fijo y variables acotadas (una línea, sin saltos). No hay texto libre.
2. **El paquete no tiene envío libre** y crea las plantillas como `UTILITY`.
3. **Se envía solo lo que Meta aprobó como utility**: si Meta recategoriza una plantilla a marketing (aviso 1 día antes por webhook `template_category_update`), el envío se bloquea y la UI lo indica.

**Cumpleaños**: Meta lo clasifica como **marketing** ("relationship building"), no utility; se factura siempre y
exige consentimiento de marketing. Por eso **no está en el catálogo**. Si se quiere en una fase posterior hay que
tratarlo como marketing de forma explícita. Riesgo parecido, menor, en **vacuna próxima a vencer**: Meta no la
nombra como utility; redactarla informativa (sin ofertas ni invitaciones a agendar) y estar atentos a la recategorización.

## 7. Consentimiento (opt-in)

Meta exige opt-in antes de escribir: debe nombrar a la clínica y el tipo de mensajes. En la fase 1 la clínica lo
asume al conectar (diálogo de aceptación → `consent_accepted_at`). **Pendiente**: guardar el consentimiento por
cliente (fecha, canal, texto) y bloquear el envío sin él.

## 8. Costos

Facturación por mensaje desde 2025-07-01, a la **clínica** y no a la LLC. Utility fuera de la ventana de 24 h se cobra;
dentro de la ventana era gratis, pero **desde 2026-10-01 Meta cobra también esos** (tarifas publicadas por Meta; no
verificadas aquí). Hay tiers de volumen para utility. Una clínica nueva sin verificar puede escribir a 250
destinatarios únicos/24 h.

## 9. Pendientes de verificar

- Parámetros exactos del canje del code (`redirect_uri`) y expiración del token de negocio.
- Configuración de **coexistencia** en Embedded Signup v4 (no se encontró `featureType` en la implementación oficial; el flujo lo define la configuración de Facebook Login for Business) y si el evento trae `phone_number_id` (por eso el paquete lo resuelve si falta).
- Forma exacta del payload `smb_message_echoes`.
- Si `analytics` con `product_types([100])` devuelve mensajes entrantes y si cuenta mensajes de la app.
- Clasificación de "vacuna próxima a vencer" como utility.
- Detalles de `deregister` y `debug_token` en la documentación de WhatsApp.
