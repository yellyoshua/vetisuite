# Módulo 07: Inventario

## 1. Propósito y Valor
El módulo de Inventario controla el stock de medicamentos, vacunas, insumos quirúrgicos y productos de venta en mostrador. Su objetivo es evitar quiebres de stock durante procedimientos clínicos y prevenir pérdidas financieras por medicamentos vencidos en bodega, automatizando las alertas de reposición y asegurando que las existencias solo se reduzcan ante consumos médicos reales.

---

## 2. Usuarios y Roles
- **Administrador de Clínica**: Registra nuevos productos, fija precios de venta, define umbrales de stock mínimo y supervisa lotes próximos a caducar.
- **Personal de Recepción / Compras**: Da entrada a nuevas compras mediante ingresos de lote.
- **Veterinario**: Consulta existencias y consume insumos durante la consulta médica.

---

## 3. Flujo Operativo

```text
[Alta de Producto en Catálogo (Nombre, Categoría, Precio, Mínimo, Caducidad)]
                                   │
                                   ▼
          [Recepción de Mercancía: Ingreso de Lote (+ Unidades)]
                                   │
                                   ▼
        [Control Activo de Existencias y Monitor de Caducidad]
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
[Alerta: Stock Bajo / Vence ≤ 60d]         [Consumo Clínico en Consulta]
              │                                         │
              ▼                                         ▼
   [Reposición de Compra]                   [Descuento Automático de Stock]
```

---

## 4. Funcionalidades Clave
- **Catálogo maestro de insumos y fármacos**: Base de datos clasificada por categorías (fármacos, insumos, alimentos, accesorios) con precio al público y stock actual.
- **Control de stock mínimo de seguridad**: Configuración de un umbral numérico por producto que enciende insignias amarillas/rojas cuando las existencias caen a niveles de riesgo.
- **Vigilancia de fechas de caducidad**: Identificación automatizada de lotes con fecha de vencimiento menor o igual a 60 días, evitando aplicar productos caducados a los pacientes.
- **Ingreso formal de lotes**: Herramienta de recepción de mercadería que incrementa existencias de manera auditada sin permitir ediciones arbitrarias directas.
- **Búsqueda y filtros rápidos**: Localización ágil por nombre comercial, principio activo o categoría terapéutica.

---

## 5. Reglas de Negocio e Interconexiones
- **Descuento de stock exclusivamente justificado**: Las existencias de un producto no se pueden disminuir manualmente; solo se reducen cuando un veterinario aplica el producto dentro de una consulta médica en el módulo de Clínica.
- **Sin eliminación física de productos**: Un producto nunca se elimina de la base para mantener el histórico de compras y aplicaciones; si deja de usarse, simplemente no se generan nuevos ingresos de lote.
- **Conexión con el Dashboard**: Los productos con stock bajo o caducidad menor a 60 días alimentan de forma inmediata el panel de alertas operativas de la clínica.
