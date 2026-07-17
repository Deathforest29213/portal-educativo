import type {
  TranscriptionEngine,
  TranscriptionEvent,
  TranscriptionProgress,
} from '../domain/transcription'

type WorkerMessage = {
  status?: string
  data?: string
  file?: string
  progress?: number
  total?: number
  modelId?: string
  text?: string
  message?: string
}

export class WhisperWebGpuEngine implements TranscriptionEngine {
  private readonly listeners = new Set<(event: TranscriptionEvent) => void>()
  private readonly worker: Worker

  constructor(workerFactory: () => Worker = createWhisperWorker) {
    this.worker = workerFactory()
    this.worker.addEventListener('message', this.handleMessage)
  }

  load(modelId: string) {
    this.worker.postMessage({ type: 'load', data: { modelId } })
  }

  transcribe(modelId: string, audio: Float32Array) {
    this.worker.postMessage({ type: 'transcribe', data: { audio, modelId } }, [audio.buffer])
  }

  subscribe(listener: (event: TranscriptionEvent) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  dispose() {
    this.worker.removeEventListener('message', this.handleMessage)
    this.worker.terminate()
    this.listeners.clear()
  }

  private readonly handleMessage = (event: MessageEvent<WorkerMessage>) => {
    const message = normalizeWorkerMessage(event.data)
    if (message) this.listeners.forEach((listener) => listener(message))
  }
}

export function createWhisperTranscriptionEngine(): TranscriptionEngine {
  return new WhisperWebGpuEngine()
}

function createWhisperWorker() {
  return new Worker(new URL('../whisperWorker.ts', import.meta.url), { type: 'module' })
}

function normalizeWorkerMessage(data: WorkerMessage): TranscriptionEvent | null {
  if (data.status === 'loading') {
    return { type: 'loading', message: data.data ?? 'Cargando modelo...' }
  }

  if ((data.status === 'initiate' || data.status === 'progress') && data.file) {
    const item: TranscriptionProgress = {
      file: data.file,
      progress: data.progress,
      total: data.total,
    }
    return { type: 'progress', item }
  }

  if (data.status === 'done' && data.file) return { type: 'file-complete', file: data.file }
  if (data.status === 'ready' && data.modelId) return { type: 'ready', modelId: data.modelId }
  if (data.status === 'start') return { type: 'transcribing' }
  if (data.status === 'complete') return { type: 'complete', text: data.text ?? '' }
  if (data.status === 'error') {
    return { type: 'error', message: data.message ?? 'No se pudo transcribir el audio.' }
  }

  return null
}
