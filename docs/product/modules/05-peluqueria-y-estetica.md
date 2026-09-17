# Módulo 05: Peluquería y Estética

## 1. Propósito y Valor
El módulo de Peluquería y Estética organiza el área de baño, corte y grooming de la clínica veterinaria. Mediante un tablero kanban operativo en tiempo real, permite al personal de estética coordinar el flujo de mascotas, controlar tiempos de atención con cronómetro, custodiar las pertenencias que deja el dueño y asegurar que el costo del servicio se sume automáticamente a la cuenta del cliente.

---

## 2. Usuarios y Roles
- **Peluquero / Estilista**: Gestiona los pacientes en el tablero, inicia cronómetros y marca servicios como finalizados o entregados.
- **Recepción**: Realiza el check-in de estética, registra pertenencias y cobra el servicio al egreso.

---

## 3. Flujo Operativo

```text
[Llegada del Paciente / Check-in de Estética]
                        │
                        ▼
[Registro de Pertenencias (Collar, Correa, Transportín) + Asignación de Estilista]
                        │
                        ▼
             [Tablero Kanban: Pendiente]
                        │
                        ▼
             [Inicio del Servicio: En Proceso (Cronómetro en Marcha)]
                        │
                        ▼
             [Fin del Trabajo: Terminado (Cargo Automático a la Visita)]
                        │
                        ▼
             [Entrega de Pertenencias y Mascota al Dueño: Entregado]
```

---

## 4. Funcionalidades Clave
- **Tablero visual kanban**: Organización en columnas operativas claras (`Pendientes`, `En Proceso`, `Terminados`, `Entregados`).
- **Cronómetro de servicio en vivo**: Medición del tiempo transcurrido durante el baño o corte para evaluar la productividad y estimar tiempos de espera.
- **Inventario y custodia de pertenencias**: Campo específico al ingreso para anotar accesorios (tipo y color de collar, placa, correa o jaula de transporte), previniendo pérdidas o confusiones comunes.
- **Insignia de seguridad animal**: Alerta destacada de *"Manejo con precaución"* si el paciente fue identificado como agresivo o nervioso en su expediente.
- **Check-in express**: Formulario rápido para registrar clientes que llegan sin cita previa, creando o asociando la visita automáticamente.

---

## 5. Reglas de Negocio e Interconexiones
- **Integración financiera obligatoria**: Al cambiar el estado de un servicio a `Terminado`, el importe correspondiente se carga de inmediato a la *Visita* del cliente; no requiere cobro por separado en el área de peluquería.
- **Trazabilidad sin borrado manual**: Los trabajos de peluquería no pueden borrarse libremente del tablero para evitar pérdidas de registro; cualquier anulación debe gestionarse desde la visita central de recepción.
- **Conexión con Clientes y Pacientes**: Se alimenta directamente de las características, raza y alertas del paciente registradas en el directorio central.
