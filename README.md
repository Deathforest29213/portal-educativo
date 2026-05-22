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
