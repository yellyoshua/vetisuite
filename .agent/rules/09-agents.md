---
trigger: always_on
---

# Agentes

Aplica a todo agente que modifique el repositorio.

1. **Leer antes de escribir.** Leé la guía de arquitectura del repo y el código que vas a tocar.
   Buscá un módulo hermano (`meetings`, `education-levels`) y copiá su forma exacta antes de inventar
   una.
2. **Seguir el flujo completo.** Un cambio de API toca ruta, schema, permisos, service/repository,
   `service()` de la SPA y posiblemente un delta. Recorré la cadena de punta a punta.
3. **Bug = causa raíz.** Antes de editar una función compartida, buscá todos sus consumidores. Un
   arreglo en el lugar compartido es mejor que un parche en cada llamador.
4. **Diff mínimo y en alcance.** Hacé lo pedido. Sin refactors, renombres ni "mejoras" no pedidas;
   si ves algo, mencionalo.
5. **Sin archivos nuevos que no hagan falta.** Ni README, ni docs, ni helpers, ni Dockerfiles, ni
   configs. Ninguna dependencia nueva sin que se pida.
6. **No toques lo reservado**: migraciones existentes, `CLAUDE.md`, `AGENTS.md`, límites de ESLint,
   `.env*` versionados, infraestructura en la nube.
7. **No silencies al verificador.** Nada de `eslint-disable`, `.skip`, ni bajar una aserción para que
   pase.
8. **Git solo si se pide.** Sin `add`, `commit`, `push` ni cambios de rama por iniciativa propia.
9. **Verificá y reportá honesto.** Corré lint y tests del workspace tocado. Si algo falla o quedó sin
   hacer, decilo con el output; no lo presentes como terminado.
10. **Preguntá solo lo que es decisión del usuario.** Lo que resuelve el código, el repo o una
    convención existente, lo resolvés vos.

## Checklist antes de entregar

- [ ] ¿Reusé wrappers (`baseRoute`, `repository()`, `service()`, hooks) en vez de reimplementar?
- [ ] ¿Cada capa hace solo lo suyo? ¿La ruta no importa la base?
- [ ] ¿Filtros campo por campo, dueño desde la sesión, permisos declarados?
- [ ] ¿Nombres alineados en API, permisos y SPA?
- [ ] ¿Sin `let`, sin `else` tras `return`, sin anidación > 2, sin código muerto?
- [ ] ¿Errores como `{error, status}` en español?
- [ ] ¿Lint y tests en verde?
- [ ] ¿El diff contiene solo lo pedido?
