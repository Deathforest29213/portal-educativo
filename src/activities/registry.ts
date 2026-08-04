import { calculosCircularesModule } from './calculos-circulares'
import { guiaLenguajeModule } from './guia-lenguaje'
import { lecturaPiramideModule } from './lectura-piramide'
import { operacionesTableroModule } from './operaciones-tablero'
import { piramideAritmeticaModule } from './piramide-aritmetica'
import { pronunciacionModule } from './pronunciacion'
import { serpienteMatematicaModule } from './serpiente'
import type { ActivityModule } from '../types'

export const activityModules: ActivityModule[] = [
  lecturaPiramideModule,
  guiaLenguajeModule,
  pronunciacionModule,
  serpienteMatematicaModule,
  calculosCircularesModule,
  operacionesTableroModule,
  piramideAritmeticaModule,
]

export const activities = activityModules.map((module) => module.activity)

export function findActivityModule(activityId: string | null) {
  if (!activityId) {
    return null
  }

  return activityModules.find((module) => module.activity.id === activityId) ?? null
}
