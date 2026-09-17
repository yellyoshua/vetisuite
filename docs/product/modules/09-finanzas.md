# Módulo 09: Finanzas

## 1. Propósito y Valor
El módulo de Finanzas brinda una lectura económica clara y en tiempo real de la jornada veterinaria. Permite a la dirección de la clínica responder con certeza cuánto dinero ingresó hoy, cuál fue el margen de ganancia real, qué área operativa aporta más valor (medicina, peluquería o laboratorio) y cuánto dinero exacto debe haber en caja física para el arqueo de cierre, evitando cierres a ciegas.

---

## 2. Usuarios y Roles
- **Administrador / Dueño de Clínica**: Revisa el desempeño económico, evalúa márgenes de rentabilidad y toma decisiones comerciales sobre áreas de servicio.
- **Recepción / Encargado de Caja**: Utiliza el arqueo por método de pago para conciliar el dinero en efectivo al final de su turno.

---

## 3. Flujo Operativo

```text
[Emisión Continua de Facturas en Recepción]
                     │
                     ▼
[Consolidación Automática en Finanzas (Solo Lectura)]
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
[Indicadores]    [Ingresos por Área]  [Arqueo de Caja]
(Ventas, Margen, (Clínica, Peluquería (Efectivo, Tarjeta,
 IVA, Por cobrar) y Laboratorio %)     Transferencia)
                     │
                     ▼
[Cierre de Caja Diario sin Fugas ni Cuadres a Ciegas]
```

---

## 4. Funcionalidades Clave
- **Cuatro indicadores clave del día**:
  - *Ingresos facturados*: Total recaudado y número de comprobantes emitidos en la jornada.
  - *Utilidad y margen operativo*: Rendimiento neto porcentual del negocio sobre los ingresos del día.
  - *Recaudación tributaria*: Monto de impuestos (IVA) recaudados y su porcentaje sobre la venta bruta.
  - *Cartera por cobrar*: Total de dinero pendiente que incluye las deudas vigentes de clientes más el valor estimado de las visitas actualmente abiertas en piso.
- **Desglose de ingresos por área de servicio**: Gráfica y tabla comparativa que ordena de mayor a menor la recaudación proveniente de consultas clínicas, peluquería/estética y pruebas de laboratorio.
- **Arqueo y conciliación por medio de pago**: Clasificación exacta del total ingresado por efectivo, tarjetas bancarias y transferencias electrónicas, facilitando el recuento físico de billetes al cierre del turno.

---

## 5. Reglas de Negocio e Interconexiones
- **Transparencia financiera (Solo lectura)**: El módulo de Finanzas no permite la carga manual de cobros ni la eliminación arbitraria de movimientos; toda métrica proviene estrictamente de las facturas reales emitidas en el módulo de Facturación.
- **Conexión con Visitas**: El indicador de "cartera por cobrar" rastrea en tiempo real el valor de los servicios acumulados en visitas abiertas que aún no han pasado por caja.
- **Conexión con el Dashboard**: Los totales consolidados de facturación alimentan el panel de inicio para consulta rápida.
