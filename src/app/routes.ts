import type { Activity } from '../types'

const ACTIVITY_ROUTE_PATTERN = /^#\/actividad\/([a-z0-9-]+)$/

export function getActivityIdFromHash(activities: Activity[]) {
  const match = window.location.hash.match(ACTIVITY_ROUTE_PATTERN)
  const candidate = match?.[1] ?? null

  return activities.some((activity) => activity.id === candidate) ? candidate : null
}

export function navigateToActivity(activityId: string) {
  window.location.hash = `/actividad/${activityId}`
}

export function navigateHome() {
  window.location.hash = '/'
}
