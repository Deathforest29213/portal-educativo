import type { ActivityArea } from '../../types'

export type ActivityLoadingPresentation = {
  area: ActivityArea
  description: string
  title: string
}

/**
 * Única fuente de configuración para la experiencia de carga de actividades.
 * El componente visual puede montarse muchas veces, pero siempre consulta la
 * misma instancia para conservar mensajes y comportamiento consistentes.
 */
export class ActivityLoadingSingleton {
  private static instance: ActivityLoadingSingleton | undefined

  private constructor() {}

  static getInstance() {
    ActivityLoadingSingleton.instance ??= new ActivityLoadingSingleton()
    return ActivityLoadingSingleton.instance
  }

  getPresentation(area: ActivityArea, activityTitle: string): ActivityLoadingPresentation {
    return {
      area,
      description: area === 'Lenguaje'
        ? 'Estamos ordenando la lectura y sus materiales.'
        : 'Estamos preparando los desafíos y sus materiales.',
      title: `Preparando ${activityTitle}`,
    }
  }
}

export const activityLoading = ActivityLoadingSingleton.getInstance()
