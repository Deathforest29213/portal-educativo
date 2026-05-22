import type { Activity, ActivityQuestion } from '../types'

export const activities: Activity[] = [
  {
    id: 'lectura-piramide',
    title: 'Lectura en Pirámide',
    area: 'Lenguaje',
    description: 'Lectura progresiva con comprensión breve para trabajar fluidez.',
    level: 'Lectura guiada',
    version: '1.1.10',
    source: 'Lectura de piramide/',
  },
  {
    id: 'guia-lenguaje',
    title: 'Guía de Lenguaje',
    area: 'Lenguaje',
    description: 'Actividad de selección, orden y comprensión desde la guía tradicional.',
    level: 'Lenguaje',
    version: '1.1.10',
    source: 'guia-lenguaje-tradicional/',
  },
  {
    id: 'serpiente-matematica',
    title: 'Serpiente Matemática',
    area: 'Matemática',
    description: 'Juego de cálculo con feedback inmediato, migrado desde Serpiente.html.',
    level: 'Cálculo mental',
    version: '0.2.0',
    source: 'serpiente/Serpiente.html',
  },
]

export const activityQuestions: Record<string, ActivityQuestion[]> = {
  'lectura-piramide': [
    {
      prompt: 'La niña mira una flor. ¿Qué mira la niña?',
      answer: 'Una flor',
      options: ['Una flor', 'Un tren', 'Una pelota'],
    },
    {
      prompt: 'El perro corre por el patio. ¿Dónde corre?',
      answer: 'Por el patio',
      options: ['Por el patio', 'En el mar', 'En la cocina'],
    },
    {
      prompt: 'El tren pasa lento. ¿Cómo pasa el tren?',
      answer: 'Lento',
      options: ['Rápido', 'Lento', 'Dormido'],
    },
  ],
  'guia-lenguaje': [
    {
      prompt: 'Elige la oración que está completa.',
      answer: 'Teodoro escribió una carta.',
      options: ['Teodoro escribió una carta.', 'Teodoro una carta.', 'Escribió una.'],
    },
    {
      prompt: '¿Qué palabra completa mejor? El bombero apagó el ____.',
      answer: 'fuego',
      options: ['fuego', 'zapato', 'lápiz'],
    },
    {
      prompt: 'Elige la idea principal: “Carolina cuidó a su perro enfermo.”',
      answer: 'Carolina ayudó a su perro.',
      options: ['Carolina ayudó a su perro.', 'El perro fue al colegio.', 'Carolina compró pan.'],
    },
  ],
  'serpiente-matematica': [
    {
      prompt: 'Resuelve: 8 + 7',
      answer: '15',
      options: ['14', '15', '16'],
    },
    {
      prompt: 'Resuelve: 6 x 4',
      answer: '24',
      options: ['20', '22', '24'],
    },
    {
      prompt: 'Resuelve: 30 - 12',
      answer: '18',
      options: ['16', '18', '20'],
    },
  ],
}
