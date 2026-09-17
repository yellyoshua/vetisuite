# Módulo 10: Portales

## 1. Propósito y Valor
El módulo de Portales empodera a la clínica veterinaria para crear y publicar sus propias páginas web públicas de autoservicio bajo un subdominio propio (`clinica.vetisuite.com/p/{slug}`). Resuelve la necesidad de captar pacientes por internet y permitir la reserva de turnos en línea las 24 horas del día, así como lanzar páginas dedicadas para campañas estacionales de salud (ej. vacunación, desparasitación o esterilización) sin depender de agencias ni desarrolladores web externos.

---

## 2. Usuarios y Roles
- **Administrador de Clínica**: Diseña el portal, define su propósito (reserva o captación), personaliza la identidad visual y redacta el mensaje de bienvenida.
- **Recepción**: Consulta los envíos y solicitudes recibidas a través de los portales públicos.
- **Propietario de Mascota**: Navega por la página pública desde su teléfono u ordenador y completa el formulario paso a paso.

---

## 3. Flujo Operativo

```text
[Creación de Portal en el Panel: Nombre, Slug, Marca y Propósito]
                               │
                               ▼
[Publicación de Página Web en Subdominio Único]
                               │
                               ▼
[Propietario Ingresa al Enlace y Completa el Wizard de 4 Pasos]
(1. Tus Datos ➔ 2. Tu Mascota ➔ 3. Fecha y Hora ➔ 4. Motivo)
                               │
                               ▼
[Envío del Formulario con Validación de Disponibilidad]
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
[Identificación o Alta de Cliente y Paciente]   [Agendamiento Automático de Cita]
                               │
                               ▼
[Registro de Solicitud en la Bandeja de Envíos de la Clínica]
```

---

## 4. Funcionalidades Clave
- **Dos modalidades de portal (`purpose`)**:
  - *Reserva de citas (`booking`)*: Permite al cliente elegir médico o tomar el turno disponible más próximo, creando la cita de forma directa en la agenda médica.
  - *Captación de campañas (`capture`)*: Formularios especializados para registrar interesados en promociones o jornadas especiales de salud animal (sin crear cita de inmediato).
- **Wizard público intuitivo de 4 etapas**: Experiencia fluida para el dueño de la mascota:
  1. *Tus datos*: Nombre y teléfono de contacto del propietario.
  2. *Tu mascota*: Nombre, especie y raza del paciente.
  3. *Fecha y hora*: Horarios calculados según la disponibilidad real de la clínica.
  4. *Motivo*: Descripción de los síntomas o razón de la visita.
- **Personalización de marca (Branding)**: Inclusión del logo de la clínica, paleta de colores personalizada (primario, acento y fondo) y texto introductorio enriquecido con Markdown.
- **Gestión de slugs web únicos**: Generación automática de direcciones amigables basadas en el nombre del portal, garantizando que no se repitan entre clínicas.
- **Bandeja de envíos históricos**: Registro detallado de todas las solicitudes enviadas por los propietarios, conservando las respuestas originales de cada formulario para seguimiento comercial.

---

## 5. Reglas de Negocio e Interconexiones
- **Integración directa con Clientes y Pacientes**: Si el número de teléfono del propietario coincide con uno existente, el envío se asocia al cliente registrado; si no existe, el sistema crea la ficha automáticamente con los datos ingresados.
- **Sujeto a la disponibilidad clínica**: El portal nunca ofrece turnos que colisionen con citas ya existentes ni fuera del horario configurado en el módulo de Agenda.
- **Inclusión en la agenda central**: Las citas generadas desde un portal público ingresan a la misma matriz de trabajo de recepción, identificadas con su origen web.
