export type TranscriptionProgress = {
  file: string
  progress?: number
  total?: number
}

export type TranscriptionEvent =
  | { type: 'loading'; message: string }
  | { type: 'progress'; item: TranscriptionProgress }
  | { type: 'file-complete'; file: string }
  | { type: 'ready'; modelId: string }
  | { type: 'transcribing' }
  | { type: 'complete'; text: string }
  | { type: 'error'; message: string }

export interface TranscriptionEngine {
  load(modelId: string): void
  transcribe(modelId: string, audio: Float32Array): void
  subscribe(listener: (event: TranscriptionEvent) => void): () => void
  dispose(): void
}
