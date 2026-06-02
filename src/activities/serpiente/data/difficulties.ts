import type { DifficultyKey, DifficultySettings } from '../types'

const asset = (name: string) => `/serpiente/assets/${name}`

export const difficulties: Record<DifficultyKey, DifficultySettings> = {
  easy: {
    key: 'easy',
    label: 'Culebrita',
    exercises: 5,
    maxVal: 10,
    icon: '🐛',
    optionsCount: 3,
    skipOnError: false,
    primary: '#34a853',
    secondary: '#fbbc04',
    bg: '#e6f4ea',
    decos: ['🐛', '🌿', '🌻', '🍃'],
    tail: asset('culebra_tail.svg'),
    body: asset('culebra_body.svg'),
    bodyReverse: asset('culebra_body_reverse.svg'),
    head: asset('culebra_head.svg'),
  },
  medium: {
    key: 'medium',
    label: 'Boa',
    exercises: 12,
    maxVal: 20,
    icon: '🐍',
    optionsCount: 4,
    skipOnError: true,
    primary: '#4285f4',
    secondary: '#ea4335',
    bg: '#e8f0fe',
    decos: ['🐍', '☠️', '🏜️', '⚡'],
    tail: asset('boa_tail.svg'),
    body: asset('boa_body.svg'),
    bodyReverse: asset('boa_body_reverse.svg'),
    head: asset('boa_head.svg'),
  },
  hard: {
    key: 'hard',
    label: 'Dragón',
    exercises: 20,
    maxVal: 50,
    icon: '🐉',
    optionsCount: 4,
    skipOnError: true,
    primary: '#ea4335',
    secondary: '#34a853',
    bg: '#fce8e6',
    decos: ['🐲', '🔥', '⚔️', '🏰'],
    tail: asset('dragon_tail.svg'),
    body: asset('dragon_body.svg'),
    bodyReverse: asset('dragon_body_reverse.svg'),
    head: asset('dragon_head.svg'),
  },
}

export const difficultyKeys: DifficultyKey[] = ['easy', 'medium', 'hard']
