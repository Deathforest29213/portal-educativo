import { pipeline } from '@huggingface/transformers'

type LoadMessage = {
  data: { modelId: string }
  type: 'load'
}

type TranscribeMessage = {
  data: { audio: Float32Array; modelId: string }
  type: 'transcribe'
}

type WorkerInput = LoadMessage | TranscribeMessage

type Transcriber = (audio: Float32Array, options: Record<string, unknown>) => Promise<{ text?: string } | { text?: string }[]>

const transcribers = new Map<string, Promise<Transcriber>>()
const createSpeechPipeline = pipeline as unknown as (
  task: 'automatic-speech-recognition',
  modelId: string,
  options: Record<string, unknown>,
) => Promise<Transcriber>

function postError(error: unknown) {
  self.postMessage({
    status: 'error',
    message: error instanceof Error ? error.message : 'No se pudo usar Whisper en este equipo.',
  })
}

async function getTranscriber(modelId: string) {
  let current = transcribers.get(modelId)

  if (!current) {
    current = createSpeechPipeline('automatic-speech-recognition', modelId, {
      device: 'webgpu',
      dtype: {
        decoder_model_merged: 'q4',
        encoder_model: 'fp32',
      },
      progress_callback: (event: unknown) => self.postMessage(event),
    })
    transcribers.set(modelId, current)
  }

  return current
}

async function loadModel(modelId: string) {
  self.postMessage({ status: 'loading', data: 'Cargando modelo de voz...' })
  await getTranscriber(modelId)
  self.postMessage({ status: 'ready', modelId })
}

async function transcribeAudio(modelId: string, audio: Float32Array) {
  self.postMessage({ status: 'start' })
  const transcriber = await getTranscriber(modelId)
  const output = await transcriber(audio, {
    language: 'spanish',
    task: 'transcribe',
    return_timestamps: false,
  })
  const result = Array.isArray(output) ? output[0] : output

  self.postMessage({
    status: 'complete',
    text: result?.text?.trim() ?? '',
  })
}

self.addEventListener('message', async (event: MessageEvent<WorkerInput>) => {
  try {
    if (event.data.type === 'load') {
      await loadModel(event.data.data.modelId)
      return
    }

    await transcribeAudio(event.data.data.modelId, event.data.data.audio)
  } catch (error) {
    postError(error)
  }
})
