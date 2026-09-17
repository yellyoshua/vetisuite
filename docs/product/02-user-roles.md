# 02. Roles y Tipos de Usuario

VetiSuite está diseñado para que cada integrante del equipo veterinario trabaje enfocado en su área operativa sin interferencias ni desorden de información, manteniendo al mismo tiempo una comunicación fluida entre el mostrador, el consultorio y el área de estética.

---

## 1. Perfiles de Usuario del Sistema

```text
               ┌─────────────────────────────────┐
               │    ADMINISTRADOR DE CLÍNICA     │
               │   (Dirección, Finanzas, Stock)  │
               └────────────────┬────────────────┘
                                │
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ RECEPCIÓN Y  │         │    MÉDICO    │         │  PELUQUERO / │
│  MOSTRADOR   │         │ VETERINARIO  │         │   ESTILISTA  │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                │
               ┌────────────────┴────────────────┐
               │     PROPIETARIO DE MASCOTA      │
               │  (Reserva externa en Portales)  │
               └─────────────────────────────────┘
```

---

## 2. Descripción Detallada de Roles

### A. Administrador / Director de Clínica
- **Objetivo**: Garantizar la rentabilidad del negocio, evitar desabasto o pérdidas de productos y monitorear la salud operativa diaria.
- **Módulos principales**: Dashboard, Finanzas, Inventario, Portales, Configuración de Disponibilidad.
- **Acciones cotidianas**:
  - Supervisar los ingresos facturados y el margen del día.
  - Revisar alertas de stock bajo y lotes con caducidad próxima (< 60 días).
  - Gestionar horarios de atención y profesionales habilitados.
  - Crear y publicar portales de campañas comerciales.

### B. Recepcionista / Atención en Mostrador
- **Objetivo**: Coordinar la llegada de pacientes, agendar citas sin dobles reservas y liquidar el cobro de todos los servicios sin omitir cargos.
- **Módulos principales**: Citas y Agenda, Visitas, Facturación, Clientes y Pacientes.
- **Acciones cotidianas**:
  - Buscar clientes por nombre, teléfono o correo.
  - Registrar nuevos dueños y sus mascotas.
  - Agendar citas respetando la matriz médico × hora.
  - Abrir la *Visita* del cliente al ingresar a la clínica.
  - Validar que todos los servicios de la visita estén concluidos antes de cobrar y emitir la factura.

### C. Médico Veterinario
- **Objetivo**: Brindar atención clínica precisa, registrar el diagnóstico sin pérdida de tiempo y evitar fugas de medicamentos aplicados en camilla.
- **Módulos principales**: Clínica y Laboratorio, Clientes y Pacientes (alertas médicas), Agenda de Citas.
- **Acciones cotidianas**:
  - Consultar antecedentes del paciente, alergias y advertencia de agresividad antes de iniciar la revisión.
  - Registrar signos vitales (peso, temperatura, frecuencia cardíaca), anamnesis y diagnóstico.
  - Registrar insumos aplicados en consulta (descontando stock y sumándolo a la cuenta al instante).
  - Emitir recetas digitales y generar órdenes de exámenes de laboratorio.

### D. Peluquero / Estilista Animal
- **Objetivo**: Gestionar el flujo de baños y cortes de forma ordenada, cuidar las pertenencias del paciente y avisar al terminar.
- **Módulos principales**: Peluquería y Estética.
- **Acciones cotidianas**:
  - Registrar la llegada de mascotas para estética anotando pertenencias (collar, correa, transportín).
  - Mover tarjetas en el tablero kanban (Pendiente ➔ En Proceso ➔ Terminado ➔ Entregado).
  - Monitorear el cronómetro de servicio para calcular tiempos de atención.
  - Marcar el servicio como terminado para que se agregue automáticamente a la cuenta final de la visita.

### E. Propietario / Dueño de Mascota (Actor Externo)
- **Objetivo**: Agendar una cita desde su teléfono en cualquier momento y registrar a su mascota en campañas especiales de salud animal sin llamar por teléfono.
- **Punto de contacto**: Portales Web Públicos de VetiSuite.
- **Acciones habituales**:
  - Ingresar al portal público de la clínica (`clinica.vetisuite.com/p/...`).
  - Completar el wizard de 4 pasos (Datos personales ➔ Datos de mascota ➔ Horario ➔ Motivo).
  - Recibir confirmación de reserva según la disponibilidad configurada por la clínica.

---

## 3. Matriz de Responsabilidades por Módulo

| Módulo | Administrador | Recepción | Veterinario | Estilista | Propietario |
|--------|:-------------:|:---------:|:-----------:|:---------:|:-----------:|
| **Dashboard** | Total | Lectura | Agenda | — | — |
| **Clientes & Pacientes** | Total | Creación/Edición | Ficha médica | Alertas | — |
| **Citas & Agenda** | Configuración | Gestión diaria | Su agenda | — | Reserva Portal |
| **Visitas** | Auditoría | Gestión & Cobro | Consulta | Servicio | — |
| **Peluquería & Estética** | Lectura | Check-in | — | Operación total | — |
| **Clínica & Lab** | Auditoría | Consulta | Operación total | — | — |
| **Inventario** | Total (Compras/Precios) | Consulta | Consumo clínico | — | — |
| **Facturación** | Informes | Emisión & Cobro | — | — | — |
| **Finanzas** | Total | — | — | — | — |
| **Portales** | Creación/Edición | Consulta envíos | — | — | Autoservicio |
