# Análisis de producto — OkVet (competencia)

> **Fuente:** exploración directa de `https://sys.okvet.co` (cuenta real, plan Gratis) el 6 de agosto de 2026.
> **Alcance:** todos los módulos visibles en la navegación principal a día de hoy.
> **Lectura:** cada módulo se describe como producto — necesidad de la clínica, solución de OkVet, funcionalidades (alta / edición / baja) y submódulos. Los submódulos son el último nivel de detalle.
> **Nota de método:** los módulos *Hosp./Amb.*, *Marketing* y los *Informes Premium* están restringidos por plan en la cuenta usada; su detalle proviene de la pantalla en modo lectura, de la configuración asociada y del comparativo de planes.

---

## Mapa general

| # | Módulo | Submódulos | Estado en plan Gratis |
|---|--------|-----------|----------------------|
| 1 | Dashboard | 5 | Disponible |
| 2 | Administración | 6 | Disponible |
| 3 | Agenda | 3 | Disponible con topes |
| 4 | Consultorio | 21 | Disponible con topes |
| 5 | Ventas | 9 | Parcial |
| 6 | Hospitalización / Ambulatorio | 4 | Bloqueado (solo lectura) |
| 7 | Solicitudes | 3 | Disponible |
| 8 | Marketing | 3 | Bloqueado (solo lectura) |
| 9 | Informes | 9 | Parcial |

---

# 1. Dashboard

**Necesidad de la clínica.** El dueño no sabe, sin cerrar el mes, si la clínica está creciendo o cayendo.

**Solución de OkVet.** Pantalla de inicio con los indicadores del periodo y comparativo contra el periodo anterior.

**Funcionalidades**

- Filtrar todo el tablero por rango de fechas.
- Ver ventas totales del periodo, base antes de impuestos y variación % contra el periodo anterior.
- Ver propietarios vinculados y mascotas registradas en el periodo.
- Ver el rating público de la veterinaria.
- Definir y editar una meta de ventas y ver el % de cumplimiento.
- Ver distribución de la operación por servicio, por especialidad y por especie.
- Saltar desde cada tarjeta al informe detallado.
- No permite crear, editar ni borrar registros: es solo lectura.

**Nota competitiva (Vetisuite).** Es un dashboard de vanidad: mide volumen, no rentabilidad. No hay margen, ticket promedio, ni retención. Un tablero que responda "¿esto es rentable?" es diferenciable sin costo de infraestructura relevante.

## Submódulos

### 1.1 Indicadores de cabecera
Contadores rápidos de propietarios, mascotas y rating en el periodo elegido.
- Ver conteo de propietarios vinculados en el periodo.
- Ver conteo de mascotas registradas en el periodo.
- Ver calificación promedio de la veterinaria (1–5).
- Abrir el detalle de cada indicador.

### 1.2 Total de ventas
Resumen monetario del periodo con comparativo.
- Ver total vendido con impuestos y base sin impuestos.
- Ver total del periodo anterior y el % de variación.
- Ver la curva de ventas del periodo.

### 1.3 Cumplimiento de ventas
Meta comercial del periodo y avance real.
- Definir la meta de ventas del periodo.
- Editar la meta ya definida.
- Ver ventas reales contra meta y el % logrado.

### 1.4 Totales por servicio y por especialidad
Composición de la actividad clínica.
- Ver conteo y % por tipo de servicio (consultas, vacunaciones, fórmulas médicas, otros).
- Ver conteo y % por especialidad atendida.
- Abrir el informe detallado del bloque.

### 1.5 Distribución por especie
Perfil de pacientes atendidos.
- Ver la mezcla de especies atendidas en el periodo.
- Usarlo como insumo para compras e inventario.

---

# 2. Administración

**Necesidad de la clínica.** Que el sistema se comporte como la clínica trabaja: sus horarios, sus servicios, sus impuestos, su equipo y sus catálogos — sin depender de soporte.

**Solución de OkVet.** Un módulo de configuración autoservicio que gobierna el resto de la plataforma.

**Funcionalidades**

- Configurar la identidad, ubicación, horarios, perfil fiscal y preferencias de la veterinaria.
- Crear, editar, desactivar y exportar usuarios del equipo con rol.
- Consultar, editar y exportar la base de propietarios.
- Crear y administrar planes de salud y servicios para clientes.
- Cambiar de plan de suscripción y comprar recursos adicionales.
- Crear, editar, vincular y borrar los catálogos clínicos (variables) que alimentan la historia clínica.
- Vincular sedes adicionales de OkVet para consulta centralizada.

**Nota competitiva (Vetisuite).** La configuración es densa y está repartida en 8 pestañas + 8 catálogos: es potente pero implica una puesta en marcha larga. Hay espacio para ganar con plantillas por tipo de clínica ("clínica pequeña de pequeños animales") que dejen el sistema usable en minutos, no en días.

## Submódulos

### 2.1 Configuración de la veterinaria
Ficha maestra del negocio; condiciona el comportamiento de todos los módulos.
- Editar logo, razón social, identificación tributaria, teléfono y correos de contacto y de recordatorios.
- Definir dirección y coordenadas, o marcar la clínica como sin sede física / a domicilio.
- Seleccionar los servicios ofertados (50+ opciones) y las especies que se atienden (14 opciones) — informativo, para ser encontrado por clientes.
- Definir precio de consulta de referencia y atención 24 horas.
- Establecer idioma, moneda y zona horaria del sistema.
- Configurar horarios de atención por día, duración estándar de citas y prevención de solapamientos.
- Definir qué usuarios aparecen en la agenda y quiénes la administran.
- Habilitar la recepción de solicitudes de agendamiento desde la app OkPet.
- Configurar el perfil fiscal (tipo de persona, régimen de IVA, responsabilidades fiscales) y activar facturación electrónica.
- Habilitar ventas, facturación POS, integración con Siigo Nube y el uso de turnos de caja.
- Configurar reglas de inventario: permitir sobreventa y confirmación de entrega (picking).
- Vincular cada formulario clínico (consulta, vacuna, cirugía, laboratorio, etc.) para que se cargue automáticamente al recibo.
- Configurar formato de impresión, recordatorios de consultorio y campos condicionales de la historia (listado de problemas, lista maestra, diagnósticos diferenciales).
- Habilitar la sala de espera pública, registrar consultorios y cargar banners públicos.
- Vincular sedes; la desvinculación requiere contactar a soporte.

### 2.2 Usuarios
Gestión del equipo que accede al sistema.
- Registrar usuarios con nombre, correo y rol.
- Editar los datos y el rol de un usuario.
- Consultar y reactivar usuarios inactivos.
- Exportar el listado de usuarios.

### 2.3 Propietarios
Base maestra de clientes de la clínica.
- Consultar el listado con identificación, contacto, dirección, número de mascotas y estado de autorización de datos.
- Buscar y ordenar por cualquier columna.
- Editar la ficha de un propietario.
- Exportar el listado.
- Nota de producto: el documento de identidad es único a nivel de toda la red OkVet; si ya existe en otra clínica, obliga a un "proceso de vinculación" en lugar de crear el registro.

### 2.4 Planes de salud y servicios
Paquetes prepagados o de membresía que la clínica vende a sus clientes.
- Crear planes personalizados con especies, duración y servicios incluidos.
- Editar y desactivar planes.
- Activar un plan sobre un propietario y controlar su vigencia.
- Aplicar coberturas automáticamente al registrar servicios cubiertos.
- Consultar afiliados y vencimientos, y recibir alertas de vencimiento.

### 2.5 Planes y suscripción
Autogestión comercial de la cuenta OkVet.
- Comparar los planes Gratis, OkVet One (US$22,75/mes, un solo usuario) y OkVet Pro (US$43,54/mes, todos los usuarios).
- Cambiar entre facturación mensual y anual e ingresar códigos de descuento.
- Comprar recursos adicionales: paquetes de SMS, WhatsApp, correos y tokens de IA.
- Consultar el historial de suscripción y pagos.

### 2.6 Variables (catálogos clínicos)
Diccionario que alimenta los formularios de la historia clínica y su cobro.
- Administrar el catálogo de **consultas** por categoría y tipo (ayudas diagnósticas, especialidades, etc.).
- Administrar catálogos de **vacunas**, **hospitalizaciones**, **cirugías/procedimientos**, **pruebas de laboratorio**, **imágenes diagnósticas** y **peluquería y spa**.
- Vincular cada ítem del catálogo a un producto/servicio facturable del inventario.
- Marcar ítems en lote y exportar cualquier catálogo.
- Crear, editar y borrar **formatos de documentos** (consentimiento informado, disentimiento informado, consentimiento de guardería).

---

# 3. Agenda

**Necesidad de la clínica.** Llenar la agenda sin choques de horario y reducir las inasistencias, que son pérdida directa de facturación.

**Solución de OkVet.** Calendario multiusuario con recordatorios automáticos multicanal y recepción de solicitudes desde la app del propietario.

**Funcionalidades**

- Crear, editar, reprogramar y eliminar eventos.
- Ver la agenda en mes, semana, día, lista o programador por recurso.
- Buscar citas por documento, nombre o celular del propietario.
- Filtrar por calendario/usuario.
- Bloquear espacios sin asignar propietario ("solo reservar el espacio").
- Enviar invitaciones de calendario y recordatorios por OkPet, email, SMS y WhatsApp.
- Recibir y aprobar solicitudes de cita generadas por los propietarios.

**Nota competitiva (Vetisuite).** Los recordatorios son el gancho real, pero en OkVet son un recurso consumible que se agota (la cuenta probada mostraba "Recursos agotados: tus clientes han dejado de recibir recordatorios"). Un modelo donde el recordatorio no se apaga —o donde el aviso de agotamiento no sea la primera pantalla que ve el cliente— es un argumento comercial fuerte.

## Submódulos

### 3.1 Agenda general
Vista completa de la clínica, para recepción y coordinación.
- Crear evento con propietario, tipo, encargado, fecha/hora, título y descripción.
- Marcar eventos sin hora definida o como simple reserva de espacio.
- Cambiar entre vistas mes / semana / día / lista / programador.
- Editar, mover y eliminar eventos existentes.
- Activar o desactivar el envío de recordatorios por WhatsApp y SMS.
- Filtrar por lista de calendarios y usuarios.

### 3.2 Agenda personal
Vista individual de cada profesional.
- Consultar únicamente los eventos propios.
- Crear y editar los eventos asignados a uno mismo.
- Depende de estar incluido en "usuarios en la agenda" de la configuración.

### 3.3 Disponibilidad / Programador
Reglas de capacidad y vista por recurso.
- Definir horarios de apertura y cierre por día de la semana.
- Definir la duración promedio de las citas.
- Activar la prevención de solapamientos entre encargados.
- Ver la ocupación por usuario en una línea de tiempo horaria.
- Designar administradores de agenda.

---

# 4. Consultorio

**Necesidad de la clínica.** Tener toda la vida clínica de un paciente en un solo lugar, con respaldo legal, y poder registrarla sin frenar la consulta.

**Solución de OkVet.** Historia clínica única por mascota, estructurada bajo el estándar SOIP, con 18 tipos de registro y asistencia de IA en la redacción.

**Funcionalidades**

- Buscar propietario por identificación, teléfono o nombre, y mascota por nombre o identificador.
- Registrar, editar y consultar propietarios y mascotas.
- Abrir la historia clínica de cualquier mascota y navegar entre sus 18 tipos de registro.
- Crear, editar y anular registros clínicos; cada uno queda fechado y firmado por usuario.
- Adjuntar imágenes y archivos a los registros (con tope de tamaño según plan).
- Generar un resumen de la historia con IA y corregir/redactar campos con IA.
- Exportar la historia clínica y enviar documentos al propietario para firma digital.
- Enviar la mascota a la sala de espera y asignarle consultorio y turno.
- Cada registro clínico puede convertirse automáticamente en producto dentro del recibo de venta.

**Nota competitiva (Vetisuite).** Dos aperturas claras. (1) **Fricción de alta**: registrar una mascota exige raza, color, fecha de nacimiento, peso, talla, estado reproductivo y alimento como campos obligatorios — en plena consulta eso se siente. (2) **IA superficial**: la IA "corrige" texto ya escrito y se cobra por tokens; el valor real está en dictar la consulta y que el sistema arme el SOAP, no en pulir redacción.

## Submódulos

### 4.1 Buscador de propietarios y mascotas
Punto de entrada operativo del día a día.
- Buscar por identificación, teléfono o nombre del propietario.
- Buscar por nombre o identificador de la mascota.
- Ver el listado con nombre, identificador, teléfono, número de mascotas y última gestión.
- Acceder directo a registrar propietario o registrar venta.

### 4.2 Ficha del propietario
Datos del cliente y su relación con la clínica.
- Registrar propietario: tipo y número de documento, nombre, móvil/WhatsApp, email (o marcar "no tiene"), teléfono fijo, dirección, ciudad, contacto autorizado, teléfono alternativo y canal por el que conoció la clínica.
- Aceptar explícitamente la política de tratamiento de datos.
- Editar los datos del propietario.
- Agregar notas internas sobre el cliente.
- Ver todas sus mascotas asociadas.

### 4.3 Ficha de la mascota (Datos generales)
Identidad y perfil del paciente.
- Registrar mascota: foto, nombre, código/chip, especie, raza, género, color, fecha de nacimiento, peso y unidad, talla, estado reproductivo, temperamento y alimento.
- Marcar animal de servicio o de apoyo emocional.
- Editar cualquier dato y marcar fallecido.
- Ver edad calculada, vivienda, frecuencia de baño, último celo y otras mascotas del hogar.
- Generar un resumen de la mascota con IA.
- Exportar la ficha.

### 4.4 Consultas
Registro clínico principal, bajo estándar SOIP.
- Crear consulta con fecha y motivo tipificado.
- Diligenciar S (subjetivo/anamnesis), O (objetivo/examen), I (interpretación/diagnóstico) y P (plan terapéutico y plan diagnóstico).
- Corregir cada campo narrativo con IA.
- Cargar listado de problemas, lista maestra y diagnósticos diferenciales como etiquetas múltiples.
- Registrar examen físico general y examen físico especial.
- Definir fecha de próximo control y adjuntar imágenes/archivos.
- Editar o anular la consulta.

### 4.5 Vacunaciones
Control del esquema de inmunización.
- Registrar vacuna aplicada desde el catálogo configurado.
- Definir fecha de refuerzo y generar recordatorio automático.
- Editar o anular el registro.
- La vacuna se agrega automáticamente como producto al recibo.

### 4.6 Fórmulas médicas
Prescripción formal y trazable.
- Crear fórmula con fecha y diagnóstico presuntivo y/o final.
- Agregar múltiples medicamentos con nombre, presentación, cantidad y posología.
- Agregar observaciones y corregirlas con IA.
- Ver el peso vigente del paciente durante la prescripción.
- Editar, eliminar medicamentos e imprimir/compartir la fórmula.
- Cada medicamento se registra como producto en el recibo.

### 4.7 Desparasitaciones
Control antiparasitario con recordatorio.
- Registrar producto usado y fecha de aplicación.
- Definir próxima desparasitación y disparar recordatorio.
- Editar o anular el registro.

### 4.8 Hospitalizaciones / Ambulatorios
Acceso desde la historia al episodio de internación o manejo ambulatorio.
- Iniciar un episodio de hospitalización o ambulatorio para la mascota.
- Consultar el historial de episodios previos.
- La cantidad facturada se calcula automáticamente en días.
- Funcionalidad plena reservada al plan Pro.

### 4.9 Cirugías / Procedimientos
Registro quirúrgico.
- Registrar cirugía o procedimiento desde el catálogo configurado.
- Adjuntar el consentimiento o disentimiento informado firmado.
- Editar o anular el registro.
- La cirugía se agrega como producto al recibo; medicamentos y tratamientos asociados no se agregan automáticamente.

### 4.10 Órdenes
Solicitudes internas de estudios y servicios.
- Crear orden con fecha, tipo de orden, subtipo, cantidad y prioridad.
- Agregar varias órdenes en un mismo registro.
- Marcar "generar solicitud" para que llegue al módulo de Solicitudes.
- Escribir el motivo de la orden y corregirlo con IA.
- Editar, anular y hacer seguimiento del estado.

### 4.11 Exámenes de laboratorio
Resultados de patología clínica.
- Registrar prueba desde el catálogo configurado.
- Cargar resultados y adjuntar archivos.
- Notificar al profesional solicitante cuando otro usuario sube el resultado.
- Editar o anular el registro.

### 4.12 Imágenes diagnósticas
Ayudas de imagenología.
- Registrar el estudio (ecografía, radiografía, tomografía, resonancia).
- Adjuntar imágenes y el informe.
- Notificar al solicitante al cargar resultados.
- Editar o anular el registro.

### 4.13 Peluquería y spa
Servicios estéticos ligados al paciente.
- Registrar el servicio desde el catálogo configurado.
- Definir próxima sesión y recordatorio.
- Editar o anular el registro; se factura como producto.

### 4.14 Guardería
Estadía no clínica.
- Registrar ingreso y salida de guardería.
- Adjuntar el consentimiento de guardería.
- La cantidad facturada se calcula en días.
- Editar o anular el registro.

### 4.15 Seguimientos
Evolución del paciente entre consultas.
- Crear notas de seguimiento fechadas.
- Definir próximo control y recordatorio.
- Editar o eliminar el seguimiento.

### 4.16 Documentos
Repositorio documental del paciente.
- Generar documentos desde los formatos configurados.
- Cargar archivos externos.
- Enviar a firma digital por link, correo o app OkPet.
- Descargar, reemplazar o eliminar documentos.

### 4.17 Remisiones
Derivación a otro profesional o centro.
- Crear remisión con motivo y destino.
- Adjuntar los soportes clínicos relevantes.
- Editar, imprimir o anular la remisión.

### 4.18 Citas
Historial de agendamientos de la mascota.
- Ver todas las citas pasadas y futuras del paciente.
- Crear una cita desde la historia.
- Ver estado (efectiva, cancelada, pendiente).

### 4.19 Tareas pendientes
Lista de pendientes clínicos por paciente (marcado como funcionalidad nueva).
- Crear tarea asociada a la mascota.
- Asignar responsable y fecha.
- Marcar como completada o eliminar.

### 4.20 Mensajes al propietario
Bitácora de comunicación con el cliente.
- Enviar mensajes al propietario por los canales habilitados.
- Ver el histórico de mensajes enviados y su estado.
- Consume recursos de SMS / WhatsApp / email del plan.

### 4.21 Sala de espera
Gestión del flujo de pacientes en recepción.
- Enviar una mascota a la sala de espera desde su ficha.
- Asignar consultorio y número de turno.
- Mostrar una pantalla pública con turno, consultorio y nombre del cliente.
- Cargar banners publicitarios con tiempo de visualización.
- Retirar o reasignar turnos.

---

# 5. Ventas

**Necesidad de la clínica.** Cobrar rápido, con impuestos correctos, sin perder el control del inventario ni del efectivo del turno.

**Solución de OkVet.** Punto de venta integrado a la historia clínica, con inventario, compras, listas de precio, reglas de impuestos y turnos de caja.

**Funcionalidades**

- Crear cuentas/recibos y facturas, editarlas, cerrarlas y anularlas.
- Cobrar de contado o a crédito y registrar pagos parciales.
- Registrar, editar, importar, exportar y eliminar productos y servicios.
- Definir reglas de impuestos y listas de precios / modificadores.
- Registrar compras a proveedores y solicitudes de compra.
- Abrir y cerrar turnos de caja con control de ingresos y egresos.
- Unificar varias cuentas de un mismo cliente en un solo documento.
- Emitir factura electrónica vía integración con Siigo Nube.

**Nota competitiva (Vetisuite).** Es el módulo más completo de OkVet y la principal razón por la que las clínicas pagan Pro. Dos debilidades explotables: el kardex de hospitalización **no descuenta inventario automáticamente** (lo advierte la propia plataforma), y la facturación electrónica depende de una suscripción externa a Siigo. Resolver el descargue automático y ofrecer facturación electrónica nativa son diferenciadores concretos, no cosméticos.

## Submódulos

### 5.1 Documentos (ventas, recibos y facturas)
Bandeja operativa de todo lo cobrado.
- Listar documentos por día, con filtro por tipo (todos, facturas POS, facturas, unificados) y por estado.
- Buscar por identificación o cliente.
- Ver valor, pagos, estado, usuario y última actualización.
- Abrir, editar, reimprimir y anular un documento.

### 5.2 Registro de venta / cuenta
Pantalla de cobro.
- Asociar la venta a un propietario o dejarla como "venta a persona indeterminada".
- Agregar líneas buscando producto/servicio o escaneando código de barras.
- Definir valor unitario, descuento %, cantidad, tributario y regla de impuestos por línea.
- Aplicar descuento global con razón obligatoria.
- Elegir forma de pago (contado / crédito) y agregar observaciones.
- Impedir el cierre con saldo pendiente si así está configurado.
- Guardar, cerrar o anular la cuenta.

### 5.3 Productos y servicios (inventario)
Catálogo comercial y kardex.
- Registrar producto o servicio con nombre, tipo, categoría, referencia/SKU, centro de costos y código de barras.
- Marcar el ítem como cuantificable (con seguimiento de inventario) o excluirlo de listas de precios.
- Definir tributario, valor total con impuestos, valor base y costo.
- Editar, eliminar y consultar ítems eliminados.
- Importar catálogo masivamente y exportar el inventario.
- Compartir el catálogo.
- Ver existencias y disponibles por ítem.

### 5.4 Listas de precios / Modificadores
Precios diferenciados por segmento o convenio.
- Crear lista con nombre, precio de referencia y tributario.
- Asociar productos y servicios a la lista.
- Editar y eliminar listas.
- Excluir ítems puntuales de la aplicación de listas.

### 5.5 Reglas de impuestos
Configuración tributaria del catálogo.
- Crear reglas de impuesto aplicables a productos y servicios.
- Editar y eliminar reglas.
- Asignar la regla por defecto a cada ítem.

### 5.6 Compras
Entrada de mercancía al inventario.
- Registrar compra con fecha, referencia, proveedor, base, descuento, total y notas.
- Consultar el histórico de compras por rango de fechas.
- Exportar el histórico.
- Editar o anular una compra.
- Configurar parámetros del proceso de compra.

### 5.7 Proveedores
Maestro de terceros de abastecimiento.
- Registrar proveedor con sus datos de contacto e identificación.
- Editar y eliminar proveedores.
- Asociar proveedores a compras.

### 5.8 Solicitudes de compra
Requerimientos internos de reposición, previos a la compra formal.
- Crear una solicitud de compra desde el inventario.
- Consultar y editar las solicitudes abiertas.
- Darles curso como compra registrada.
- *(Acceso directo desde la barra de acciones de Productos y servicios.)*

### 5.9 Turnos de caja
Control de efectivo por usuario y jornada.
- Iniciar y cerrar turno desde la cabecera del sistema.
- Restringir la emisión de documentos a usuarios con turno activo.
- Registrar ingresos y egresos dentro del turno.
- Entregar el turno a otro usuario.
- Generar el informe de turno.

---

# 6. Hospitalización / Ambulatorio

**Necesidad de la clínica.** Que el paciente internado no dependa de la memoria del turno: qué se le aplicó, a qué hora, quién lo hizo y qué falta.

**Solución de OkVet.** Tablero de pacientes en seguimiento con kardex de órdenes médicas y entrega formal de turno.

**Funcionalidades**

- Ver el listado de mascotas en seguimiento, separado por hospitalización y ambulatorio.
- Abrir un episodio, registrar evolución y cerrar el alta.
- Programar y marcar como cumplidas las órdenes del kardex.
- Entregar el turno dejando constancia del estado de cada paciente.
- Facturar el episodio con cantidad calculada en días.
- **Restricción:** el módulo requiere plan OkVet Pro; en planes inferiores queda en modo solo lectura.

**Nota competitiva (Vetisuite).** OkVet advierte explícitamente que *"los productos/servicios del kardex NO se descuentan automáticamente"*. Es el hueco más grande y más caro del producto: la clínica aplica medicamentos que nunca salen del inventario ni de la cuenta. Un kardex que descargue stock y alimente el recibo en tiempo real es un diferenciador defendible.

## Submódulos

### 6.1 Tablero de hospitalización
Pacientes internados en curso.
- Ver las mascotas hospitalizadas activas.
- Abrir la ficha del episodio y su evolución.
- Registrar el alta del paciente.

### 6.2 Tablero de ambulatorio
Pacientes en manejo ambulatorio.
- Ver las mascotas en seguimiento ambulatorio.
- Registrar aplicaciones y controles.
- Cerrar el episodio.

### 6.3 Kardex clínico
Plan de órdenes médicas del episodio.
- Crear órdenes con medicamento, dosis, vía y frecuencia.
- Marcar cada aplicación como cumplida con hora y responsable.
- Editar o suspender una orden.
- Advertencia de producto: no descuenta inventario automáticamente.

### 6.4 Entrega de turno
Traspaso formal entre equipos.
- Registrar la entrega de turno desde el tablero.
- Dejar constancia del estado de cada paciente al momento del cambio.
- Consultar entregas anteriores.

---

# 7. Solicitudes

**Necesidad de la clínica.** Que las peticiones que llegan de fuera (clientes, otros profesionales, otras sedes) no se pierdan en WhatsApp ni en el mostrador.

**Solución de OkVet.** Tres bandejas de pendientes, una por tipo de solicitud, con aprobación explícita.

**Funcionalidades**

- Ver todas las solicitudes pendientes agrupadas por tipo.
- Aprobar o rechazar cada solicitud.
- Buscar, filtrar y ordenar el listado.
- Seleccionar varias solicitudes y resolverlas en lote.
- Contador de pendientes visible en la navegación.

**Nota competitiva (Vetisuite).** El concepto es correcto pero está desconectado: son tres listas separadas sin priorización ni SLA. Una bandeja única con antigüedad y responsable asignado convierte esto de un buzón en un flujo de trabajo.

## Submódulos

### 7.1 Solicitudes de historias clínicas
Peticiones de acceso al expediente de un paciente.
- Ver fecha de solicitud, propietario, mascota y justificación.
- Aprobar o denegar el acceso.
- Resolver varias solicitudes a la vez.

### 7.2 Solicitudes de agendamiento
Citas pedidas por los propietarios desde la app OkPet.
- Ver las solicitudes de cita pendientes sobre el calendario.
- Aceptar, reprogramar o rechazar la solicitud.
- Se habilita desde la configuración de agenda.

### 7.3 Solicitudes de órdenes
Órdenes clínicas generadas que esperan ejecución.
- Ver id, fecha, tipo, subtipo, prioridad, propietario, mascota, notas y usuario solicitante.
- Filtrar por tipo de solicitud.
- Marcar la orden como atendida o descartarla.

---

# 8. Marketing

**Necesidad de la clínica.** Reactivar clientes que dejaron de venir sin contratar una herramienta de correo aparte.

**Solución de OkVet.** Campañas de correo sobre la base de propietarios, con programación y métricas de entrega.

**Funcionalidades**

- Crear campañas de correo con mensaje y programación.
- Editar, duplicar, pausar y archivar campañas.
- Ver destinatarios, enviados, fallidos y bajas por campaña.
- Consultar campañas archivadas.
- **Restricción:** requiere plan OkVet Pro; en planes inferiores queda en modo solo lectura.

**Nota competitiva (Vetisuite).** Marketing genérico por correo aporta poco: cualquier clínica ya tiene Mailchimp. El valor vertical está en campañas disparadas por el dato clínico (vacuna vencida, desparasitación pendiente, paciente sin visita en 12 meses). OkVet tiene el dato pero no lo usa como disparador.

## Submódulos

### 8.1 Campañas de correo
Creación y operación de envíos.
- Crear campaña con nombre, mensaje y programación.
- Editar el contenido antes del envío.
- Activar, pausar o eliminar la campaña.
- Ver la fecha de última edición y el estado.

### 8.2 Archivo de campañas
Histórico de campañas retiradas.
- Consultar las campañas archivadas.
- Restaurar una campaña archivada.
- Reutilizarla como base de una nueva.

### 8.3 Métricas de envío
Resultado de cada campaña.
- Ver destinatarios, enviados, fallidos y desuscritos.
- Comparar campañas entre sí.
- El envío está condicionado a los recursos de correo disponibles en el plan.

---

# 9. Informes

**Necesidad de la clínica.** Sustentar decisiones (precios, compras, contrataciones, cierre contable) con datos, no con intuición.

**Solución de OkVet.** Nueve familias de informes: operativos exportables, analíticos premium, financieros y de base de clientes.

**Funcionalidades**

- Consultar informes por rango de fechas.
- Exportar cualquier informe a archivo.
- Filtrar y ordenar por columnas.
- Acceder a informes financieros de cierre y de inventario.
- **Restricción:** la familia Premium y varios financieros requieren plan Pro.

**Nota competitiva (Vetisuite).** Nueve familias y ~40 informes es sobreoferta: nadie los usa todos. Además la analítica útil está detrás del paywall. Un set corto de 6–8 informes accionables disponibles en todos los planes se percibe como más generoso y más usable — y cuesta menos mantener.

## Submódulos

### 9.1 Dashboard clásico
Vista analítica anterior al dashboard actual.
- Consultar los indicadores en el formato previo.
- Filtrar por periodo.
- Conservado por compatibilidad con usuarios antiguos.

### 9.2 Exportables
Volcados operativos de cada tipo de registro clínico.
- Exportar consultas, vacunaciones, fórmulas médicas y desparasitaciones.
- Exportar hospitalizaciones/ambulatorios, cirugías/procedimientos y órdenes.
- Exportar exámenes de laboratorio e imágenes diagnósticas.
- Exportar peluquería y spa, guardería y seguimientos.
- Exportar documentos, remisiones, citas y tareas pendientes.
- Exportar mensajes al propietario y datos generales.
- Filtrar cada exportable por rango de fechas antes de descargar.

### 9.3 Premium
Analítica de gestión, reservada al plan Pro.
- Informe de agenda: cancelaciones y citas efectivas.
- Gestión de usuarios: productividad por profesional.
- Gestión de órdenes (marcado como nuevo en el menú).
- Hospitalización / ambulatorio.
- Sala de espera y tiempos de atención.
- Clientes inactivos.
- Calificaciones recibidas.
- Uso de recursos consumidos (SMS, WhatsApp, correos, IA).
- Dashboard de ventas.

### 9.4 Financieros
Cierre de caja y control contable.
- Comprobante diario POS.
- Ingresos y egresos.
- Informe de turno.
- Facturación e ítems facturados.
- Pagos y reembolsos pendientes.
- Saldos a favor.
- Comprobantes contables.
- Histórico de inventario.
- Compras e ítems comprados.

### 9.5 Planes de salud y servicios
Seguimiento comercial de los planes vendidos.
- Consultar el listado de afiliados por plan.
- Consultar vencimientos próximos y vencidos.
- Exportar ambos listados.

### 9.6 Propietarios
Base de clientes en formato analítico.
- Consultar y exportar el listado completo de propietarios.
- Filtrar por fecha de vinculación.

### 9.7 Mascotas
Censo de pacientes.
- Consultar y exportar el listado de mascotas.
- Analizar la distribución por especie, raza y edad.

### 9.8 Histórico de registros
Auditoría de actividad del sistema.
- Consultar qué registros se crearon, editaron o anularon.
- Ver usuario y fecha de cada movimiento.
- Exportar el histórico.

### 9.9 Última gestión
Antigüedad de contacto por cliente.
- Ver la fecha de la última interacción de cada propietario.
- Identificar clientes en riesgo de fuga.
- Exportar el listado.

---

# Anexo A — Capa transversal (no es un módulo de navegación)

Elementos que atraviesan toda la plataforma y condicionan la propuesta de valor.

- **Inteligencia artificial.** Botón "Corregir con IA" en cada campo narrativo (consulta, fórmula, orden) y "Resumen con IA" sobre la historia. Se cobra por tokens: 150.000 tokens por US$1,48; el plan Gratis incluye 50.000/mes y Pro 150.000/mes.
- **App OkPet (propietario).** Canal de recordatorios, mensajes, firma de documentos y solicitudes de agendamiento por parte del cliente final.
- **Recursos consumibles.** SMS, WhatsApp, correos y tokens de IA se agotan y se recargan por paquetes (50 SMS US$12,02 · 50 WhatsApp US$6,82 · 500 correos US$0,97). Al agotarse, los recordatorios dejan de enviarse y la plataforma muestra una alerta permanente en la cabecera.
- **Almacenamiento.** 5 GB en Gratis, ilimitado en Pro. Carga por archivo limitada a 2 MB en Gratis y 80 MB en Pro.
- **Red de propietarios compartida.** El documento de identidad del propietario es único en toda la red OkVet; si ya existe en otra clínica, obliga a un proceso de vinculación en vez de crear el registro.
- **Multisede.** Se pueden vincular varias instancias de OkVet para consulta centralizada; la desvinculación exige contactar a soporte.
- **Academy.** Centro de formación externo (`academy.okvet.co`), incluido únicamente en el plan Pro; OkVet One lo excluye explícitamente.
- **Gamificación de onboarding.** Barra de 4 pasos y avisos tipo "crea tu primera historia clínica y empieza tu camino para ser un VetPro".

---

# Anexo B — Estructura comercial observada

| | Gratis | OkVet One | OkVet Pro |
|---|---|---|---|
| Precio | US$0 | US$22,75 / mes | US$43,54 / mes |
| Alcance de usuarios | Todos | **Un solo usuario** | Todos los usuarios |
| Historia clínica | Registros limitados | Máx. 20 registros/mes | Sin tope declarado |
| Agendamientos | 50 / mes | Incluido en el tope de 20 | 3.000+ / mes |
| Recibos | 50 | No incluye ventas | 300+ / mes |
| Almacenamiento | 5 GB | — | Ilimitado |
| Ventas e inventario | Limitado | **No incluye** | Completo |
| Hospitalización / Kardex | No | **No** | Sí |
| Marketing | No | **No** | Sí |
| Informes Premium | No | **No** | Sí |
| Facturación electrónica | No | **No** | Sí (vía Siigo) |

**Lectura competitiva de conjunto.**

1. **El plan intermedio es el punto débil.** OkVet One cuesta US$22,75 y sirve a *una sola persona*, sin ventas, sin inventario y con un tope de 20 registros al mes. Cualquier clínica con dos manos queda empujada a Pro o de vuelta al plan gratis. Un plan intermedio con usuarios ilimitados a ese mismo precio es un ataque directo y evidente para el comprador.
2. **Pro sí es por clínica, no por asiento.** Conviene ser precisos: OkVet Pro ya cubre a todos los usuarios. El diferenciador de Vetisuite no es "usuarios ilimitados" a secas, sino *usuarios ilimitados desde el primer plan de pago*.
3. **Los recursos consumibles generan mala experiencia.** La cuenta probada muestra una alerta permanente de "recursos agotados" y los recordatorios apagados. Si el overage se factura en unidades que el dueño entiende y no corta el servicio crítico, el contraste es inmediato.
4. **Las brechas funcionales concretas son tres:** kardex que no descuenta inventario, facturación electrónica dependiente de un tercero, y fricción alta en el alta de propietarios y mascotas.