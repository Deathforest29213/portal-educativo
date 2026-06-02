import LecturaPiramideActivity from './LecturaPiramideActivity'
import { LECTURA_PIRAMIDE_IMAGE_ASSETS } from './data/imageUrls'
import type { ActivityModule } from '../../types'

export const lecturaPiramideModule: ActivityModule = {
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
  Component: LecturaPiramideActivity,
}
