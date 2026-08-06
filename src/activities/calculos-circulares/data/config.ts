import type { CircularActivitySettings, CircularDifficulty, CircularDifficultyKey } from '../types'

export const MAX_CIRCULAR_NUMBER = 30
export const MIN_CIRCULAR_NUMBER = 1
export const MIN_EMPTY_CELLS = 3
export const MAX_EMPTY_CELLS = 5
export const CIRCULAR_SESSION_ROUNDS = 5
export const MIN_CIRCULAR_SESSION_GOAL = 1
export const MAX_CIRCULAR_SESSION_GOAL = 10

export const CUSTOM_CIRCULAR_DEFAULTS: CircularActivitySettings = {
  emptyCells: 5,
  maxNumber: 20,
  operations: ['+', '-', 'x'],
  sessionGoal: CIRCULAR_SESSION_ROUNDS,
}

export const CIRCULAR_DIFFICULTIES: CircularDifficulty[] = [
  {
    key: 'easy',
    label: 'Fácil',
    description: 'Tres casillas para practicar sumas y restas con calma.',
    maxNumber: 10,
    operations: ['+', '-'],
    emptyCells: 3,
    sessionGoal: CIRCULAR_SESSION_ROUNDS,
    rangeLabel: 'Números de 0 a 10',
    tone: '#2f9e44',
  },
  {
    key: 'medium',
    label: 'Medio',
    description: 'Cinco casillas para practicar sumas y restas con más desafío.',
    maxNumber: 20,
    operations: ['+', '-'],
    emptyCells: 5,
    sessionGoal: CIRCULAR_SESSION_ROUNDS,
    rangeLabel: 'Números de 0 a 20',
    tone: '#1971c2',
  },
  {
    key: 'hard',
    label: 'Difícil',
    description: 'Cinco casillas con sumas, restas y multiplicaciones hasta el 30.',
    maxNumber: 30,
    operations: ['+', '-', 'x'],
    emptyCells: 5,
    sessionGoal: CIRCULAR_SESSION_ROUNDS,
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
  custom: CircularActivitySettings = CUSTOM_CIRCULAR_DEFAULTS,
): CircularDifficulty {
  if (key !== 'custom') {
    return CIRCULAR_DIFFICULTIES.find((difficulty) => difficulty.key === key) ?? CIRCULAR_DIFFICULTIES[0]
  }

  const maxNumber = clamp(custom.maxNumber, MIN_CIRCULAR_NUMBER, MAX_CIRCULAR_NUMBER)
  const emptyCells = clamp(custom.emptyCells, MIN_EMPTY_CELLS, MAX_EMPTY_CELLS)
  const sessionGoal = clamp(custom.sessionGoal, MIN_CIRCULAR_SESSION_GOAL, MAX_CIRCULAR_SESSION_GOAL)

  return {
    key: 'custom',
    label: 'Personalizado',
    description: 'Elige rango, operaciones y cuántas casillas completar.',
    maxNumber,
    operations: custom.operations,
    emptyCells,
    sessionGoal,
    rangeLabel: `Números de 0 a ${maxNumber}`,
    tone: '#7e57c2',
  }
}

function clamp(value: number, minimum: number, maximum: number) {
  const safeValue = Number.isFinite(value) ? Math.trunc(value) : minimum
  return Math.max(minimum, Math.min(maximum, safeValue))
}
