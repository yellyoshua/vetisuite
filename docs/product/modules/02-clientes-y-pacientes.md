# Módulo 02: Clientes y Pacientes

## 1. Propósito y Valor
Constituye la base de datos central de VetiSuite. Centraliza la información de los propietarios (dueños) y sus mascotas en una relación clara de 1 a N, garantizando que el personal de recepción y los veterinarios encuentren a cualquier paciente en segundos y tengan siempre a la vista alertas críticas de salud y manejo (como alergias o conducta agresiva).

---

## 2. Usuarios y Roles
- **Recepción**: Registra nuevos clientes y mascotas, actualiza datos de contacto y consulta saldos pendientes.
- **Veterinario**: Consulta antecedentes, edad, especie y alertas médicas previas antes de examinar al animal.
- **Peluquero / Estilista**: Verifica advertencias de agresividad o sensibilidades dermatológicas antes del servicio.

---

## 3. Flujo Operativo

```text
[Búsqueda Rápida por Nombre, Teléfono o Correo]
         │
         ├──➔ [Cliente Existente] ➔ [Ver Ficha 360°] ➔ [Abrir Visita o Agendar Cita]
         │
         └──➔ [Cliente No Encontrado] ➔ [Registro de Dueño] ➔ [Alta de Mascota con Alertas]
```

---

## 4. Funcionalidades Clave
- **Directorio de clientes con búsqueda inteligente**: Localización instantánea de dueños mediante nombre, número telefónico o correo electrónico.
- **Ficha 360° del cliente**: Información completa de contacto, saldo deudor histórico, visitas en curso y tarjetas individuales de cada mascota.
- **Registro y gestión de mascotas**: Registro de nombre, especie (perro, gato, ave, otros), raza y edad.
- **Etiquetas de advertencia clínica**: Marcado de alergias (lista de compuestos) y casilla de "paciente agresivo" que despliega insignias visuales de precaución en todo el sistema.
- **Acciones directas de mostrador**: Botones de un solo clic desde la ficha del cliente para agendar cita, abrir una visita o acceder a la historia clínica de una mascota específica.

---

## 5. Reglas de Negocio e Interconexiones
- **Campos obligatorios**: Todo cliente exige nombre y teléfono para su creación; el correo electrónico es opcional. Toda mascota exige al menos nombre y especie.
- **Conservación histórica (Sin borrado)**: Ni los clientes ni los pacientes pueden eliminarse del sistema para preservar la integridad legal de expedientes médicos y comprobantes de facturación previos.
- **Interconexión transversal**: La información del cliente y paciente alimenta a los módulos de Citas, Visitas, Peluquería, Clínica y Facturación.
