export type MiniStory = {
  description: string
  id: string
  imageHint: string
  sentences: string[]
  title: string
}

export type WhisperModelOption = {
  description: string
  id: string
  label: string
  size: string
  tag: string
}

export const whisperModels: WhisperModelOption[] = [
  {
    id: 'onnx-community/whisper-tiny',
    label: 'Ligero',
    description: 'Carga más liviana para notebooks escolares.',
    size: '~80 MB',
    tag: 'Recomendado',
  },
  {
    id: 'onnx-community/whisper-base',
    label: 'Preciso',
    description: 'Reconoce mejor el habla y necesita una descarga mayor.',
    size: '~200 MB',
    tag: 'Más preciso',
  },
]

export const miniStories: MiniStory[] = [
  {
    id: 'pelota-roja',
    title: 'La pelota roja',
    description: 'Una historia breve para leer con ritmo y claridad.',
    imageHint: 'Pelota roja',
    sentences: [
      'La pelota es roja.',
      'Tomás mira la pelota.',
      'La pelota rueda sola.',
      'Tomás corre rápido.',
      'Tomás toma la pelota.',
      'Tomás sonríe feliz.',
    ],
  },
  {
    id: 'gato-curioso',
    title: 'El gato curioso',
    description: 'Una historia simple con acciones cortas.',
    imageHint: 'Gato y caja',
    sentences: [
      'El gato mira la caja.',
      'La caja está abierta.',
      'El gato entra despacio.',
      'La caja se mueve.',
      'La niña mira al gato.',
      'El gato sale saltando.',
    ],
  },
  {
    id: 'lluvia-suave',
    title: 'La lluvia suave',
    description: 'Una historia tranquila para practicar fluidez.',
    imageHint: 'Lluvia y botas',
    sentences: [
      'Hoy cae lluvia suave.',
      'Sofía mira la ventana.',
      'La calle está mojada.',
      'Sofía usa sus botas.',
      'Ella pisa un charco.',
      'Sofía ríe contenta.',
    ],
  },
]
