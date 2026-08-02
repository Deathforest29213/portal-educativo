import type { CircularDifficulty, CircularDifficultyKey, CircularSettings } from '../types'

export const MAX_CIRCULAR_NUMBER = 30
export const MIN_CIRCULAR_NUMBER = 1
export const MIN_EMPTY_CELLS = 3
export const MAX_EMPTY_CELLS = 7
export const CIRCULAR_SESSION_ROUNDS = 5

export const CUSTOM_CIRCULAR_DEFAULTS: CircularSettings = {
  emptyCells: 5,
  maxNumber: 20,
  operations: ['+', '-', 'x'],
}

export const CIRCULAR_DIFFICULTIES: CircularDifficulty[] = [
  {
    key: 'easy',
    label: 'Fácil',
    description: 'Tres casillas para practicar sumas y restas con calma.',
    maxNumber: 10,
    operations: ['+', '-'],
    emptyCells: 3,
    rangeLabel: 'Números de 0 a 10',
    tone: '#2f9e44',
  },
  {
    key: 'medium',
    label: 'Medio',
    description: 'Cinco casillas y multiplicaciones para conectar operaciones.',
    maxNumber: 20,
    operations: ['+', '-', 'x'],
    emptyCells: 5,
    rangeLabel: 'Números de 0 a 20',
    tone: '#1971c2',
  },
  {
    key: 'hard',
    label: 'Difícil',
    description: 'Siete casillas y divisiones exactas hasta el 30.',
    maxNumber: 30,
    operations: ['+', '-', 'x', '/'],
    emptyCells: 7,
    rangeLabel: 'Números de 0 a 30',
    tone: '#c2410c',
  },
  {
    key: 'custom',
    label: 'Personalizado',
    description: 'Elige rango, operaciones y cuántas casillas completar.',
    ...CUSTOM_CIRCULAR_DEFAULTS,
    rangeLabel: 'Configuración a elección',
    tone: '#7e57c2',
  },
]

export function getCircularDifficulty(
  key: CircularDifficultyKey,
  custom: CircularSettings = CUSTOM_CIRCULAR_DEFAULTS,
): CircularDifficulty {
  if (key !== 'custom') {
    return CIRCULAR_DIFFICULTIES.find((difficulty) => difficulty.key === key) ?? CIRCULAR_DIFFICULTIES[0]
  }

  const maxNumber = clamp(custom.maxNumber, MIN_CIRCULAR_NUMBER, MAX_CIRCULAR_NUMBER)
  const emptyCells = clamp(custom.emptyCells, MIN_EMPTY_CELLS, MAX_EMPTY_CELLS)

  return {
    key: 'custom',
    label: 'Personalizado',
    description: 'Elige rango, operaciones y cuántas casillas completar.',
    maxNumber,
    operations: custom.operations,
    emptyCells,
    rangeLabel: `Números de 0 a ${maxNumber}`,
    tone: '#7e57c2',
  }
}

function clamp(value: number, minimum: number, maximum: number) {
  const safeValue = Number.isFinite(value) ? Math.trunc(value) : minimum
  return Math.max(minimum, Math.min(maximum, safeValue))
}
