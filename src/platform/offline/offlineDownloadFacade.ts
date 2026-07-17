import type {
  CacheActivityRequest,
  CacheActivityResult,
  OfflineDownloadEvent,
  OfflineDownloadRequest,
} from './protocol'
import { ServiceWorkerAdapter, type OfflineMessagePort } from './serviceWorkerAdapter'

type PendingRequest = {
  request: OfflineDownloadRequest
  resolve: () => void
  reject: (error: Error) => void
  timeoutId: ReturnType<typeof setTimeout>
}

type Observer = (event: OfflineDownloadEvent) => void

export class OfflineDownloadFacade {
  private readonly observers = new Set<Observer>()
  private readonly pending = new Map<string, PendingRequest>()
  private stopListening: (() => void) | null = null
  private requestSequence = 0

  constructor(
    private readonly port: OfflineMessagePort,
    private readonly timeoutMs = 45_000,
  ) {}

  subscribe(observer: Observer) {
    this.observers.add(observer)
    this.ensureListening()

    return () => {
      this.observers.delete(observer)
      this.stopIfIdle()
    }
  }

  async download(request: OfflineDownloadRequest) {
    validateRequest(request)
    this.ensureListening()

    const requestId = `${Date.now()}-${this.requestSequence += 1}`
    const message: CacheActivityRequest = {
      type: 'CACHE_ACTIVITY',
      requestId,
      ...request,
    }

    this.notify({ type: 'started', activityId: request.activityId, version: request.version })

    return new Promise<void>((resolve, reject) => {
      const timeoutId = globalThis.setTimeout(() => {
        this.pending.delete(requestId)
        const error = new Error('La descarga tardó demasiado. Revisa la conexión e inténtalo de nuevo.')
        this.notifyFailed(request, error)
        reject(error)
        this.stopIfIdle()
      }, this.timeoutMs)

      this.pending.set(requestId, { request, resolve, reject, timeoutId })

      this.port.post(message).catch((cause: unknown) => {
        const pending = this.pending.get(requestId)
        if (!pending) return

        globalThis.clearTimeout(pending.timeoutId)
        this.pending.delete(requestId)
        const error = toError(cause)
        this.notifyFailed(request, error)
        reject(error)
        this.stopIfIdle()
      })
    })
  }

  dispose() {
    this.stopListening?.()
    this.stopListening = null

    for (const pending of this.pending.values()) {
      globalThis.clearTimeout(pending.timeoutId)
      pending.reject(new Error('La descarga fue cancelada.'))
    }

    this.pending.clear()
    this.observers.clear()
  }

  private ensureListening() {
    if (!this.stopListening) {
      this.stopListening = this.port.subscribe((message) => this.handleResult(message))
    }
  }

  private handleResult(message: CacheActivityResult) {
    const pending = this.pending.get(message.requestId)
    if (!pending) return

    globalThis.clearTimeout(pending.timeoutId)
    this.pending.delete(message.requestId)

    if (message.ok) {
      this.notify({
        type: 'completed',
        activityId: message.activityId,
        version: message.version,
      })
      pending.resolve()
    } else {
      const error = new Error(message.error || 'No se pudo descargar la actividad.')
      this.notifyFailed(pending.request, error)
      pending.reject(error)
    }

    this.stopIfIdle()
  }

  private notifyFailed(request: OfflineDownloadRequest, error: Error) {
    this.notify({
      type: 'failed',
      activityId: request.activityId,
      version: request.version,
      error: error.message,
    })
  }

  private notify(event: OfflineDownloadEvent) {
    this.observers.forEach((observer) => observer(event))
  }

  private stopIfIdle() {
    if (this.pending.size === 0 && this.observers.size === 0) {
      this.stopListening?.()
      this.stopListening = null
    }
  }
}

export function createBrowserOfflineDownloadFacade() {
  if (!('serviceWorker' in navigator)) {
    return new OfflineDownloadFacade({
      post: async () => {
        throw new Error('Este navegador no permite descargar actividades para uso offline.')
      },
      subscribe: () => () => undefined,
    })
  }

  return new OfflineDownloadFacade(new ServiceWorkerAdapter(navigator.serviceWorker))
}

function validateRequest(request: OfflineDownloadRequest) {
  if (!request.activityId || !request.version) {
    throw new Error('La actividad no tiene una versión válida para descargar.')
  }

  if (request.assets.some((asset) => !asset.startsWith('/'))) {
    throw new Error('La actividad contiene recursos externos que no se pueden descargar.')
  }
}

function toError(cause: unknown) {
  return cause instanceof Error ? cause : new Error('No se pudo iniciar la descarga.')
}
