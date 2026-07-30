import type { CustomDifficultySettings, Difficulty, DifficultyKey, PlayerPreset } from '../types'

export const MIN_CUSTOM_MAX_NUMBER = 1
export const MAX_CUSTOM_MAX_NUMBER = 9

export const CUSTOM_DIFFICULTY_DEFAULTS: CustomDifficultySettings = {
  maxNumber: 5,
  operations: ['+'],
}

export const DIFFICULTIES: Difficulty[] = [
  {
    key: 'easy',
    label: 'Fácil',
    description: 'Sumas simples para comenzar con calma.',
    maxNumber: 3,
    operations: ['+'],
    rangeLabel: 'Números de 0 a 3',
    tone: '#34a853',
  },
  {
    key: 'medium',
    label: 'Medio',
    description: 'Sumas y restas para turnos más activos.',
    maxNumber: 5,
    operations: ['+', '-'],
    rangeLabel: 'Números de 0 a 5',
    tone: '#4285f4',
  },
  {
    key: 'hard',
    label: 'Difícil',
    description: 'Agrega multiplicación y tablero más amplio.',
    maxNumber: 7,
    operations: ['+', '-', 'x'],
    rangeLabel: 'Números de 0 a 7',
    tone: '#fbbc04',
  },
  {
    key: 'expert',
    label: 'Experto',
    description: 'Incluye división exacta para más desafío.',
    maxNumber: 9,
    operations: ['+', '-', 'x', '/'],
    rangeLabel: 'Números de 0 a 9',
    tone: '#ea4335',
  },
  {
    key: 'custom',
    label: 'Personalizado',
    description: 'Elige el rango y las operaciones para esta partida.',
    ...CUSTOM_DIFFICULTY_DEFAULTS,
    rangeLabel: 'Rango y operaciones a elección',
    tone: '#7e57c2',
  },
]

export const PLAYER_PRESETS: PlayerPreset[] = [
  { name: 'Perro Saltarín', color: '#4285f4', shape: 'circle' },
  { name: 'Grulla Audaz', color: '#ea4335', shape: 'star' },
  { name: 'Grillo Nocturno', color: '#34a853', shape: 'heart' },
  { name: 'Zorro Curioso', color: '#fbbc04', shape: 'triangle' },
  { name: 'Puma Valiente', color: '#9c27b0', shape: 'diamond' },
]

export const PLAYER_NICKNAMES = [
  'Perro Saltarín',
  'Grulla Audaz',
  'Grillo Nocturno',
  'Zorro Curioso',
  'Puma Valiente',
  'Cóndor Brillante',
  'Rana Veloz',
  'Gato Solar',
  'Conejo Valiente',
  'Llama Risueña',
  'Delfín Alegre',
  'Tucán Sabio',
  'Oso Amable',
  'Caballo Relámpago',
  'Lagarto Ingenioso',
  'Colibrí Travieso',
  'Pingüino Estelar',
  'Tortuga Genial',
  'Mapache Lunar',
  'Zorzal Campeón',
]

export function getDifficulty(
  key: DifficultyKey,
  customSettings: CustomDifficultySettings = CUSTOM_DIFFICULTY_DEFAULTS,
): Difficulty {
  const requestedMaxNumber = Number.isFinite(customSettings.maxNumber)
    ? customSettings.maxNumber
    : CUSTOM_DIFFICULTY_DEFAULTS.maxNumber

  if (key !== 'custom') {
    return DIFFICULTIES.find((difficulty) => difficulty.key === key) ?? DIFFICULTIES[0]
  }

  const maxNumber = Math.max(
    MIN_CUSTOM_MAX_NUMBER,
    Math.min(MAX_CUSTOM_MAX_NUMBER, Math.trunc(requestedMaxNumber)),
  )

  return {
    key: 'custom',
    label: 'Personalizado',
    description: 'Elige el rango y las operaciones para esta partida.',
    maxNumber,
    operations: customSettings.operations,
    rangeLabel: `Números de 0 a ${maxNumber}`,
    tone: '#7e57c2',
  }
}
