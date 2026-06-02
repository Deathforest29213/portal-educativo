export type PracticeMode = 'palabras' | 'frases'

export type PracticeItem = {
  id: string
  mode: PracticeMode
  text: string
  support: string
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
    label: 'Whisper tiny',
    description: 'Carga mas liviana para notebooks escolares.',
    size: '~80 MB',
    tag: 'Recomendado',
  },
  {
    id: 'onnx-community/whisper-base',
    label: 'Whisper base',
    description: 'Mejor precision, con descarga cercana al demo de Xenova.',
    size: '~200 MB',
    tag: 'Mas preciso',
  },
]

export const practiceItems: PracticeItem[] = [
  { id: 'p-01', mode: 'palabras', text: 'sol', support: 'Una palabra corta y clara.' },
  { id: 'p-02', mode: 'palabras', text: 'mesa', support: 'Pronuncia cada silaba con calma.' },
  { id: 'p-03', mode: 'palabras', text: 'camino', support: 'Marca bien el sonido inicial.' },
  { id: 'p-04', mode: 'palabras', text: 'mariposa', support: 'Lee lento si la palabra es larga.' },
  { id: 'p-05', mode: 'palabras', text: 'familia', support: 'Mantén la voz cerca del microfono.' },
  { id: 'p-06', mode: 'palabras', text: 'escuela', support: 'Cuida el sonido final.' },
  { id: 'f-01', mode: 'frases', text: 'La mamá lee', support: 'Frase corta de tres palabras.' },
  { id: 'f-02', mode: 'frases', text: 'El perro corre', support: 'Lee palabra por palabra.' },
  { id: 'f-03', mode: 'frases', text: 'Mi casa es roja', support: 'Usa una voz clara y tranquila.' },
  { id: 'f-04', mode: 'frases', text: 'La niña toma agua', support: 'Haz una pausa breve al terminar.' },
  { id: 'f-05', mode: 'frases', text: 'El gato mira la luna', support: 'No importa el acento, importa intentarlo.' },
  { id: 'f-06', mode: 'frases', text: 'Hoy juego con mis amigos', support: 'Frase corta para practicar fluidez.' },
]
