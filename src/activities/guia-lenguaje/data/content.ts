export type TaskKey = 'task1' | 'task2' | 'task3'

const image = (name: string) => `/guia-lenguaje/images/${name}`

export const task1Parts = [
  {
    image: image('teodoro-1.webp'),
    title: 'Las cartas de Teodoro',
    paragraphs: [
      'Todas las mañanas, Teodoro aparece por la vereda con su gran sonrisa de gato y grita “¡carteroooooooo!”. Su bolso está repleto de sobres con estampillas de colores. Los buzones de las casas abren grandes sus bocas para recibir las cartas de Teodoro.',
    ],
  },
  {
    image: image('teodoro-2.webp'),
    title: 'Todos esperan sus cartas',
    paragraphs: [
      'Todos en el barrio lo esperan ansiosos. Las gallinas salen apuradas por recibir noticias del gallo, que está de viaje.',
      'El perro grita desde su casa: —¡Teodoro, siempre me traes buenas noticias!',
      'La vaca le agradece en silencio, mirándolo con sus ojos largas pestañas. Los ratones esperan sobrecitos con olor a queso.',
      'Pero, a veces, algunos animales no reciben cartas. Teodoro nota la tristeza de sus vecinos y tiene una gran idea.',
    ],
  },
  {
    image: image('teodoro-3.webp'),
    title: 'Una gran idea',
    paragraphs: [
      'Teodoro, en su casa, se pone a escribir. Cartas y más cartas. Llenas de historias, recetas y consejos.',
      'Desde entonces, todos en el barrio reciben cartas: a veces de sus familias, a veces de sus amigos. Y cuando estas no llegan, reciben una carta de Teodoro, el gato cartero.',
    ],
  },
]

export const task1Questions = [
  {
    id: 't1-q1',
    points: 2,
    skill: 'Interpretar y relacionar',
    question: '¿Cómo se sienten los animales del barrio cuando esperan las cartas que entrega Teodoro?',
    options: ['Afligidos.', 'Ansiosos.', 'Agradecidos.', 'Apenados.'],
    answer: 'Ansiosos.',
  },
  {
    id: 't1-q2',
    points: 2,
    skill: 'Interpretar y relacionar',
    question: 'Según el texto, ¿qué le sucedía a veces al señor caballo?',
    options: ['Se quedaba sin carta.', 'Le daban buenas noticias.', 'Recibía un sobre con olor a queso.', 'Le facilitaban buenas referencias.'],
    answer: 'Se quedaba sin carta.',
  },
  {
    id: 't1-q3',
    points: 1,
    skill: 'Interpretar y relacionar',
    question: '¿Quién agradece en silencio al recibir las cartas de Teodoro?',
    options: ['La gata.', 'La araña.', 'La gallina.', 'La vaca.'],
    answer: 'La vaca.',
  },
  {
    id: 't1-q4',
    points: 2,
    skill: 'Interpretar y relacionar',
    question: '¿A quiénes escribía cartas Teodoro?',
    options: ['A los animales que viajaran al extranjero.', 'A los animales que le agradecen.', 'A los animales que no reciben cartas.', 'A los animales que están de viaje.'],
    answer: 'A los animales que no reciben cartas.',
  },
]

export const task2Image = image('bombero-1.webp')
export const task2Text = [
  [
    { text: 'Ayer en la tarde se inició un foco de incendio en el cerro Caracol, en la ' },
    { text: 'ciudad de Concepción', strong: true },
    { text: ', en las proximidades del conjunto residencial Las Violetas.' },
  ],
  [
    { text: 'Tres compañías de bomberos acudieron a apagar el incendio. Fue necesario recurrir a un helicóptero de bomberos, que acarreó agua desde el río ' },
    { text: 'Bío-Bío', strong: true },
    { text: '.' },
  ],
  [
    { text: 'Sólo se logró apagar el incendio alrededor de las tres de la madrugada. Fueron destruidas ' },
    { text: '3 hectáreas de bosque nativo', strong: true },
    { text: '. Bomberos aún sigue ' },
    { text: 'preocupado', strong: true },
    { text: ' por el origen del incendio.' },
  ],
]

export const task2Prompts = [
  {
    id: 't2-q1',
    question: '¿En qué lugar de Chile ocurre el incendio?',
    answer: ['En la', 'ciudad', 'de Concepción.'],
    fragments: ['En la', 'ciudad', 'de Concepción.', 'En el', 'cerro Caracol', 'río Bío-Bío', 'bosque nativo.'],
  },
  {
    id: 't2-q2',
    question: '¿Qué había provocado esta situación?',
    answer: ['Fueron destruidas', '3 hectáreas', 'de bosque nativo.'],
    fragments: ['Fueron destruidas', '3 hectáreas', 'de bosque nativo.', 'Tres compañías', 'apagaron', 'el incendio.', 'Las Violetas.'],
  },
  {
    id: 't2-q3',
    question: '¿Cómo se sentían los bomberos?',
    answer: ['Preocupación por lo', 'que le había sucedido', 'con el bosque nativo.'],
    fragments: ['Preocupación por lo', 'que le había sucedido', 'con el bosque nativo.', 'Alegría por lo', 'que llegó desde', 'el río Bío-Bío.', 'en la madrugada.'],
  },
]

export const task3Questions = [
  {
    id: 't3-q1',
    story: 'Estaba muy cansado, había hecho dos exámenes y también había tenido clase de educación física. Sólo me apetecía llegar a la casa, comer y descansar un ratito. ¿De dónde vengo?',
    answer: 'De la escuela',
    options: [
      { text: 'Del gimnasio', image: image('cosa-1-1.webp') },
      { text: 'De la escuela', image: image('cosa-1-2.webp') },
      { text: 'De la plaza', image: image('cosa-1-3.webp') },
    ],
  },
  {
    id: 't3-q2',
    story: 'Quería llegar pronto a mi casa, la tarde estaba helada, corría viento y las hojas secas bailaban a mi alrededor. Por suerte, justo en ese momento pasó el autobús y me llevó. ¿En qué época del año ocurre este relato?',
    answer: 'Otoño',
    options: [
      { text: 'Otoño', image: image('cosa-2-1.webp') },
      { text: 'Primavera', image: image('cosa-2-2.webp') },
      { text: 'Invierno', image: image('cosa-2-3.webp') },
    ],
  },
  {
    id: 't3-q3',
    story: 'Cuando llegamos a casa no la encontraba por ningún lado. No podríamos abrir la puerta así que tuvimos que llamar al cerrajero. Cuando conseguimos entrar, vi que me la había dejado sobre la mesa. ¿Qué objeto estaba sobre la mesa?',
    answer: 'Las llaves',
    options: [
      { text: 'La billetera', image: image('cosa-3-1.webp') },
      { text: 'El monedero', image: image('cosa-3-2.webp') },
      { text: 'Las llaves', image: image('cosa-3-3.webp') },
    ],
  },
  {
    id: 't3-q4',
    story: 'Le dijo a papá que arreglarlo costaría sobre $2.000 porque había que ponerles un retrovisor nuevo e inflable a las ruedas. ¿Quién le dijo eso a papá?',
    answer: 'Un mecánico',
    options: [
      { text: 'Un constructor', image: image('cosa-4-1.webp') },
      { text: 'Un mecánico', image: image('cosa-4-2.webp') },
      { text: 'Un ingeniero', image: image('cosa-4-3.webp') },
    ],
  },
  {
    id: 't3-q5',
    story: 'Empecé a pedalear cada vez más fuerte así que iba muy rápido. Papá me dijo que tuviera cuidado, pero no le hice caso y me caí, menos mal que llevaba casco y no me pasó nada. ¿En qué estaba montado el personaje que relata la historia?',
    answer: 'En bicicleta',
    options: [
      { text: 'En patines', image: image('cosa-5-1.webp') },
      { text: 'En patineta', image: image('cosa-5-2.webp') },
      { text: 'En bicicleta', image: image('cosa-5-3.webp') },
    ],
  },
  {
    id: 't3-q6',
    story: 'Estamos en abril y mi cumpleaños será dentro de cuatro meses, ¿cuándo será mi cumpleaños?',
    answer: 'Agosto',
    options: [
      { text: 'Agosto', image: image('cosa-6-1.webp') },
      { text: 'Octubre', image: image('cosa-6-2.webp') },
      { text: 'Septiembre', image: image('cosa-6-3.webp') },
    ],
  },
]

export const menuOptions = [
  { id: 'task1', title: 'Las cartas de Teodoro', label: 'Tarea 1', description: 'Lectura breve y preguntas de comprensión.', image: image('teodoro-1.webp') },
  { id: 'task2', title: 'Incendio en el cerro', label: 'Tarea 2', description: 'Construcción de respuestas con fragmentos.', image: task2Image },
  { id: 'task3', title: 'Fichas interrogativas', label: 'Tarea 3', description: 'Respuestas a partir de imágenes y situaciones.', image: image('cosa-1-2.webp') },
] as const
