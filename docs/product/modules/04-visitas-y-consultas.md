# Módulo 04: Visitas y Consultas

## 1. Propósito y Valor
El módulo de Visitas es el núcleo operativo de la clínica. Funciona como un contenedor unificado de atención por cliente: agrupa en una sola cuenta todos los servicios médicos, de peluquería, exámenes de laboratorio y medicamentos que se prestan durante la jornada (incluso para distintas mascotas del mismo dueño), impidiendo que ningún servicio quede sin cobrar al momento de la salida.

---

## 2. Usuarios y Roles
- **Recepción**: Realiza el check-in de llegada del cliente, abre la visita, añade servicios y efectúa el paso final al cobro.
- **Veterinario**: Registra o complementa servicios médicos (consultas, vacunas, fármacos aplicados).
- **Peluquero / Estilista**: Reporta el avance y finalización del servicio de estética que se refleja en la visita.
- **Personal de Laboratorio**: Completa las pruebas solicitadas que actualizan el estado del servicio en la visita.

---

## 3. Flujo Operativo

```text
[Llegada del Cliente (Check-in)]
                │
                ▼
[Apertura de Visita + Selección de Mascota(s) y Servicios en Borrador]
                │
                ▼
[Inicio de Visita: Despacho a Módulos Específicos]
   ├──➔ Tablero de Peluquería
   ├──➔ Cola de Laboratorio
   └──➔ Consulta Médica / Vacunas
                │
                ▼
[Seguimiento de Avance en Tiempo Real (Pendientes vs. Terminados)]
                │
                ▼
[100% de Servicios Terminados ➔ Habilitación para Cobro y Factura]
```

---

## 4. Funcionalidades Clave
- **Apertura de visita (Check-in general)**: Creación o reutilización de una visita abierta al llegar el dueño a la clínica.
- **Canasta de servicios multi-mascota**: Permite agregar en un solo movimiento servicios para diferentes mascotas del mismo dueño (ej. corte para la mascota A y vacuna para la mascota B).
- **Catálogo de servicios integrados**: Inclusión ágil de ítems con precios predefinidos (consultas, baños, análisis de laboratorio o desparasitaciones).
- **Despacho automático a áreas de trabajo**: Al pulsar "Comenzar", los servicios de estética viajan al kanban de peluquería y los análisis a la cola de laboratorio.
- **Monitor de avance en tiempo real**: Visualización del porcentaje de servicios completados y subtotal acumulado en vivo.
- **Compuerta de salida hacia Facturación**: Botón directo de cobro que solo se activa cuando la totalidad de los servicios han concluido.

---

## 5. Reglas de Negocio e Interconexiones
- **Una sola visita activa por cliente**: Si un cliente ya tiene una visita abierta, el sistema reutiliza la existente en lugar de duplicarla.
- **Bloqueo de cobro prematuro**: Es una regla estricta de negocio que ninguna visita puede pasar a facturación si tiene servicios pendientes o en proceso.
- **Interconexión con Peluquería y Laboratorio**: Al marcar un baño como terminado en Peluquería o subir el resultado en Laboratorio, el servicio se actualiza automáticamente en la Visita.
- **Conexión con Facturación**: Al emitir la factura, la visita cambia automáticamente a estado cerrado.
