# Módulo 06: Clínica y Laboratorio

## 1. Propósito y Valor
El módulo de Clínica y Laboratorio concentra el acto médico veterinario y las pruebas diagnósticas. Proporciona un expediente clínico inalterable por paciente, permitiendo documentar consultas con signos vitales, emitir órdenes de laboratorio, prescribir recetas y aplicar medicamentos o insumos clínicos directamente sobre la consulta activa, descontando inventario y sumando el valor a la cuenta del cliente de forma automatizada.

---

## 2. Usuarios y Roles
- **Médico Veterinario**: Documenta la consulta, examina signos vitales, prescribe recetas, aplica medicamentos y solicita exámenes.
- **Personal de Laboratorio / Auxiliar**: Recibe las órdenes de análisis en cola y registra los resultados de las pruebas.
- **Recepción**: Consulta el historial médico en caso de requerimiento del cliente o para emisión de copias.

---

## 3. Flujo Operativo

```text
[Búsqueda de Paciente ➔ Apertura de Expediente Clínico]
                         │
                         ▼
[Registro de Consulta Médica] (Signos Vitales + Anamnesis + Diagnóstico)
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
[Aplicación de Insumos] [Orden de Laboratorio] [Receta Digital]
(Descuenta stock y      (Ingresa a cola y      (Medicamento y
 carga a la Visita)      carga a la Visita)     posología adjunta)
                         │               │
                         │               ▼
                         │       [Carga de Resultado]
                         │               │
                         └───────┬───────┘
                                 ▼
         [Historial Clínico Consolidado e Inmutable]
```

---

## 4. Funcionalidades Clave
- **Expediente clínico cronológico**: Historial médico inalterable del paciente con consultas anteriores, diagnósticos, tratamientos y exámenes organizados del más reciente al más antiguo.
- **Registro estructurado de consulta**: Captura de médico tratante, signos vitales obligatorios (peso en kg, temperatura en °C, frecuencia cardíaca en lpm), anamnesis relatada por el dueño y diagnóstico profesional.
- **Aplicación directa de insumos clínicos**: Búsqueda en vivo de productos del inventario (antibióticos, jeringas, vacunas) aplicados durante la atención médica; descuenta existencias inmediatamente y añade el importe a la visita abierta.
- **Órdenes y resultados de laboratorio**: Catálogo de exámenes de sangre, orina o imágenes; genera la orden que queda en cola diagnóstica y se marca como lista al cargar los hallazgos.
- **Recetario médico digital**: Emisión de recetas con fármacos y posología detallada, vinculadas de forma permanente a la consulta médica.

---

## 5. Reglas de Negocio e Interconexiones
- **Inmutabilidad médica (No editable / No eliminable)**: Una vez guardada una consulta médica, receta, orden o aplicación de fármaco, el registro no puede ser alterado ni borrado, garantizando seguridad legal y trazabilidad ética.
- **Control estricto de inventario**: La aplicación de un medicamento valida en tiempo real la existencia en inventario; si el stock es cero, bloquea la aplicación para evitar inconsistencias de almacén.
- **Interconexión con Visitas**: Todo examen solicitado o fármaco aplicado se incorpora automáticamente a la cuenta de la *Visita* del cliente para su cobro final.
- **Conexión con Dashboard**: Los insumos aplicados que hagan caer el stock por debajo del límite mínimo disparan de inmediato una alerta en el panel principal.
