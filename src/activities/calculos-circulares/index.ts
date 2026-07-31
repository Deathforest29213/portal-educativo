import { defineActivity } from '../defineActivity'

export const calculosCircularesModule = defineActivity({
  activity: {
    id: 'calculos-circulares',
    title: 'Cálculos circulares',
    area: 'Matemática',
    description: 'Completa una cuadrícula de operaciones conectadas y descubre las relaciones entre filas y columnas.',
    level: 'Cálculo mental',
    version: '1.0.0',
    source: 'portal-educativo/src/activities/calculos-circulares/',
    migrationStatus: 'mvp',
  },
  assets: ['/'],
  load: () => import('./CalculosCircularesActivity'),
})
