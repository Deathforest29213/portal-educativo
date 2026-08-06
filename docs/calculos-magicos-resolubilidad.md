# Resolubilidad de Círculos mágicos

## Regla pedagógica

Un círculo es aceptable solo cuando el niño puede resolver todas las casillas
usando la información visible. Esto exige tres condiciones simultáneas:

1. Cada ecuación usa únicamente números naturales: enteros desde `0`, sin
   resultados negativos, fraccionarios ni divisiones por cero.
2. Existe exactamente una solución para las casillas vacías dentro del rango
   de la actividad.
3. La solución se puede deducir progresivamente: al menos una ecuación debe
   determinar una casilla, y esa nueva información debe permitir continuar
   hasta completar el círculo. No se aceptan ejercicios que obliguen a probar
   números al azar.

## Límite de casillas vacías

| Casillas vacías | Combinaciones de posiciones en una cuadrícula de 9 | Estado |
| --- | ---: | --- |
| 3 | 84 | Permitidas; se validan antes de mostrarse. |
| 4 | 126 | Permitidas; se validan antes de mostrarse. |
| 5 | 126 | Permitidas; se validan antes de mostrarse. |
| 6 | 84 | No permitidas por la configuración. |
| 7 | 36 | No permitidas por la configuración. |

El máximo de cinco aplica a Fácil, Medio, Difícil y Personalizado. Fácil usa
tres por defecto; Medio y Difícil usan cinco.

## Operaciones por dificultad

| Dificultad | Operaciones disponibles |
| --- | --- |
| Fácil | Suma y resta. |
| Medio | Suma y resta. |
| Difícil | Suma, resta y multiplicación. |
| Personalizado | Solo las operaciones que el docente seleccione, incluida división si la activa. |

## Qué se considera imposible

Una posición de casillas no es imposible por sí sola: también dependen de los
números visibles y de las operaciones de sus seis ecuaciones. Por ello no se
mantiene una lista fija de posiciones prohibidas. Cada círculo candidato se
clasifica antes de entregarse:

- **Inconsistente:** ninguna combinación de números naturales satisface todas
  las ecuaciones.
- **Ambiguo:** dos o más combinaciones las satisfacen. Por ejemplo,
  `0 × □ = □` no determina por sí mismo el factor ni el resultado.
- **Sin deducción progresiva:** puede tener una respuesta única, pero ninguna
  ecuación disponible permite obtener la siguiente casilla sin adivinar.

Los tres casos se regeneran y nunca se presentan al niño.

## Cobertura automatizada

La prueba `src/activities/calculos-circulares/domain/puzzle.test.ts` revisa:

- Las **336** distribuciones posibles de 3, 4 y 5 casillas vacías (`84 + 126
  + 126`) frente a un círculo multiplicativo que incluye posiciones ambiguas:
  **166** resultan deducibles y **170** se rechazan.
- **150** círculos generados desde los 15 subconjuntos no vacíos de suma,
  resta, multiplicación y división; se combinan rangos de 0–10, 0–20 y 0–30,
  tres cantidades de casillas y semillas deterministas.
- Un caso ambiguo y otro inconsistente para comprobar que el clasificador los
  rechaza.

En total se evalúan al menos **486 combinaciones** de resolubilidad, además de
las comprobaciones habituales de ecuaciones y resultados naturales.
