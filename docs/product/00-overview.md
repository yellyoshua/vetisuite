# 00. Visión General del Producto

## 1. Misión y Propósito
**VetiSuite** es una plataforma de software como servicio (SaaS) diseñada para transformar la gestión de clínicas y consultorios veterinarios independientes y medianos. Su objetivo es eliminar el caos operativo derivado del uso de cuadernos de notas, chats de mensajería y hojas de cálculo desconectadas, unificando la atención médica, la estética animal, el inventario y el cobro en un flujo continuo y sin fricción.

---

## 2. El Problema de las Clínicas Veterinarias
1. **Fugas económicas no registradas**: En el día a día, los medicamentos aplicados en camilla o los servicios complementarios de estética se olvidan al momento de cobrar en recepción.
2. **Historial clínico disperso y frágil**: Fichas médicas en papel que se extravían, falta de advertencias visuales de alergias o conductas agresivas del paciente al momento de su atención.
3. **Agendas colapsadas**: Citas duplicadas por agendamiento desorganizado entre múltiples canales, ausencia de reglas de disponibilidad y tiempos muertos.
4. **Falta de visibilidad de negocio**: Los directores de clínicas desconocen cuál área es verdaderamente rentable (médica, laboratorio o peluquería) y sufren por pérdidas de stock por caducidad no advertida.

---

## 3. Propuesta de Valor de VetiSuite
VetiSuite resuelve estos problemas mediante cuatro pilares fundamentales:

- **Flujo Unificado de Atención (La "Visita")**: En lugar de cobrar servicios aislados, la clínica abre una *Visita*. Todo lo realizado por el veterinario, el laboratorio o el peluquero confluye en una única cuenta verificada antes de emitir la factura.
- **Seguridad Clínica Preventiva**: Alertas inmediatas y visibles (paciente agresivo, alergias graves) presentes en toda pantalla donde se mencione al paciente.
- **Control Automático de Insumos**: Todo medicamento o producto aplicado en una consulta médica descuenta inventario automáticamente y se añade a la cuenta del dueño en tiempo real.
- **Autonomía y Captación Digital**: Portales web de autoconsumo para que los dueños de mascotas puedan agendar en línea según las reglas de horario de la clínica y participar en campañas preventivas (como vacunación o desparasitación).

---

## 4. Mapa Conceptual del Flujo de Pacientes

```text
[Llegada / Reserva Portal] ➔ [Check-in / Apertura de Visita]
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
    [Consulta Médica & Lab]   [Peluquería / Baño]     [Venta / Insumos]
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
                                      ▼
                      [Validación de Servicios Listos]
                                      │
                                      ▼
                      [Cobro Unificado & Facturación]
                                      │
                                      ▼
                      [Arqueo en Finanzas & Dashboard]
```

---

## 5. Principios de Producto
1. **Velocidad de mostrador**: Toda acción común (buscar un cliente, añadir un paciente, agendar una cita o abrir una visita) debe poder completarse en menos de tres clics.
2. **Datos inmutables**: El historial médico y las facturas emitidas no pueden alterarse retrospectivamente para resguardar la validez ética, legal y tributaria de la clínica.
3. **Claridad sobre volumen**: VetiSuite prioriza métricas útiles de rentabilidad, stock en riesgo y saldos pendientes por cobrar por sobre métricas de vanidad.
