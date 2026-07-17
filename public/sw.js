const CACHE_NAME = 'aula-actividades-v0.1.0'
const ACTIVITY_CACHE_PREFIX = 'aula-actividad-'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/aula-icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key !== CACHE_NAME && !key.startsWith(ACTIVITY_CACHE_PREFIX),
            )
            .map((key) => caches.delete(key)),
        ),
      ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)

        if (cached) {
          return cached
        }

        if (request.mode === 'navigate') {
          return caches.match('/index.html')
        }

        return new Response('Sin conexion', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      }),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_ACTIVITY') {
    return
  }

  const { activityId, requestId, version } = event.data
  const assets = Array.isArray(event.data.assets) ? event.data.assets : []

  event.waitUntil(
    replaceActivityCache(activityId, version, assets)
      .then(() => {
        event.source?.postMessage({
          type: 'CACHE_ACTIVITY_RESULT',
          requestId,
          activityId,
          version,
          ok: true,
        })
      })
      .catch((error) => {
        event.source?.postMessage({
          type: 'CACHE_ACTIVITY_RESULT',
          requestId,
          activityId,
          version,
          ok: false,
          error: error instanceof Error ? error.message : 'No se pudo guardar la actividad.',
        })
      }),
  )
})

async function replaceActivityCache(activityId, version, assets) {
  if (typeof activityId !== 'string' || typeof version !== 'string') {
    throw new Error('La actividad no tiene una versión válida.')
  }

  const safeActivityId = activityId.replace(/[^a-z0-9-]/gi, '-')
  const safeVersion = version.replace(/[^a-z0-9.-]/gi, '-')
  const activityPrefix = `${ACTIVITY_CACHE_PREFIX}${safeActivityId}-`
  const nextCacheName = `${activityPrefix}${safeVersion}`
  const cacheNames = await caches.keys()

  await Promise.all(
    cacheNames
      .filter((cacheName) => cacheName.startsWith(activityPrefix))
      .map((cacheName) => caches.delete(cacheName)),
  )

  try {
    const cache = await caches.open(nextCacheName)
    await cache.addAll([...new Set(['/', ...assets])])
  } catch (error) {
    await caches.delete(nextCacheName)
    throw error
  }
}
