# Módulo 08: Facturación

## 1. Propósito y Valor
El módulo de Facturación realiza el cierre comercial y económico de la atención veterinaria. Liquida en un comprobante único todos los servicios de la visita (consultas, cirugías, estética, exámenes e insumos), incorpora saldos adeudados de visitas pasadas, calcula impuestos y descuentos de forma transparente y emite una factura inalterable, garantizando que el dinero recaudado coincida con los servicios efectivamente prestados.

---

## 2. Usuarios y Roles
- **Recepción / Cajero**: Revisa la bandeja de cobro, aplica descuentos si corresponde, selecciona el medio de pago y emite la factura final.
- **Administrador de Clínica**: Supervisa las facturas generadas en la jornada y audita los métodos de pago ingresados.

---

## 3. Flujo Operativo

```text
[Bandeja de Cobro: Visita con 100% de Servicios Terminados]
                             │
                             ▼
[Paso a Liquidación: Visualización de Desglose en Vivo]
(Subtotal Servicios + Deuda Anterior del Cliente)
                             │
                             ▼
[Ajustes Comerciales: Descuento % Opcional + Cálculo de IVA]
                             │
                             ▼
[Selección de Medio de Pago: Efectivo / Tarjeta / Transferencia]
                             │
                             ▼
[Emisión de Factura Numerada e Inmutable]
                             │
       ┌─────────────────────┴─────────────────────┐
       ▼                                           ▼
[Cierre Definitivo de Visita]              [Saldo de Deuda Previa]
```

---

## 4. Funcionalidades Clave
- **Bandeja de trabajo de cobro (Worklist)**: Panel de control que separa las visitas listas para liquidar de aquellas que aún tienen servicios en proceso.
- **Cobro unificado multi-servicio**: Agrupa todos los conceptos de la atención (clínicos, estéticos y medicamentos) en un único documento de salida.
- **Arrastre automático de cartera (Deuda previa)**: Si el cliente posee saldos deudores anteriores, se agregan de manera visible y automática al total a pagar.
- **Calculadora fiscal en vivo**: Aplicación de descuentos comerciales (0 a 100%) y desglose inmediato de base imponible e IVA configurable.
- **Multi-método de recaudación**: Registro del medio de pago utilizado (efectivo, tarjeta de débito/crédito o transferencia bancaria).
- **Historial de facturas emitidas**: Consulta de los comprobantes emitidos en el día con detalle por ítem, hora de pago y monto cobrado.

---

## 5. Reglas de Negocio e Interconexiones
- **Bloqueo absoluto por servicios pendientes**: Ningún recepcionista puede emitir una factura si la visita posee servicios médicos o de estética no finalizados.
- **Inmutabilidad del comprobante**: Una vez generada la factura, no puede editarse retrospectivamente; protege la transparencia contable y fiscal.
- **Cancelación automática de deuda**: Al emitirse la factura con el total liquidado, la deuda previa que figuraba en la ficha del cliente se extingue automáticamente.
- **Conexión con Finanzas**: Cada factura emitida alimenta al instante el módulo de finanzas para el arqueo de caja y el análisis de ingresos por área.
