import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const distDir = path.join(rootDir, 'dist')
const publicDir = path.join(rootDir, 'public')
const outputFile = path.join(distDir, 'aula-actividades-standalone.html')

const mimeTypes = new Map([
  ['.css', 'text/css'],
  ['.js', 'text/javascript'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
])

let html = await readFile(path.join(distDir, 'index.html'), 'utf8')

html = html.replace(/\s*<link rel="manifest"[^>]*>\n?/g, '')

html = await inlineIcon(html)
html = await inlineCss(html)
html = await inlineJavaScript(html)

await writeFile(outputFile, html, 'utf8')

console.log(`Standalone HTML generado en ${outputFile}`)

async function inlineIcon(sourceHtml) {
  const iconPath = path.join(distDir, 'icons', 'aula-icon.svg')
  const iconData = await toDataUrl(iconPath)

  return sourceHtml.replace(
    /<link rel="icon" href="\/icons\/aula-icon\.svg" type="image\/svg\+xml" \/>/,
    () => `<link rel="icon" href="${iconData}" type="image/svg+xml" />`,
  )
}

async function inlineCss(sourceHtml) {
  const cssMatch = sourceHtml.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)
  if (!cssMatch) {
    throw new Error('No se encontro el CSS generado por Vite en dist/index.html')
  }

  const cssPath = path.join(distDir, cssMatch[1].replace(/^\//, ''))
  const css = await readFile(cssPath, 'utf8')

  return sourceHtml.replace(cssMatch[0], () => `<style>\n${css}\n</style>`)
}

async function inlineJavaScript(sourceHtml) {
  const jsMatch = sourceHtml.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
  if (!jsMatch) {
    throw new Error('No se encontro el JavaScript generado por Vite en dist/index.html')
  }

  const jsPath = path.join(distDir, jsMatch[1].replace(/^\//, ''))
  let js = await readFile(jsPath, 'utf8')
  js = await inlinePublicImages(js)

  const standaloneGuard = 'window.__PORTAL_STANDALONE__=true;'
  return sourceHtml.replace(
    jsMatch[0],
    () => `<script type="module">\n${standaloneGuard}\n${js}\n</script>`,
  )
}

async function inlinePublicImages(sourceJs) {
  const assetDirs = [
    ['lectura-piramide/images', ['.webp']],
    ['guia-lenguaje/images', ['.webp']],
    ['serpiente/assets', ['.svg']],
  ]
  let nextJs = sourceJs

  for (const [assetDir, extensions] of assetDirs) {
    const absoluteDir = path.join(publicDir, assetDir)
    const assetFiles = await readdir(absoluteDir)

    for (const fileName of assetFiles.filter((file) => extensions.includes(path.extname(file)))) {
      const webPath = `/${assetDir}/${fileName}`
      const dataUrl = await toDataUrl(path.join(absoluteDir, fileName))
      nextJs = nextJs.split(webPath).join(dataUrl)
    }
  }

  return nextJs
}

async function toDataUrl(filePath) {
  const extension = path.extname(filePath)
  const mimeType = mimeTypes.get(extension)

  if (!mimeType) {
    throw new Error(`Tipo de archivo no soportado para standalone: ${filePath}`)
  }

  const fileBuffer = await readFile(filePath)
  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`
}
