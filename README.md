# Aula de Actividades

Primer prototipo del portal educativo para usar actividades en vivo desde Chrome.

## Desarrollo

```bash
npm install
npm run dev
```

## Validacion local

```bash
npm test
npm run test:visual-system
npm run build
npm run preview
```

La PWA y el modo offline se validan mejor con `npm run build` + `npm run preview`,
porque los service workers no deben depender del servidor de desarrollo.

## Arquitectura del portal

- Las actividades se registran mediante `ActivityDefinition` y se cargan de
  forma diferida al abrirlas.
- Los flujos complejos de Tablero, Piramide y Guia usan reducers puros con
  comandos tipados.
- La aleatoriedad se inyecta mediante `RandomSource`, lo que permite repetir
  escenarios en pruebas.
- Las descargas offline pasan por una fachada y un adaptador de Service Worker;
  la interfaz se actualiza a partir de eventos observables de exito o error.
- Pronunciacion depende del contrato `TranscriptionEngine`, no directamente del
  worker de Whisper.

## Sistema visual

El portal comparte una identidad general y dos familias relacionadas:

- Lenguaje: Lectura de Piramide, Guia de Lenguaje y Pronunciacion.
- Matematica: Serpiente Matematica, Tablero de Operaciones y Piramide Aritmetica.

Los colores, tipografia, espaciado, superficies, foco y movimiento se definen en
`src/styles/tokens.css` y `src/styles/base.css`. Los patrones reutilizables viven
en `src/styles/components.css`; `src/styles/families.css` solo cambia los acentos
de area. Una actividad no debe redefinir el significado de acciones, feedback o
navegacion.

La validacion completa se documenta en
`../specs/005-refactor-visual/quickstart.md` e incluye 320, 375, 768, 1024 y
1366 px, teclado, zoom, movimiento reducido y modo offline.

### Cierre del refactor visual

Antes de declarar la especificacion UI-01 a UI-31 terminada:

1. Ejecutar `npm run preview` y completar una actividad de cada familia en los
   cinco anchos de la matriz responsive.
2. Repetir una pantalla con zoom real de Chrome al 200 %, solo teclado y la
   preferencia de movimiento reducido.
3. Descargar una actividad, desconectar la red y confirmar que abre. Intentar
   tambien una actividad no descargada y confirmar que explica como volver.
4. Realizar el guion sin ayuda con la usuaria principal y registrar tiempo,
   dudas, errores y comentarios.
5. Ejecutar la prueba de comprension con cinco personas; al menos cuatro deben
   identificar la accion principal en cinco segundos.

La evidencia y el estado actual estan en
`../specs/005-refactor-visual/evidence/` y
`../specs/005-refactor-visual/checklists/implementation.md`. Los puntos manuales
no deben aprobarse basandose solo en una simulacion automatizada.

## Guia visual

La referencia para revisar layouts, headers, botones, pantallas de actividad y
resultados esta en [`docs/guia-visual-qa.md`](docs/guia-visual-qa.md).

## Deploy en Cloudflare Workers

El portal se despliega como Worker con assets estaticos usando Wrangler.

```bash
npm run deploy
```

En entornos no interactivos, Wrangler requiere la variable `CLOUDFLARE_API_TOKEN`.
Para revisar la configuracion sin publicar:

```bash
npx wrangler deploy --dry-run
```
