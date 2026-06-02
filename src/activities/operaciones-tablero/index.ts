import OperacionesTableroActivity from './OperacionesTableroActivity'
import type { ActivityModule } from '../../types'

export const operacionesTableroModule: ActivityModule = {
  activity: {
    id: 'operaciones-tablero',
    title: 'Tablero de Operaciones',
    area: 'Matemática',
    description: 'Juego por turnos con dados virtuales, tablero y líneas de tres.',
    level: 'Operaciones',
    version: '1.0.0',
    source: 'portal-educativo/src/activities/operaciones-tablero/',
    migrationStatus: 'mvp',
  },
  assets: ['/'],
  Component: OperacionesTableroActivity,
}
