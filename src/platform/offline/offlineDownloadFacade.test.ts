import { describe, expect, it, vi } from 'vitest'
import { OfflineDownloadFacade } from './offlineDownloadFacade'
import { ServiceWorkerAdapter, type MessageListener, type OfflineMessagePort } from './serviceWorkerAdapter'
import type { CacheActivityRequest, CacheActivityResult, OfflineDownloadEvent } from './protocol'

class FakePort implements OfflineMessagePort {
  listener: MessageListener | null = null
  request: CacheActivityRequest | null = null

  async post(message: CacheActivityRequest) {
    this.request = message
  }

  subscribe(listener: MessageListener) {
    this.listener = listener
    return () => { this.listener = null }
  }

  respond(result: CacheActivityResult) {
    this.listener?.(result)
  }
}

describe('OfflineDownloadFacade', () => {
  it('notifica inicio y finalización solo después de la respuesta del adaptador', async () => {
    const port = new FakePort()
    const facade = new OfflineDownloadFacade(port)
    const events: OfflineDownloadEvent[] = []
    facade.subscribe((event) => events.push(event))

    const pending = facade.download({ activityId: 'guia', version: '2', assets: ['/guia.js'] })
    expect(events.map(({ type }) => type)).toEqual(['started'])

    port.respond({
      type: 'CACHE_ACTIVITY_RESULT',
      requestId: port.request!.requestId,
      activityId: 'guia',
      version: '2',
      ok: true,
    })
    await pending

    expect(events.map(({ type }) => type)).toEqual(['started', 'completed'])
    facade.dispose()
  })

  it('propaga el error recibido y emite failed', async () => {
    const port = new FakePort()
    const facade = new OfflineDownloadFacade(port)
    const events: OfflineDownloadEvent[] = []
    facade.subscribe((event) => events.push(event))

    const pending = facade.download({ activityId: 'guia', version: '2', assets: ['/guia.js'] })
    port.respond({
      type: 'CACHE_ACTIVITY_RESULT',
      requestId: port.request!.requestId,
      activityId: 'guia',
      version: '2',
      ok: false,
      error: 'sin espacio',
    })

    await expect(pending).rejects.toThrow('sin espacio')
    expect(events.at(-1)).toMatchObject({ type: 'failed', error: 'sin espacio' })
    facade.dispose()
  })
})

describe('ServiceWorkerAdapter', () => {
  it('traduce post y filtra mensajes ajenos al protocolo offline', async () => {
    const postMessage = vi.fn()
    let messageHandler: ((event: MessageEvent<unknown>) => void) | undefined
    const serviceWorkers = {
      controller: { postMessage },
      ready: Promise.resolve({ active: null }),
      addEventListener: vi.fn((_type: string, listener: EventListenerOrEventListenerObject) => {
        messageHandler = listener as (event: MessageEvent<unknown>) => void
      }),
      removeEventListener: vi.fn(),
    }
    const adapter = new ServiceWorkerAdapter(serviceWorkers as never)
    const listener = vi.fn()
    const unsubscribe = adapter.subscribe(listener)
    const request: CacheActivityRequest = {
      type: 'CACHE_ACTIVITY',
      requestId: 'request-1',
      activityId: 'guia',
      version: '2',
      assets: ['/guia.js'],
    }

    await adapter.post(request)
    messageHandler?.({ data: { type: 'OTRO_MENSAJE' } } as MessageEvent)
    messageHandler?.({ data: { ...request, type: 'CACHE_ACTIVITY_RESULT', ok: true } } as MessageEvent)

    expect(postMessage).toHaveBeenCalledWith(request)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ ok: true, requestId: 'request-1' }))

    unsubscribe()
    expect(serviceWorkers.removeEventListener).toHaveBeenCalledTimes(1)
  })
})
