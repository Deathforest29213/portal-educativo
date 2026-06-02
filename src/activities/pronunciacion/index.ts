import PronunciacionActivity from './PronunciacionActivity'
import type { ActivityModule } from '../../types'

export const pronunciacionModule: ActivityModule = {
  activity: {
    id: 'pronunciacion',
    title: 'Pronunciación',
    area: 'Lenguaje',
    description: 'Práctica de palabras y frases cortas con Whisper WebGPU en el navegador.',
    level: 'Rezago lector',
    version: '0.1.0',
    source: 'Actividad inventada para prototipo Whisper WebGPU',
    migrationStatus: 'mvp',
  },
  assets: ['/'],
  Component: PronunciacionActivity,
}
