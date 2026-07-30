import { defineActivity } from '../defineActivity'

export const piramideAritmeticaModule = defineActivity({
  activity: {
    id: 'piramide-aritmetica',
    title: 'Pirámide Aritmética',
    area: 'Matemática',
    description: 'Completa bloques usando sumas y restas, con puntaje por racha.',
    level: 'Suma y resta',
    version: '1.0.0',
    source: 'portal-educativo/src/activities/piramide-aritmetica/',
    migrationStatus: 'mvp',
  },
  assets: ['/'],
  load: () => import('./PiramideAritmeticaActivity'),
})
