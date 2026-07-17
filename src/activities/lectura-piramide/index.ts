import { LECTURA_PIRAMIDE_IMAGE_ASSETS } from './data/imageUrls'
import { defineActivity } from '../defineActivity'

export const lecturaPiramideModule = defineActivity({
  activity: {
    id: 'lectura-piramide',
    title: 'Lectura en Pirámide',
    area: 'Lenguaje',
    description: 'Lectura progresiva con comprensión breve para trabajar fluidez.',
    level: 'Lectura guiada',
    version: '1.1.10',
    source: 'Lectura de piramide/',
    migrationStatus: 'mvp',
  },
  assets: ['/', ...LECTURA_PIRAMIDE_IMAGE_ASSETS],
  load: () => import('./LecturaPiramideActivity'),
})
