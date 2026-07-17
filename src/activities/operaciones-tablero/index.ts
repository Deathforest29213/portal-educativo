import { defineActivity } from '../defineActivity'

export const operacionesTableroModule = defineActivity({
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
  load: () => import('./OperacionesTableroActivity'),
})
