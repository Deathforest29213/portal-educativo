import PiramideAritmeticaActivity from './PiramideAritmeticaActivity'
import type { ActivityModule } from '../../types'

export const piramideAritmeticaModule: ActivityModule = {
  activity: {
    id: 'piramide-aritmetica',
    title: 'Pirámide Aritmética',
    area: 'Matemática',
    description: 'Completa bloques usando sumas y restas, con puntaje por racha.',
    level: 'Suma y resta',
    version: '0.1.0',
    source: 'portal-educativo/src/activities/piramide-aritmetica/',
    migrationStatus: 'mvp',
  },
  assets: ['/'],
  Component: PiramideAritmeticaActivity,
}
