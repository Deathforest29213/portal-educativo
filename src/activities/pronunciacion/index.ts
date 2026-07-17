import { defineActivity } from '../defineActivity'

export const pronunciacionModule = defineActivity({
  activity: {
    id: 'pronunciacion',
    title: 'Pronunciación',
    area: 'Lenguaje',
    description: 'Práctica guiada de lectura en voz alta con apoyo inmediato.',
    level: 'Rezago lector',
    version: '0.1.0',
    source: 'Actividad inventada para prototipo Whisper WebGPU',
    migrationStatus: 'mvp',
  },
  assets: ['/'],
  load: () => import('./PronunciacionActivity'),
})
