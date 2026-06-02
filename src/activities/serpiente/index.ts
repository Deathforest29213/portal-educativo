import SerpienteMatematicaActivity from './SerpienteMatematicaActivity'
import { SERPIENTE_ASSETS } from './data/assets'
import type { ActivityModule } from '../../types'

export const serpienteMatematicaModule: ActivityModule = {
  activity: {
    id: 'serpiente-matematica',
    title: 'Serpiente Matemática',
    area: 'Matemática',
    description: 'Juego de cálculo con feedback inmediato, migrado desde Serpiente.html.',
    level: 'Cálculo mental',
    version: '1.0.0',
    source: 'serpiente/Serpiente.html',
    migrationStatus: 'mvp',
  },
  assets: ['/', ...SERPIENTE_ASSETS],
  Component: SerpienteMatematicaActivity,
}
