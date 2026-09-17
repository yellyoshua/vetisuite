# Módulo 03: Citas y Agenda

## 1. Propósito y Valor
La Agenda de Citas coordina la atención médica programada de la clínica veterinaria. A través de una matriz visual que cruza médicos veterinarios y horarios disponibles, elimina las dobles reservas, optimiza la ocupación de los consultorios y asegura que solo se agenden turnos dentro de las reglas de disponibilidad configuradas por la clínica.

---

## 2. Usuarios y Roles
- **Recepción**: Administra el calendario diario, agenda turnos presenciales o telefónicos y confirma citas.
- **Veterinario**: Consulta su carga de trabajo del día y las razones de visita de cada paciente asignado.
- **Administrador**: Configura los días y horarios de apertura de la clínica, la duración estándar de los turnos y excepciones por días feriados.
- **Propietario de Mascota**: Reserva turnos de manera remota a través de los Portales Públicos.

---

## 3. Flujo Operativo

```text
[Selección de Hueco Libre en Matriz Médico × Hora]
                       │
                       ▼
[Búsqueda de Dueño + Selección de Mascota + Motivo]
                       │
                       ▼
         [Validación Automática de Disponibilidad]
                       │
                       ▼
             [Cita Agendada (Pendiente)]
                       │
                       ▼
           [Confirmación Previa con el Dueño]
                       │
                       ▼
     [Llegada del Paciente ➔ Iniciar Visita / Consulta]
```

---

## 4. Funcionalidades Clave
- **Matriz visual interactiva**: Vista del día organizada con una columna por profesional veterinario y filas por bloques de horario.
- **Validación anti-solapamiento**: Bloqueo automático inmediato si se intenta agendar en un horario ocupado por el mismo médico o fuera del horario de atención.
- **Gestión del ciclo de vida de la cita**: Transición clara entre estados (`Pendiente` ➔ `Confirmada` ➔ `Completada` al iniciar visita ➔ `Cancelada`).
- **Reprogramación ágil**: Cambio de profesional, fecha u horario con validación de choques en tiempo real.
- **Configuración central de disponibilidad**:
  - Definición de días hábiles y turnos partidos (ej. mañana y tarde).
  - Configuración de duración por turno y tiempos de margen (buffers) entre consultas.
  - Gestión de excepciones por fechas específicas (días festivos o cierres extraordinarios).

---

## 5. Reglas de Negocio e Interconexiones
- **Cancelación sin borrado**: Las citas canceladas liberan el espacio en la matriz horaria para nuevas reservas, pero se conservan como registro histórico para auditoría.
- **Conexión con Visitas**: Al iniciar la atención desde el detalle de la cita, esta se marca como `Completada` y se genera de forma inmediata la *Visita* del cliente para el seguimiento operativo y cobro.
- **Conexión con Portales**: La disponibilidad configurada en este módulo rige las opciones que se ofrecen a los propietarios en las reservas web externas.
