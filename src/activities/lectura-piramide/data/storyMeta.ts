import type { StoryMeta } from '../types'

export const STORY_META: Record<string, StoryMeta> = {
  alicia: {
    id: 'alicia',
    title: 'Alicia y la agenda amarilla',
    emoji: '📒',
  },
  astronauta: {
    id: 'astronauta',
    title: 'El astronauta viaja',
    emoji: '🚀',
  },
  camion: {
    id: 'camion',
    title: 'Mi papa conduce un camion',
    emoji: '🚚',
  },
  perro: {
    id: 'perro',
    title: 'El perro y la pelota',
    emoji: '🐶',
  },
  policia: {
    id: 'policia',
    title: 'El policia y el ladron',
    emoji: '👮',
  },
  martina: {
    id: 'martina',
    title: 'Martina y la flor',
    emoji: '🌸',
  },
  tren: {
    id: 'tren',
    title: 'El tren azul',
    emoji: '🚆',
  },
  tortuga: {
    id: 'tortuga',
    title: 'La tortuga',
    emoji: '🐢',
  },
  panadero: {
    id: 'panadero',
    title: 'El panadero',
    emoji: '🥐',
  },
  sofia: {
    id: 'sofia',
    title: 'Sofia y el paraguas',
    emoji: '☂️',
  },
  barco: {
    id: 'barco',
    title: 'El barco',
    emoji: '⛵',
  },
}

export const SOURCE_TITLE_TO_ID: Record<string, string> = {
  alicia: 'alicia',
  astronauta: 'astronauta',
  camion: 'camion',
  'perro y pelota': 'perro',
  'policia y ladron': 'policia',
  'martina y la flor': 'martina',
  'el tren azul': 'tren',
  'la tortuga': 'tortuga',
  'el panadero pantheon league of legends': 'panadero',
  'sofia y el paraguas': 'sofia',
  'el barco': 'barco',
}
