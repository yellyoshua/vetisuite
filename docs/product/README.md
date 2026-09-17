# VetiSuite — Documentación de Producto

Este directorio centraliza toda la visión de negocio, funcionalidad y arquitectura funcional de **VetiSuite**. No contiene detalles de código, dependencias ni infraestructura técnica: su objetivo es servir como referencia clara de cómo funciona el negocio, qué necesidades resuelve y qué puede hacer cada módulo del sistema.

---

## 🗺️ Mapa de Navegación de Producto

### Fundamentos del Negocio
1. [**00. Visión General del Producto**](./00-overview.md): Misión, propuesta de valor central y filosofía de simplicidad operativa.
2. [**01. Modelo de Negocio SaaS**](./01-business-model.md): Esquema de precios modular y por consumo (plan base + activación de módulos a la carta).
3. [**02. Roles y Usuarios del Sistema**](./02-user-roles.md): Quién utiliza la plataforma, perfiles de trabajo y matriz de permisos.
4. [**03. Mercado y Oportunidades**](./03-market-and-opportunities.md): Análisis competitivo (benchmarking vs. OkVet), ventajas diferenciales y catálogo de oportunidades de crecimiento.

---

### Módulos Funcionales (`modules/`)
Cada módulo cuenta con un documento individual e independiente organizado bajo el estándar de 5 secciones con flujos con flechas:

| # | Módulo | Propósito Central | Enlace |
|---|--------|-------------------|--------|
| 01 | **Dashboard** | Visibilidad del pulso clínico, operativo y económico del día en una sola vista. | [Ver Documento](./modules/01-dashboard.md) |
| 02 | **Clientes y Pacientes** | Directorio unificado de dueños y mascotas con alertas clínicas visibles en todo el sistema. | [Ver Documento](./modules/02-clientes-y-pacientes.md) |
| 03 | **Citas y Agenda** | Matriz médico × horario para agendar sin sobrecupo ni errores de solapamiento. | [Ver Documento](./modules/03-citas-y-agenda.md) |
| 04 | **Visitas y Consultas** | Contenedor transversal de la atención: agrupa servicios hasta el cobro unificado. | [Ver Documento](./modules/04-visitas-y-consultas.md) |
| 05 | **Peluquería y Estética** | Kanban operativo con cronómetro, control de pertenencias y alerta de seguridad animal. | [Ver Documento](./modules/05-peluqueria-y-estetica.md) |
| 06 | **Clínica y Laboratorio** | Expediente médico inmutable, órdenes de examen y recetas digitales. | [Ver Documento](./modules/06-clinica-y-laboratorio.md) |
| 07 | **Inventario** | Control de existencias, alerta de stock bajo y aviso de caducidades críticas. | [Ver Documento](./modules/07-inventario.md) |
| 08 | **Facturación** | Liquidación de la visita en un solo comprobante con arrastre de deuda previa e IVA. | [Ver Documento](./modules/08-facturacion.md) |
| 09 | **Finanzas** | Cierre de caja, rentabilidad real de la jornada y distribución de ingresos por servicio. | [Ver Documento](./modules/09-finanzas.md) |
| 10 | **Portales** | Páginas públicas de reserva online y captura de leads/campañas para la clínica. | [Ver Documento](./modules/10-portales.md) |

---

## 📌 Principios de Diseño de Producto
- **Cero fugas operativas**: Cada acción médica o de estética que consume tiempo o insumos se integra de inmediato a la visita del cliente para garantizar su cobro.
- **Historial clínico inmutable**: Los expedientes médicos, recetas y comprobantes de facturación no se editan retrospectivamente para asegurar trazabilidad ética y legal.
- **Simplicidad ante todo**: Interfaces sin sobrecarga de opciones; flujos directos diseñados para operar rápidamente en el mostrador o en el consultorio veterinario.
