# 03. Mercado y Oportunidades

## 1. Análisis del Entorno Competitivo (Benchmarking)
El software veterinario tradicional en Latinoamérica y España (analizado a través de referentes como OkVet y soluciones locales de escritorio) suele adolecer de los mismos defectos:
- **Sobrecarga de configuración**: Sistemas que requieren semanas de parametrización (múltiples catálogos obligatorios antes de poder atender al primer paciente).
- **Métricas de vanidad**: Cuadros de mando que miden únicamente facturación bruta o volumen de altas, sin alertar sobre rentabilidad real, productos por vencer o deudas por cobrar.
- **Planes comerciales rígidos**: Obligan a la clínica a contratar planes costosos para acceder a funcionalidades básicas, o bloquean módulos completos sin opción de prueba flexible.

---

## 2. Matriz Comparativa: OkVet vs. VetiSuite

| Dimensión | OkVet (Referente de Mercado) | VetiSuite (Propuesta Diferencial) |
|---|---|---|
| **Modelo Comercial** | Planes cerrados por niveles. Módulos clave bloqueados tras barreras de pago costosas. | **Modular y por consumo**: Base económica + activación a la carta de lo que la clínica necesita. |
| **Enfoque del Dashboard** | Métricas de volumen (número de registros, rating de vanidad). | **Pulso operativo y financiero**: Citas del día, alertas de caducidad (<60d), stock bajo y deudas activas. |
| **Gestión de la Atención** | Cobro atomizado y disperso por cada servicio. Frecuente olvido de cargos menores. | **Concepto de "Visita" unificada**: Todo servicio médico, de estética o laboratorio confluye en una sola cuenta. |
| **Puesta en Marcha** | Lenta y compleja (8 pestañas administrativas y 8 catálogos clínicos previos). | **Inmediata**: Diseñado para comenzar a operar en minutos con catálogos estándar y búsqueda rápida. |
| **Peluquería / Grooming** | Tratado como un servicio más en la agenda clínica. | **Kanban operativo dedicado**: Cronómetro en vivo, custodia de pertenencias y alerta de manejo animal. |
| **Presencia Digital** | Formularios genéricos o dependientes de landing externa. | **Portales autoadministrables**: Páginas con slug propio, reserva directa y campañas de captación. |

---

## 3. Catálogo de Oportunidades y Nuevas Funcionalidades (Roadmap)

A partir de las necesidades no resueltas en el sector veterinario, se identifican las siguientes líneas estratégicas de evolución para VetiSuite:

```text
[VetiSuite Base Hoy]
         │
         ├──➔ [1. Automatización WhatsApp / SMS]
         │       (Avisos de citas, retiro tras baño, recordatorio de vacunas)
         │
         ├──➔ [2. Planes de Salud Preventivos]
         │       (Cobro recurrente mensual para dueños de mascotas)
         │
         ├──➔ [3. Pagos Integrados y Pasarela QR]
         │       (Cobro desde el mostrador sin digitar montos en datáfono)
         │
         └──➔ [4. Multi-sede Centralizada]
                 (Gestión de cadenas de clínicas con historial compartido)
```

### Oportunidad 1: Automatización de Mensajería (WhatsApp / SMS)
- **Necesidad**: Las cancelaciones de última hora y las llamadas reiteradas de dueños preguntando *"¿ya está lista mi mascota del baño?"* congestionan la recepción.
- **Solución de Producto**: Integrar notificaciones automáticas al cambiar de estado en la agenda (*"Tu cita está confirmada para hoy a las 16:00"*) y al marcar un servicio de peluquería como terminado (*"Luna ya terminó su baño y corte, puedes pasar a retirarla"*).

### Oportunidad 2: Planes de Salud Animal (Suscripciones Recurrentes)
- **Necesidad**: Los ingresos de la clínica son volátiles y dependen de emergencias. Los dueños posponen visitas preventivas por costo.
- **Solución de Producto**: Módulo de planes de suscripción mensual (ej. "Plan Cachorro Seguro": vacunas del año, desparasitación trimestral y 2 baños al mes por una cuota fija automática). Aumenta los ingresos recurrentes (MRR) de la clínica.

### Oportunidad 3: Pagos Integrados y QR en Mostrador
- **Necesidad**: Discrepancias entre lo liquidado en el sistema y lo cobrado en el terminal bancario físico.
- **Solución de Producto**: Integración con pasarelas de cobro y terminales inteligentes para disparar el monto exacto al datáfono o generar un código QR dinámico en pantalla, cerrando la factura de manera automática al confirmarse el pago.

### Oportunidad 4: Red Multi-sede y Franquicias
- **Necesidad**: Cadenas veterinarias que atienden al mismo paciente en distintas sucursales y necesitan un expediente médico unificado y control de inventario entre bodegas.
- **Solución de Producto**: Soporte multi-sucursal con permisos segregados por sede y consulta centralizada del expediente médico del paciente.
