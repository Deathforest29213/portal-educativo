import { SERPIENTE_ASSETS } from './data/assets'
import { defineActivity } from '../defineActivity'

export const serpienteMatematicaModule = defineActivity({
  activity: {
    id: 'serpiente-matematica',
    title: 'Serpiente Matemática',
    area: 'Matemática',
    description: 'Juego de cálculo mental para construir una serpiente respuesta a respuesta.',
    level: 'Cálculo mental',
    version: '1.0.0',
    source: 'serpiente/Serpiente.html',
    migrationStatus: 'mvp',
  },
  assets: ['/', ...SERPIENTE_ASSETS],
  load: () => import('./SerpienteMatematicaActivity'),
})
