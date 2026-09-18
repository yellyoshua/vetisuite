---
trigger: always_on
---

# Principios

Aplica a todo el monorepo.

1. **El código más barato es el que no se escribe.** Antes de agregar algo, preguntá si hace falta.
   Nada "para después": ni scaffolding, ni config para un valor que no cambia, ni interfaces con una
   sola implementación.
2. **Reusar antes que escribir.** Wrapper, hook, schema, constante o patrón que ya existe en el repo
   se usa. Reimplementar lo que está dos carpetas más allá es el error más común.
3. **Aburrido antes que ingenioso.** El código se lee a las 3 a.m. durante un incidente. Explícito,
   secuencial, de arriba abajo.
4. **Repetir está permitido; abstraer cuesta.** Se extrae cuando el patrón aparece 3+ veces **y** la
   extracción simplifica. Un helper con condicionales adentro es peor que la repetición.
5. **Cada capa hace una cosa.** Validar, autorizar, escribir, leer y pintar viven en lugares
   distintos y conocidos. Si no sabés dónde va algo, falta leer, no inventar una capa.
6. **Fallar fuerte.** Nada de `null` silencioso ni optional chaining defensivo sobre lo que una capa
   anterior garantiza. Si es `null` es un bug y tiene que explotar.
7. **Duplicar entre apps es la regla.** `app/`, `landing/`, `server/` y `cloudtasks/` no comparten
   código salvo `@brunerkids/db`. Si dos apps necesitan lo mismo, se copia.
