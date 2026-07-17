import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')
const failures = []

function requirePattern(path, pattern, label) {
  const content = read(path)
  if (!pattern.test(content)) failures.push(`${path}: falta ${label}`)
}

function forbidPattern(path, pattern, label) {
  const content = read(path)
  if (pattern.test(content)) failures.push(`${path}: contiene ${label}`)
}

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function luminance(hex) {
  const channels = hexToRgb(hex).map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrastRatio(foreground, background) {
  const first = luminance(foreground)
  const second = luminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

function requireContrast(label, foreground, background, minimum = 4.5) {
  const ratio = contrastRatio(foreground, background)
  if (ratio < minimum) {
    failures.push(`${label}: contraste ${ratio.toFixed(2)}:1, mínimo ${minimum}:1`)
  }
}

const requiredTokens = [
  '--color-page',
  '--color-surface',
  '--color-text',
  '--color-language',
  '--color-math',
  '--color-success',
  '--color-danger',
  '--font-size-display',
  '--space-4',
  '--radius-md',
  '--touch-target',
]

for (const token of requiredTokens) {
  requirePattern('src/styles/tokens.css', new RegExp(`${token}\\s*:`), `token ${token}`)
}

requirePattern('src/styles/base.css', /:focus-visible/, 'foco visible global')
requirePattern('src/styles/base.css', /prefers-reduced-motion:\s*reduce/, 'movimiento reducido')
requirePattern('src/styles/components.css', /min-height:\s*var\(--touch-target\)/, 'objetivo táctil compartido')
requirePattern('src/styles/families.css', /activity-view--language/, 'familia Lenguaje')
requirePattern('src/styles/families.css', /activity-view--math/, 'familia Matemática')
requirePattern('src/app/components/ConfirmDialog.tsx', /<dialog/, 'diálogo nativo')
requirePattern('src/app/components/FeedbackBanner.tsx', /role=\{role\}/, 'región viva de feedback')
requirePattern(
  'src/app/loading/ActivityLoadingSingleton.ts',
  /class ActivityLoadingSingleton[\s\S]*static getInstance\(\)/,
  'Singleton compartido de carga de actividades',
)
requirePattern(
  'src/app/components/ActivityLoadingScreen.tsx',
  /aria-busy="true"[\s\S]*role="status"/,
  'estado de carga accesible de actividades',
)
requirePattern(
  'src/styles/components.css',
  /@keyframes activity-loading-progress/,
  'animación compartida de carga de actividades',
)
requirePattern(
  'src/activities/lectura-piramide/screens/QuizScreen.tsx',
  /nextQuestionButtonRef[\s\S]*\.focus\(\)[\s\S]*ref=\{nextQuestionButtonRef\}/,
  'traslado de foco a Siguiente pregunta en Lectura en Pirámide',
)
requirePattern(
  'src/activities/guia-lenguaje/GuiaLenguajeActivity.tsx',
  /nextQuestionButtonRef[\s\S]*\.focus\(\)[\s\S]*ref=\{nextQuestionButtonRef\}/,
  'traslado de foco a Siguiente pregunta en Guía de Lenguaje',
)
requirePattern(
  'src/activities/guia-lenguaje/data/content.ts',
  /image:\s*task1Parts\[[12]\]\.image/g,
  'asociación explícita de imágenes en Cartas de Teodoro',
)
requirePattern(
  'src/styles/portal.css',
  /\.guide-reading-copy-card\s*\{[\s\S]*max-width:\s*none/,
  'columna de texto completa en Cartas de Teodoro',
)
requirePattern(
  'src/app/ActivityHost.tsx',
  /<DownloadButton[\s\S]*aria-label="Cerrar actividad"[\s\S]*variant="danger"/,
  'cierre inequívoco junto a descarga en todas las actividades',
)
requirePattern(
  'src/styles/components.css',
  /\.activity-header__close\s*\{[\s\S]*border-color:\s*var\(--color-danger\)[\s\S]*border-radius:\s*var\(--radius-md\)[\s\S]*background:\s*var\(--color-danger-soft\)[\s\S]*color:\s*var\(--color-danger\)/,
  'cierre rojo suave con bordes redondeados',
)
forbidPattern(
  'src/app/ActivityHost.tsx',
  /ArrowLeft|activity-header__back|>\s*Volver al portal\s*</,
  'navegación ambigua Volver al portal en el encabezado',
)
requirePattern(
  'src/activities/guia-lenguaje/GuiaLenguajeActivity.tsx',
  /window\.scrollTo\([\s\S]*\}, \[stage, task1Mode\]\)/,
  'scroll estable durante avances dentro de una tarea de Guía de Lenguaje',
)
requirePattern(
  'src/activities/operaciones-tablero/OperacionesTableroActivity.tsx',
  /function returnToMenu\(\)[\s\S]*screen === 'playing'[\s\S]*requestFinishGame\(\)[\s\S]*resetGame\(\)[\s\S]*onClick=\{returnToMenu\}/,
  'confirmación al volver al menú durante una partida de Tablero',
)
requirePattern(
  'src/activities/operaciones-tablero/domain/gameState.ts',
  /case 'CONFIRM_FINISH':[\s\S]*return returnToSetup\(state\)/,
  'regreso al menú al confirmar el fin de una partida de Tablero',
)
requirePattern(
  'src/activities/operaciones-tablero/OperacionesTableroActivity.tsx',
  /<aside className="board-turn-panel">[\s\S]*board-points-card[\s\S]*Puntos y progreso[\s\S]*board-points-summary[\s\S]*\+1[\s\S]*Casilla[\s\S]*\+2[\s\S]*Línea de 3[\s\S]*Marcadas[\s\S]*board-dice-panel/,
  'resumen minimalista de puntaje sobre los controles de Tablero',
)
forbidPattern(
  'src/activities/operaciones-tablero/OperacionesTableroActivity.tsx',
  /board-turn-player|board-operation-roll|Dado de signo|Jugador actual/,
  'información duplicada en el panel de juego de Tablero',
)
forbidPattern(
  'src/styles/portal.css',
  /\.board-(?:turn-player|operation-roll)/,
  'estilos del jugador y dado duplicados en Tablero',
)
forbidPattern(
  'src/activities/piramide-aritmetica/piramide-aritmetica.css',
  /\.pyramid-block\.is-clue::after[\s\S]*content:\s*["']Pista["']/,
  'etiqueta visual Pista en Pirámide Aritmética',
)
requirePattern(
  'src/activities/piramide-aritmetica/PiramideAritmeticaActivity.tsx',
  /ArrowDown[\s\S]*ArrowUp[\s\S]*Completa cada bloque sumando los dos de abajo\.[\s\S]*Resta al bloque de arriba el número conocido\.[\s\S]*pyramid-instruction[\s\S]*operationMode === 'sum'[\s\S]*<ArrowUp[\s\S]*<ArrowDown/,
  'instrucciones breves con flechas dinámicas en Pirámide Aritmética',
)
forbidPattern(
  'src/activities/piramide-aritmetica/PiramideAritmeticaActivity.tsx',
  /Estado del ejercicio/,
  'encabezado redundante en la instrucción de Pirámide Aritmética',
)
forbidPattern(
  'src/activities/operaciones-tablero/OperacionesTableroActivity.tsx',
  /board-status-metrics/,
  'indicadores de puntaje en el encabezado de Tablero',
)
forbidPattern(
  'src/activities/operaciones-tablero/OperacionesTableroActivity.tsx',
  /board-finish-step|board-end-button|>\s*Finalizar\s*<|>\s*Terminar juego\s*</,
  'tarjeta redundante Finalizar en Tablero de Operaciones',
)
forbidPattern(
  'src/styles/components.css',
  /\.board-(?:choice-grid|player-count)[^\{]*is-selected::after/,
  'etiqueta visual Seleccionado en la configuración de Tablero',
)
forbidPattern(
  'src/styles/portal.css',
  /board-(?:finish-step|end-button|modal-backdrop|confirm-modal|confirm-actions)/,
  'estilos obsoletos del cierre redundante de Tablero',
)
requirePattern(
  'src/activities/serpiente/SerpienteMatematicaActivity.tsx',
  /aria-live="polite"[\s\S]*className="sr-only"/,
  'feedback accesible y no intrusivo de Serpiente',
)
forbidPattern(
  'src/activities/serpiente/SerpienteMatematicaActivity.tsx',
  /FeedbackBanner/,
  'banner visual de respuesta en Serpiente',
)
requirePattern(
  'src/styles/components.css',
  /\.snake-answer-grid button\.is-wrong::after\s*\{[\s\S]*content:\s*" ✕"/,
  'señal no cromática para respuesta incorrecta de Serpiente',
)
requirePattern(
  'public/sw.js',
  /key !== CACHE_NAME && !key\.startsWith\(ACTIVITY_CACHE_PREFIX\)/,
  'persistencia de actividades descargadas al actualizar el service worker',
)

const contrastPairs = [
  ['texto/página', '#172033', '#f5f7fb'],
  ['texto/superficie', '#172033', '#ffffff'],
  ['texto secundario/superficie', '#566176', '#ffffff'],
  ['acción primaria', '#ffffff', '#243b53'],
  ['familia Lenguaje', '#ffffff', '#0f766e'],
  ['familia Matemática', '#ffffff', '#a84b12'],
  ['estado correcto', '#15803d', '#e9f8ee'],
  ['estado incorrecto', '#b42318', '#fff0ee'],
]

for (const [label, foreground, background] of contrastPairs) {
  requireContrast(label, foreground, background)
}

for (const stylesheet of [
  'src/styles/portal.css',
  'src/activities/lectura-piramide/lectura-piramide.css',
  'src/activities/piramide-aritmetica/piramide-aritmetica.css',
]) {
  forbidPattern(
    stylesheet,
    /(?:^|\n)\s*--(?:color|font-size|space|radius|shadow|touch-target)-[^:]+:/,
    'tokens compartidos redefinidos fuera de tokens.css',
  )
}

forbidPattern('src/styles/portal.css', /^:root\s*\{/m, 'un segundo bloque global :root')

const entry = read('src/styles.css')
const imports = ['tokens.css', 'base.css', 'portal.css', 'families.css', 'components.css']
let previous = -1
for (const imported of imports) {
  const index = entry.indexOf(imported)
  if (index < 0 || index < previous) failures.push(`src/styles.css: orden inválido para ${imported}`)
  previous = index
}

if (failures.length > 0) {
  console.error(`Visual system validation failed (${failures.length})`)
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`Visual system validation passed (${requiredTokens.length + 48} checks)`)
