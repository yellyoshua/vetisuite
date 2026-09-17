# Módulo 01: Dashboard

## 1. Propósito y Valor
El Dashboard es la pantalla de apertura diaria de VetiSuite. Ofrece una vista consolidada de solo lectura que permite al equipo conocer en segundos qué hay agendado, qué servicios están en curso, qué insumos críticos están por agotarse o vencer, y cuánto se ha facturado en la jornada, eliminando la necesidad de navegar módulo por módulo cada mañana.

---

## 2. Usuarios y Roles
- **Administrador / Director**: Monitorea los ingresos facturados del día, la utilidad y las alertas de inventario crítico.
- **Recepción**: Revisa las citas del día, su estado de confirmación y los clientes con saldo pendiente de pago.
- **Veterinario**: Consulta rápidamente el volumen de consultas médicas agendadas para su jornada.

---

## 3. Flujo Operativo

```text
[Apertura de Jornada]
         │
         ▼
[Lectura de Indicadores Operativos] (Citas vivas, Mascotas en estética)
         │
         ▼
[Revisión de Alertas Críticas] (Stock bajo, Lotes por vencer ≤ 60d, Deudas de clientes)
         │
         ▼
[Navegación con 1 Clic al Módulo Correspondiente para Resolver]
```

---

## 4. Funcionalidades Clave
- **Cuatro tarjetas de pulso diario**: Visualización inmediata de citas agendadas, mascotas en proceso de estética, alertas de inventario y total facturado en la jornada.
- **Agenda resumida de hoy**: Lista compacta ordenada cronológicamente con hora, nombre del paciente, dueño, motivo de consulta, médico asignado y alertas de salud.
- **Alertas de inventario en riesgo**: Lista directa de los productos que cayeron por debajo de su stock mínimo o que vencen en los próximos 60 días.
- **Alertas de cartera pendiente**: Identificación rápida de clientes con deudas activas que se presentan en la clínica.
- **Navegación contextual**: Cada indicador y alerta funciona como un acceso directo al módulo respectivo para tomar acción inmediata.

---

## 5. Reglas de Negocio e Interconexiones
- **Solo lectura**: El dashboard no permite altas, modificaciones ni eliminaciones de registros; es una lente de visualización consolidada.
- **Conexión con Citas**: Lee en tiempo real las citas registradas en el módulo de Agenda para la fecha en curso.
- **Conexión con Inventario**: Se actualiza de inmediato cada vez que un insumo baja del mínimo configurado o ingresa a la ventana de caducidad.
- **Conexión con Facturación y Clientes**: Refleja la suma de comprobantes emitidos en el día y las deudas vigentes registradas en las fichas de clientes.
