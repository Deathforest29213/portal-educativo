# Guia visual y QA del portal

Esta guia define como debe verse el portal educativo y como revisar las
actividades antes de cerrar cambios. Sirve como referencia para futuras
iteraciones, migraciones y correcciones visuales.

## Principios visuales

- El portal debe sentirse limpio, ordenado y util para una profesora en clase.
- Los colores globales del portal usan grafito oscuro `#171B22` y amarillo
  escolar `#F2C230`; cada actividad puede conservar su estilo propio si ayuda a
  respetar el material original.
- Las actividades deben mantener imagenes, sonidos, logica y distribucion del
  material fuente cuando corresponda. Solo se adapta lo necesario para que
  funcione bien dentro del portal.
- No debe existir overflow horizontal en desktop ni en pantalla chica.
- Los textos visibles deben ser breves, en espanol chileno y sin instrucciones
  tecnicas.

## Header de actividades

- El titulo de la actividad va centrado en el header.
- Las acciones globales van a la derecha en este orden: area, descarga e Inicio.
- El boton Inicio siempre vuelve al menu principal del portal.
- Los botones internos no deben decir Inicio. Deben usar textos de contexto:
  `Volver a la lectura`, `Volver al menu` o `Volver a niveles`.
- El boton de descarga mantiene estados claros: `Descargar`, `Descargando` y
  `Descargada`.

## Tarjetas del portal

- Cada actividad se presenta como tarjeta.
- La version debe ir en una casilla no oprimible junto al boton Abrir.
- No se muestran rutas de archivos fuente como `Lectura de piramide/` o
  `serpiente/Serpiente.html`.
- Las secciones principales actuales son Lenguaje y Matematica.

## Menus de actividades

- Cada actividad debe tener un menu inicial propio cuando tenga modos, tareas o
  niveles.
- Las tarjetas de menu deben ser claras, con imagen o senal visual del contenido.
- La Guia de Lenguaje muestra sus tareas y una accion para hacer la guia
  completa en secuencia.
- Serpiente Matematica muestra los tres niveles y conserva sus colores y efectos
  originales, con adaptaciones responsivas del portal.

## Pantallas de trabajo

- Cuando una actividad usa dos zonas principales, deben ser layouts separados.
  Ejemplo: panel de imagen/lectura a la izquierda y panel de pregunta o
  alternativas a la derecha.
- Las alternativas deben compartir un sistema visual coherente entre actividades:
  tarjetas grandes, seleccion clara, estado correcto/incorrecto y avance
  comprensible.
- En Lectura en Piramide, el panel derecho debe igualar la altura del panel
  izquierdo en pantalla de preguntas.
- En Guia de Lenguaje, los fragmentos usados se marcan en verde, tachados e
  inhabilitados visualmente, pero pueden volver a tocarse para quitarse del
  texto.
- En Serpiente Matematica, la operacion y la casilla del numero incognito deben
  ser grandes y legibles; el teclado no debe cambiar de tamano.

## Pantallas finales

- Los resultados deben quedar centrados dentro del layout de la actividad.
- Si hay contenido largo, como la serpiente final, el scroll debe ocurrir dentro
  del componente correspondiente y no en toda la pagina horizontalmente.
- Debe existir una accion clara para repetir o volver al menu interno.

## Checklist de revision visual

Antes de cerrar una entrega, revisar:

- `npm run build` termina sin errores.
- El portal abre en desktop y pantalla chica.
- Home no tiene overflow horizontal.
- Lectura en Piramide: menu, lectura guiada, preguntas y feedback.
- Guia de Lenguaje: menu, tarea 1, tarea 2 con fragmentos, tarea 3 con
  alternativas y feedback.
- Serpiente Matematica: menu de niveles, facil, medio, dificil, teclado y
  resultado final.
- No hay imagenes rotas.
- No hay botones o tarjetas fuera de pantalla.
- Los botones internos de vuelta no se confunden con Inicio del portal.
- La consola del navegador no muestra errores de runtime.
