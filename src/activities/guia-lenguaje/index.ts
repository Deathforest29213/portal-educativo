import { GUIA_LENGUAJE_ASSETS } from './data/assets'
import { defineActivity } from '../defineActivity'

export const guiaLenguajeModule = defineActivity({
  activity: {
    id: 'guia-lenguaje',
    title: 'Guía de Lenguaje',
    area: 'Lenguaje',
    description: 'Actividad de selección, orden y comprensión desde la guía tradicional.',
    level: 'Lenguaje',
    version: '1.1.10',
    source: 'guia-lenguaje-tradicional/',
    migrationStatus: 'mvp',
  },
  assets: ['/', ...GUIA_LENGUAJE_ASSETS],
  load: () => import('./GuiaLenguajeActivity'),
})
