const CACHE_NAME = 'aula-actividades-v0.1.0'
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
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
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

  const assets = Array.isArray(event.data.assets) ? event.data.assets : []
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(['/', ...assets])))
})
