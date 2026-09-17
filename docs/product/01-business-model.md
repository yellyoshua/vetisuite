# 01. Modelo de Negocio SaaS

## 1. Enfoque Comercial: Modelo Modular y por Consumo
VetiSuite opera bajo un modelo de suscripción **B2B SaaS modular con cobro por activación a la carta y consumibles**. 

A diferencia de los modelos rígidos por niveles de la competencia (donde un consultorio pequeño se ve obligado a pagar por módulos de hospitalización o estética que jamás usará), VetiSuite permite a cada clínica iniciar con un **Plan Base Operativo esencial** y activar únicamente los módulos que requiere según su oferta de servicios.

```text
┌────────────────────────────────────────────────────────┐
│               PLAN BASE OPERATIVO                      │
│  - Clientes y Pacientes (Directorio y Alertas)         │
│  - Agenda y Gestión de Citas                           │
│  - Visitas (Check-in y Contenedor de Servicios)        │
│  - Inventario Esencial                                 │
│  - Facturación Básica y Control de Saldos              │
│  - Dashboard Operativo del Día                         │
└────────────────────────────────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
[Módulos Add-on a la Carta]             [Consumibles por Uso]
 - Peluquería y Estética                 - Notificaciones SMS / WhatsApp
 - Clínica Avanzada y Laboratorio        - Almacenamiento de Imágenes / Placas
 - Portales y Campañas Públicas          - Sedes Adicionales
 - Finanzas y Reportes de Rentabilidad
```

---

## 2. Componentes de la Suscripción

### A. Plan Base Operativo (Cuota Mensual Mínima)
Es la base obligatoria para operar la clínica. Cubre la operación diaria del mostrador:
- Directorio central de dueños y pacientes con alertas visuales de salud y manejo.
- Agenda médica diaria con matriz de médicos y prevención de dobles reservas.
- Flujo de visita única para coordinar la llegada del paciente y el cobro.
- Catálogo de productos y control de stock básico.
- Liquidación de facturas con cálculo de IVA y arrastre de deudas pasadas.

### B. Catálogo de Módulos Add-On (Activación a la Carta)
La clínica enciende o apaga módulos desde su configuración según sus necesidades operativas:

| Módulo Add-On | ¿Para quién es? | Valor que aporta |
|---------------|-----------------|------------------|
| **Peluquería y Estética** | Clínicas con servicios de baño, corte y grooming. | Kanban operativo en vivo con cronómetro, control de pertenencias (collares, correas) y cargo automático a la visita. |
| **Clínica y Laboratorio** | Clínicas con consultas médicas especializadas y diagnóstico. | Expedientes médicos inmutables, registro de signos vitales, órdenes de laboratorio con carga de resultados y recetas digitales. |
| **Portales y Campañas** | Clínicas que desean captar clientes por internet. | Publicación de páginas web bajo slug propio (`clinica.vetisuite.com/p/...`) con wizard de reserva en línea y formularios para campañas (ej. vacunación masiva). |
| **Finanzas y Rentabilidad** | Administradores y directores de clínica. | Análisis de margen real de la jornada, desglose de ingresos por área operativa y conciliación por método de pago. |

### C. Servicios por Consumo (Pay-as-you-go)
Recursos variables que la clínica adquiere en paquetes prepagados según su volumen:
- **Mensajería transaccional**: Recordatorios de citas y avisos de "mascota lista para retiro" vía WhatsApp o SMS.
- **Almacenamiento clínico extendido**: Espacio en la nube para adjuntar radiografías, ecografías y fotos del tratamiento en el expediente.
- **Sedes adicionales**: Multi-sede centralizada para cadenas veterinarias que comparten dueños y pacientes.

---

## 3. Ventajas Estratégicas del Modelo
1. **Barrera de entrada ultra baja**: Un veterinario independiente con un consultorio pequeño puede adoptar VetiSuite pagando solo la base mínima.
2. **Expansión orgánica de cuenta (Expansion MRR)**: Cuando el consultorio incorpora una peluquera o un ecógrafo, activa los módulos correspondientes incrementando el ticket promedio de forma natural.
3. **Reducción drástica del Churn**: Las clínicas no sienten que pagan por características no utilizadas; el software crece al ritmo del negocio veterinario.
4. **Puesta en marcha inmediata**: Se reduce el tiempo de configuración inicial (onboarding) frente a competidores sobrecargados de opciones irrelevantes.
