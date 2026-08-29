# Análisis de producto · Veti Suite (app de gestión)

Análisis funcional de la plataforma tal como existe hoy: 10 módulos del panel
interno, con la necesidad de la clínica que resuelve cada uno y lo que se puede
hacer en cada pantalla.

> MVP demo sin backend: los datos viven en memoria y recargar los reinicia. Las
> necesidades y funcionalidades listadas son las que la plataforma cubre hoy, no
> las de un roadmap.

**Índice:** [Dashboard](#1-dashboard) · [Clientes y Pacientes](#2-clientes-y-pacientes) ·
[Citas](#3-citas) · [Visitas](#4-visitas) · [Peluquería y Estética](#5-peluquería-y-estética) ·
[Clínica y Laboratorio](#6-clínica-y-laboratorio) · [Inventario](#7-inventario) ·
[Facturación](#8-facturación) · [Finanzas](#9-finanzas) · [Portales](#10-portales)

---

## 1. Dashboard

Pantalla de apertura del día: el estado de la clínica en una sola vista.

- **Necesidad.** Saber al llegar qué hay agendado, qué está en proceso y qué se va a caer hoy.
- **Análisis.** La información existe repartida en cinco módulos; nadie la revisa toda cada mañana, así que los problemas se descubren tarde (producto agotado a mitad de consulta, cliente con deuda que ya se fue).
- **Solución.** Un tablero de solo lectura que concentra los cuatro indicadores del día y las alertas que exigen acción, cada uno enlazado a su módulo.

**Funcionalidades**

- Ver 4 indicadores del día: citas, mascotas en estética, alertas de stock e ingresos facturados.
- Entrar a cualquier módulo desde su indicador.
- Ver la agenda del día ordenada por hora, con estado de cada cita.
- Ver alertas de stock bajo, caducidad próxima (≤60 días) y clientes con deuda.
- Sin altas, ediciones ni borrados: el dashboard solo lee.

**Submódulos**

### 1.1 Indicadores del día
Cuatro tarjetas con el pulso operativo y económico de la jornada.
- Citas vivas del día y cuántas están confirmadas.
- Mascotas en estética pendientes o en proceso.
- Alertas de inventario: stock bajo + productos por caducar.
- Ingresos facturados y número de facturas emitidas.
- Cada tarjeta navega a su módulo.

### 1.2 Agenda de hoy
Lista compacta de las citas del día, sin entrar al calendario.
- Ver hora, paciente, dueño, motivo y médico asignado.
- Ver el estado de la cita (pendiente, confirmada, completada).
- Ver alertas del paciente (alergias, manejo con precaución).
- Saltar al calendario completo.

### 1.3 Alertas operativas
Lo que requiere acción hoy, con corte a 3 ítems por tipo.
- Productos bajo el mínimo, con unidades y mínimo configurado.
- Productos que caducan en 60 días o menos, con días restantes.
- Clientes con saldo pendiente y su monto.
- Enlace directo al inventario, a la ficha del cliente o a facturación.

---

## 2. Clientes y Pacientes

Registro único de dueños y sus mascotas: la base de datos sobre la que se apoya todo lo demás.

- **Necesidad.** Encontrar al dueño y su mascota en segundos, con los datos clínicos de riesgo a la vista.
- **Análisis.** En cuaderno o Excel el mismo dueño se duplica, el teléfono queda desactualizado y las alergias del paciente no las conoce quien atiende.
- **Solución.** Cliente como entidad principal, mascotas colgando de él, búsqueda por nombre/teléfono/correo y alertas del paciente visibles en todas las pantallas del sistema.

**Funcionalidades**

- Crear cliente (nombre, teléfono WhatsApp, correo); nombre y teléfono obligatorios.
- Editar los datos del cliente.
- Registrar y editar mascotas del cliente: nombre, especie, raza, edad, alergias y marca de paciente agresivo.
- Buscar cliente por nombre, teléfono o correo, con resultados paginados.
- Ver en la lista cuántas mascotas tiene, si debe dinero y si tiene visita abierta.
- Abrir o iniciar la visita del cliente desde la lista o la ficha.
- Sin borrado de clientes ni pacientes: la información histórica no se elimina.

**Submódulos**

### 2.1 Directorio de clientes
Listado buscable y paginado, la puerta de entrada al módulo.
- Buscar por nombre, teléfono o correo (búsqueda diferida, con indicador de carga).
- Ver mascotas, deuda y visita abierta de cada cliente.
- Crear cliente nuevo.
- Ir a ver, editar o iniciar visita en un clic.

### 2.2 Ficha del cliente
Vista de 360° del dueño: sus datos, su saldo y sus mascotas.
- Ver teléfono, correo, deuda acumulada y total de la visita abierta.
- Ver la tarjeta de cada mascota con especie, raza, edad y alertas.
- Abrir el historial clínico o agendar cita de una mascota concreta.
- Editar los datos del cliente.
- Añadir mascota o iniciar la visita del cliente.

### 2.3 Mascotas (pacientes)
Alta y edición de mascotas como sub-recurso del cliente, en modal.
- Registrar mascota con nombre, especie (perro, gato, ave, otro), raza y edad.
- Cargar alergias como lista separada por comas.
- Marcar paciente agresivo: genera alerta visual para todo el equipo.
- Editar cualquiera de esos datos después.
- Sin borrado: una mascota registrada permanece ligada a su historial.

---

## 3. Citas

Agenda del día cruzando médicos y horarios, más la configuración de disponibilidad de la clínica.

- **Necesidad.** Agendar sin sobreagendar y sin depender de la memoria de recepción.
- **Análisis.** El teléfono no para; con dos o tres médicos, la doble reserva y el hueco olvidado son la norma cuando la agenda es papel o un chat.
- **Solución.** Matriz médico × hora donde el hueco libre se ve y se llena en un clic, con validación que rechaza el choque de horario y horarios derivados del horario real de la clínica.

**Funcionalidades**

- Agendar cita: buscar dueño, elegir su mascota, médico, hora y motivo.
- Bloqueo automático si el médico ya tiene cita a esa hora, si la hora está fuera del horario configurado o si se alcanzó el máximo de citas por día.
- Reprogramar cita (médico, hora, motivo) con la misma validación.
- Confirmar o cancelar la cita; se marca completada al iniciar la visita. Cancelar libera el espacio.
- Iniciar la visita desde la cita, eligiendo los tratamientos de la atención.
- Configurar el horario de atención de la clínica y las reglas de reserva.
- Sin borrado de citas: cancelar es un estado, la cita queda registrada.

**Submódulos**

### 3.1 Matriz de la agenda
Tablero del día: una columna por médico, una fila por horario disponible.
- Ver todas las citas del día con paciente, motivo y estado por color.
- Ver alertas del paciente en la propia celda.
- Crear cita en un hueco libre con médico y hora ya preseleccionados.
- Abrir el detalle de una cita existente.
- Aviso cuando la clínica no atiende hoy según su configuración.

### 3.2 Nueva cita y reprogramación
Formularios de alta y cambio, ambos partiendo del cliente.
- Buscar el dueño y elegir entre sus mascotas.
- Elegir médico y hora entre los horarios reales disponibles.
- Escribir el motivo de la consulta.
- Reprogramar conservando la hora actual aunque el horario de la clínica haya cambiado.
- Notificación al dueño simulada por WhatsApp al agendar y al reprogramar.

### 3.3 Detalle de la cita
Ficha de la cita y punto de arranque de la atención.
- Ver paciente, dueño, teléfono, médico, hora, estado, motivo y alertas.
- Confirmar la cita (flujo de confirmación por WhatsApp).
- Seleccionar los tratamientos de la visita (consulta, peluquería, laboratorio, vacuna) e iniciarla.
- Abrir el expediente clínico del paciente.
- Cancelar la cita y liberar el espacio.

### 3.4 Disponibilidad de la clínica
Configuración única que alimenta la agenda y, a futuro, la reserva en línea.
- Activar o desactivar cada día de la semana y definir varios bloques por día (mañana/tarde).
- Copiar el horario de un día al resto de días activos.
- Definir duración de la cita y márgenes antes/después, que separan un inicio del siguiente.
- Elegir zona horaria.
- Fijar reglas de reserva: antelación mínima, ventana de reserva y máximo de citas por día.
- Activar reserva en línea y confirmación automática.
- Añadir, editar y quitar excepciones por fecha (feriados, cierres, jornadas cortas).
- Ver la vista previa de los horarios que genera la configuración antes de guardar.
- Restablecer la configuración por defecto.

---

## 4. Visitas

Contenedor de la atención: una visita agrupa todos los servicios de un cliente hasta que se factura.

- **Necesidad.** Que todo lo que se le hizo al paciente llegue a la cuenta, y que recepción sepa qué falta para poder cobrar.
- **Análisis.** La consulta, el baño, el examen y la vacuna ocurren en áreas distintas y a distinto ritmo; lo que no se anota en el momento se factura mal o no se factura.
- **Solución.** Una visita por cliente que reúne los servicios; cada servicio avanza en el kanban de su área y la visita solo se puede cobrar cuando todos terminaron.

**Funcionalidades**

- Abrir visita por cliente (check-in general); si ya tiene una abierta, se reutiliza.
- Agregar servicios en borrador: veterinaria, peluquería, laboratorio, medicamento o vacuna, con precio de catálogo.
- Asignar una mascota distinta a cada servicio dentro de la misma visita.
- Quitar un servicio de la visita; si ya estaba comenzado, también se elimina de su módulo.
- Comenzar la visita: cada servicio se crea en su módulo (tablero de estética, cola de laboratorio).
- Avanzar servicios sin módulo propio (veterinaria, medicamento, vacuna) desde la propia visita.
- Ver el subtotal de la atención y cuántos servicios faltan por terminar.
- Enviar recordatorio de deuda al dueño por WhatsApp.
- Pasar al cobro cuando todos los servicios están terminados.

**Submódulos**

### 4.1 Listado de visitas abiertas
Panel de recepción con todas las atenciones en curso.
- Ver cliente, hora de apertura, cantidad de servicios y total acumulado.
- Distinguir visitas en borrador de visitas comenzadas.
- Ver el avance (servicios terminados sobre el total) y si está lista para facturar.
- Abrir la visita o volver a editarla según su estado.
- Contador de visitas abiertas visible en el menú lateral.

### 4.2 Edición de la visita (borrador)
Armado de la atención antes de mandar los servicios a sus áreas.
- Ver cliente, teléfono, saldo anterior y número de servicios.
- Agregar servicio eligiendo mascota, tipo y ítem del catálogo con su precio.
- Quitar servicios con confirmación.
- Ver el subtotal en vivo.
- Pulsar "Comenzar" para enviar cada servicio a su módulo.

### 4.3 Seguimiento de la atención
Vista de la visita ya comenzada, con el kanban de cada servicio.
- Ver la columna actual de cada servicio dentro de su flujo.
- Avanzar los servicios que no tienen módulo propio.
- Saltar al tablero de peluquería o a laboratorio para gestionar los que sí lo tienen.
- Ver el subtotal y cuántos servicios faltan para poder cobrar.
- Recordar deuda por WhatsApp y pasar a cobrar y facturar.

---

## 5. Peluquería y Estética

Tablero operativo del área de estética, desde el check-in hasta la entrega.

- **Necesidad.** Saber qué mascota está en qué etapa, quién la atiende y cuándo avisar al dueño.
- **Análisis.** Es el área con más rotación y más llamadas de "¿ya está listo?"; también donde se pierden collares, correas y el cobro del servicio.
- **Solución.** Kanban de tres columnas con cronómetro, pertenencias registradas al ingreso, aviso al dueño al terminar y el cargo enviado solo a la cuenta de la visita.

**Funcionalidades**

- Registrar check-in: cliente, mascota, servicio del catálogo, peluquero y pertenencias.
- El check-in abre o reutiliza la visita del cliente y añade el servicio ya comenzado.
- Mover el trabajo entre pendiente, en proceso, terminado y entregado.
- Cronómetro en vivo mientras el servicio está en proceso y duración final al terminar.
- Aviso simulado por WhatsApp al dueño cuando la mascota está lista.
- Alerta de manejo con precaución en pacientes marcados como agresivos.
- Sin edición ni borrado del trabajo: se corrige quitando el servicio desde la visita.

**Submódulos**

### 5.1 Tablero kanban
Vista de operación del área, con las tres columnas del flujo.
- Ver cada mascota con servicio, dueño, precio, peluquero y pertenencias.
- Ver el contador de trabajos por columna.
- Iniciar servicio, terminar y notificar, o marcar entregado desde la tarjeta.
- Ver tiempo transcurrido en los servicios en proceso y duración de los terminados.
- Abrir el detalle del trabajo.

### 5.2 Check-in de estética
Registro de llegada para clientes que entran sin cita.
- Buscar el dueño y elegir su mascota.
- Elegir servicio del catálogo con precio (baño, corte, uñas, limpieza dental, guardería).
- Asignar peluquero.
- Anotar las pertenencias que deja el dueño.

### 5.3 Detalle del trabajo
Ficha completa de un servicio de estética.
- Ver mascota, dueño y teléfono, servicio, precio, peluquero y pertenencias.
- Ver estado, tiempo transcurrido o duración total.
- Ver la alerta de manejo con precaución si aplica.
- Avanzar el estado desde la misma ficha.

---

## 6. Clínica y Laboratorio

Expediente clínico del paciente y las acciones médicas que se cargan sobre él.

- **Necesidad.** Un historial confiable por paciente y que lo aplicado en consulta descuente stock y se cobre.
- **Análisis.** El historial en papel se pierde y no acompaña al paciente; los insumos aplicados en consulta son la fuga de dinero más común de la clínica.
- **Solución.** Historial estructurado e inalterable por paciente, con acciones médicas que descuentan inventario y cargan la visita en el mismo movimiento.

**Funcionalidades**

- Buscar paciente por nombre, especie, raza o dueño, con paginación.
- Registrar consulta: médico tratante, signos vitales (peso, temperatura, frecuencia cardíaca), anamnesis y diagnóstico.
- Aplicar insumo del inventario sobre la consulta activa: descuenta stock y carga la visita.
- Bloqueo si el stock es insuficiente; aviso automático cuando el producto queda bajo el mínimo.
- Generar orden de laboratorio del catálogo de exámenes; entra a la cola y se carga a la visita.
- Cargar el resultado del examen desde el expediente.
- Emitir receta digital (medicamento y posología) adjunta a la consulta activa.
- Historial inmutable: sin edición ni borrado de consultas, aplicaciones, órdenes ni recetas.

**Submódulos**

### 6.1 Listado de pacientes
Buscador de expedientes de toda la clínica.
- Buscar por nombre, especie, raza o nombre del dueño.
- Ver especie, raza, edad y dueño de cada paciente.
- Ver la fecha de la última consulta o el aviso de que no tiene ninguna.
- Ver alertas del paciente y abrir su expediente.

### 6.2 Expediente del paciente
Historia clínica completa, en orden cronológico inverso.
- Ver alergias y marca de agresividad del paciente.
- Ver cada consulta con fecha, médico, signos vitales, anamnesis y diagnóstico.
- Ver insumos aplicados y recetas emitidas dentro de cada consulta.
- Ver las órdenes de laboratorio del paciente y su estado.
- Lanzar nueva consulta, aplicar insumo, ordenar laboratorio o emitir receta.

### 6.3 Consulta médica
Registro de la atención veterinaria; abre la consulta activa del paciente.
- Elegir médico tratante.
- Cargar peso, temperatura y frecuencia cardíaca.
- Escribir anamnesis (lo que reporta el dueño) y diagnóstico presuntivo.
- Anamnesis y diagnóstico obligatorios para guardar.

### 6.4 Aplicación de insumos
Uso de productos del inventario durante la atención.
- Buscar el producto por nombre o categoría entre los que tienen stock.
- Elegir la cantidad aplicada.
- Descuento automático del inventario y cargo a la cuenta del cliente.
- Registro del insumo dentro de la consulta activa del expediente.

### 6.5 Órdenes de laboratorio
Solicitud de exámenes y captura de resultados.
- Generar orden eligiendo el examen del catálogo con su precio.
- La orden entra a la cola del laboratorio y se carga a la visita del cliente.
- Cargar el resumen del resultado desde el expediente.
- Al cargar el resultado, el servicio de la visita queda terminado.

### 6.6 Recetas digitales
Prescripción adjunta a la consulta activa del paciente.
- Registrar medicamento y posología.
- Envío simulado al correo y WhatsApp del dueño, con firma electrónica del veterinario.
- Requiere una consulta abierta del paciente.

---

## 7. Inventario

Catálogo de productos con control de stock, mínimos y caducidad.

- **Necesidad.** Saber qué hay, qué se está acabando y qué va a vencer, sin contar estantes.
- **Análisis.** Sin control, la clínica descubre el faltante con el paciente en la mesa y bota producto vencido que ya pagó.
- **Solución.** Catálogo con stock mínimo y fecha de caducidad por producto; el stock baja solo cuando se aplica en clínica y las alertas suben al dashboard.

**Funcionalidades**

- Crear producto: nombre, categoría, precio de venta, stock inicial, stock mínimo y caducidad.
- Editar producto (el stock no se edita a mano).
- Ingresar lote: suma unidades al stock.
- Buscar por nombre o categoría y filtrar por categoría, con paginación.
- Ver marca de stock bajo y de caducidad próxima (≤60 días) en la tabla y en la ficha.
- El stock solo baja por aplicación clínica, nunca por edición manual.
- Sin borrado de productos: se descontinúan dejando de reabastecerlos.

**Submódulos**

### 7.1 Catálogo
Tabla de trabajo del inventario, pensada para cientos de referencias.
- Buscar por nombre o categoría y filtrar por categoría.
- Ver stock actual contra mínimo, precio de venta y caducidad con días restantes.
- Señal visual de stock bajo y de caducidad próxima.
- Ver, editar o ingresar lote desde la misma fila.
- Crear producto nuevo.

### 7.2 Ficha del producto
Detalle de una referencia concreta.
- Ver categoría, stock contra mínimo, precio de venta y caducidad.
- Señal de stock bajo y de vencimiento próximo.
- Editar el producto o ingresar un lote.

### 7.3 Ingreso de lote
Entrada de mercadería sin tocar el stock a mano.
- Indicar las unidades del lote recibido.
- Suma al stock existente y confirma el nuevo total.
- Disponible desde la tabla y desde la ficha del producto.

---

## 8. Facturación

Cierre económico de la atención: de la visita terminada a la factura emitida.

- **Necesidad.** Cobrar completo, en un solo documento, incluyendo el saldo que el cliente arrastra.
- **Análisis.** Cuando cada área cobra por su lado, se olvidan ítems, los descuentos se aplican de memoria y la deuda anterior nunca se reclama.
- **Solución.** Cobro por visita: todos los servicios en una sola cuenta, descuento e IVA calculados, saldo anterior arrastrado y factura inmutable enviable por WhatsApp.

**Funcionalidades**

- Ver las visitas abiertas y su estado de avance, filtradas por cliente.
- Cobrar solo visitas con todos sus servicios terminados (bloqueo explícito si falta alguno).
- Aplicar descuento porcentual y activar o desactivar el IVA (15%).
- Elegir método de pago: efectivo, tarjeta o transferencia.
- Ver el desglose en vivo: subtotal, descuento, base imponible, IVA, saldo anterior y total.
- Emitir factura numerada; al emitirla se cierra la visita y se salda la deuda anterior.
- Ver el detalle de las facturas del día, con sus ítems y el área de origen de cada uno.
- Enviar la factura al dueño por WhatsApp.
- Facturas inmutables: sin edición ni anulación.

**Submódulos**

### 8.1 Worklist de cobro
Bandeja del día con lo que falta cobrar y lo ya cobrado.
- Buscar un cliente para ver solo sus visitas y facturas.
- Ver por visita: servicios, subtotal, deuda del cliente y avance.
- Distinguir visitas listas para cobrar de las que tienen servicios pendientes.
- Ver las facturas emitidas hoy con número, cliente, total, método y hora.
- Abrir el detalle de una visita o de una factura; ambas listas paginadas.

### 8.2 Cobro
Paso de liquidación sobre una visita terminada.
- Aplicar descuento en porcentaje (0–100).
- Activar o desactivar el IVA.
- Elegir el método de pago.
- Ver el total recalculado en vivo con el saldo anterior incluido.
- Emitir la factura o volver a la visita.

### 8.3 Factura emitida
Documento final, de solo lectura.
- Ver cliente, teléfono, método de pago y hora de emisión.
- Ver cada ítem con su área de origen y su importe.
- Ver subtotal, descuento, IVA, saldo anterior y total.
- Enviar la factura detallada al dueño por WhatsApp.

---

## 9. Finanzas

Lectura económica de la jornada: cuánto entró, cuánto queda y de dónde viene.

- **Necesidad.** Cerrar el día sabiendo el resultado real y cuánto está pendiente de cobro.
- **Análisis.** La clínica factura por servicios sueltos y rara vez sabe qué área sostiene el negocio ni cuánto efectivo debería haber en caja.
- **Solución.** Cuatro indicadores del día y dos gráficos —ingresos por área y arqueo por método de pago— calculados sobre las facturas emitidas.

**Funcionalidades**

- Ver ingresos facturados y número de facturas.
- Ver utilidad del día y margen sobre ventas.
- Ver IVA recaudado y su peso sobre las ventas.
- Ver el total por cobrar: deuda de clientes más visitas abiertas.
- Ver la distribución de ingresos por área y por método de pago.
- Solo lectura: no se cargan ni eliminan movimientos desde esta pantalla.

**Submódulos**

### 9.1 Indicadores del día
Los cuatro números que resumen la jornada económica.
- Ingresos facturados, con el número de facturas emitidas.
- Utilidad (ingresos menos gastos) y margen porcentual, en verde o rojo.
- IVA recaudado y su porcentaje sobre las ventas.
- Por cobrar: deuda acumulada de clientes más el valor de las visitas abiertas.

### 9.2 Ingresos por área
Qué parte del ingreso aporta cada área de la clínica.
- Distribución entre clínica, peluquería y laboratorio.
- Monto y porcentaje por área, ordenados de mayor a menor.
- Se alimenta de los ítems de las facturas emitidas.

### 9.3 Arqueo por método de pago
Cuánto debería haber en caja y cuánto entró por otros medios.
- Reparto entre efectivo, tarjeta y transferencia.
- Monto y porcentaje por método.
- Se alimenta del método de pago de cada factura.

---

## 10. Portales

Páginas públicas de la clínica, administradas desde el mismo panel.

- **Necesidad.** Tener presencia propia y una página por campaña sin depender de un proveedor externo cada vez.
- **Análisis.** La clínica comunica por redes y WhatsApp; para una promoción o una campaña de vacunación necesita una página propia y no tiene quién la haga.
- **Solución.** Portales autoadministrables con contenido en Markdown, logo y paleta de colores, publicados en el subdominio de la clínica bajo un slug único.

**Funcionalidades**

- Crear portal con nombre, slug, logo, paleta de tres colores y contenido en Markdown.
- Slug generado automáticamente desde el nombre y editable a mano.
- Validación de slug único: se rechaza si otro portal ya lo usa.
- Editar cualquier dato del portal.
- Eliminar portal con confirmación previa.
- Ver la URL pública en la que se publicará cada portal.

**Submódulos**

### 10.1 Listado de portales
Todas las páginas públicas de la clínica en una vista.
- Ver nombre, URL pública, logo y paleta de cada portal.
- Crear un portal nuevo.
- Ver, editar o eliminar cada portal.

### 10.2 Detalle del portal
Ficha de lectura de una página publicada.
- Ver slug, logo y paleta de colores.
- Ver el contenido en Markdown tal como se guardó.
- Editar o eliminar el portal, con confirmación en el borrado.

### 10.3 Editor del portal
Formulario compartido por el alta y la edición.
- Escribir el nombre; el slug se deriva solo hasta que se toca a mano.
- Ver en vivo la URL pública resultante.
- Cargar el logo por URL, con vista previa.
- Elegir color principal, de acento y de fondo con selector de color.
- Redactar el contenido de la página en Markdown.

---

## Alcance actual y límites conocidos

Lo que el análisis anterior **no** incluye porque hoy no existe en la plataforma:

- **Sin login ni roles.** La sesión de staff está fija; no hay usuarios ni permisos.
- **Agenda de un solo día.** Todas las pantallas trabajan sobre hoy; la antelación mínima y la ventana de reserva se guardan pero aún no se aplican.
- **WhatsApp simulado.** Solo el envío de factura y el recordatorio de deuda abren un enlace real; el resto son avisos de la demo.
- **Portales no publicados.** El panel administra el contenido; las páginas públicas y la reserva en línea todavía no se sirven.
- **Gastos sin pantalla.** La utilidad se calcula con gastos de ejemplo; no hay alta ni baja de gastos.
- **Deuda sin origen propio.** Facturación consume y salda el saldo anterior, pero ninguna pantalla lo genera.
- **Consulta y visita desacopladas.** Guardar la consulta en el expediente no mueve el servicio de veterinaria de la visita: ese avance se hace desde la visita.
- **Borrado casi inexistente por diseño.** Solo se eliminan portales y servicios de una visita; historial, facturas, clientes y productos no se borran.
