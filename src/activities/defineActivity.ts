import { lazy } from 'react'
import type { ActivityDefinition, ActivityModule } from '../types'

const ACTIVITY_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function defineActivity(definition: ActivityDefinition): ActivityModule {
  validateDefinition(definition)

  return Object.freeze({
    ...definition,
    assets: Object.freeze([...new Set(definition.assets)]) as unknown as string[],
    Component: lazy(definition.load),
  })
}

function validateDefinition(definition: ActivityDefinition) {
  const { activity, assets } = definition

  if (!ACTIVITY_ID_PATTERN.test(activity.id)) {
    throw new Error(`Identificador de actividad inválido: ${activity.id}`)
  }

  if (!activity.title.trim() || !activity.version.trim() || !activity.source.trim()) {
    throw new Error(`La actividad ${activity.id} tiene metadata incompleta.`)
  }

  const externalAsset = assets.find((asset) => !asset.startsWith('/'))
  if (externalAsset) {
    throw new Error(`La actividad ${activity.id} declara un recurso no local: ${externalAsset}`)
  }
}
