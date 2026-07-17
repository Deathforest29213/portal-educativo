import type { CacheActivityRequest, CacheActivityResult } from './protocol'

export type MessageListener = (message: CacheActivityResult) => void

export interface OfflineMessagePort {
  post(message: CacheActivityRequest): Promise<void>
  subscribe(listener: MessageListener): () => void
}

type ServiceWorkerContainerLike = Pick<
  ServiceWorkerContainer,
  'addEventListener' | 'controller' | 'ready' | 'removeEventListener'
>

export class ServiceWorkerAdapter implements OfflineMessagePort {
  constructor(private readonly serviceWorkers: ServiceWorkerContainerLike) {}

  async post(message: CacheActivityRequest) {
    const registration = await this.serviceWorkers.ready
    const worker = this.serviceWorkers.controller ?? registration.active

    if (!worker) {
      throw new Error('El modo offline aún no está listo. Recarga la página e inténtalo de nuevo.')
    }

    worker.postMessage(message)
  }

  subscribe(listener: MessageListener) {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (isCacheActivityResult(event.data)) {
        listener(event.data)
      }
    }

    this.serviceWorkers.addEventListener('message', handleMessage)
    return () => this.serviceWorkers.removeEventListener('message', handleMessage)
  }
}

function isCacheActivityResult(value: unknown): value is CacheActivityResult {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<CacheActivityResult>
  return (
    candidate.type === 'CACHE_ACTIVITY_RESULT' &&
    typeof candidate.requestId === 'string' &&
    typeof candidate.activityId === 'string' &&
    typeof candidate.version === 'string' &&
    typeof candidate.ok === 'boolean'
  )
}
