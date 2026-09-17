# VetiSuite — Centro de Documentación

Bienvenido al centro de documentación de **VetiSuite**, la plataforma integral de gestión para clínicas veterinarias en modalidad SaaS.

La documentación se encuentra organizada en dos grandes áreas claramente diferenciadas:

```text
docs/
├── product/       ➔ Documentación de Producto, Negocio y Operación
└── technical/     ➔ Arquitectura Técnica, Infraestructura y Código
```

---

## 1. [Documentación de Producto (`docs/product/`)](./product/README.md)
Diseñada para fundadores, product managers, equipo de operaciones y nuevos integrantes del equipo comercial. Describe qué es VetiSuite, qué valor entrega a las clínicas, cómo monetiza y cómo opera cada uno de sus módulos:

- [**Índice de Producto**](./product/README.md): Guía de lectura y mapa integral de producto.
- [**00. Visión y Propósito**](./product/00-overview.md): Propuesta de valor, problemas que resuelve y pilares operativos.
- [**01. Modelo de Negocio SaaS**](./product/01-business-model.md): Estructura de suscripción modular y por consumo (plan base + add-ons activables).
- [**02. Roles y Tipos de Usuario**](./product/02-user-roles.md): Perfiles de acceso, necesidades y responsabilidades por rol.
- [**03. Mercado y Oportunidades**](./product/03-market-and-opportunities.md): Comparativa competitiva (benchmarking frente a OkVet), ventajas y roadmap de innovación.
- [**Módulos del Sistema (`docs/product/modules/`)](./product/modules/): Documentos independientes y resumidos de los 10 módulos funcionales con sus respectivos flujos operativos con flechas.

---

## 2. [Documentación Técnica (`docs/technical/`)](./technical/00-overview.md)
Diseñada para el equipo de ingeniería, DevOps y arquitectura de software. Detalla la implementación en código, infraestructura y despliegue:

- [**Arquitectura General**](./technical/00-overview.md): Visión global de la pila tecnológica y servicios.
- [**Estructura del Monorepo**](./technical/01-monorepo-structure.md): Organización de workspaces (client, server, landing).
- [**Aplicación Cliente**](./technical/03-client.md): SPA en React, Vite y Tailwind.
- [**Servidor API**](./technical/04-server-nitro.md): Endpoints y servicios en Nitro y Drizzle.
- [**Modelo de Datos**](./technical/08-data-model.md): Esquemas de bases de datos PostgreSQL.
- [**Infraestructura y Despliegue**](./technical/infrastructure/00-overview.md): Terraform, AWS Lambda, Amplify y CI/CD.
