# Aula de Actividades

Primer prototipo del portal educativo para usar actividades en vivo desde Chrome.

## Desarrollo

```bash
npm install
npm run dev
```

## Validacion local

```bash
npm run build
npm run preview
```

La PWA y el modo offline se validan mejor con `npm run build` + `npm run preview`,
porque los service workers no deben depender del servidor de desarrollo.
