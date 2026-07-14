import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Image,
  Loader2,
  Mic,
  Monitor,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Volume2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { miniStories, whisperModels, type MiniStory } from './data/content'
import { comparePronunciation, type PronunciationComparison } from './domain/matching'

type DeviceReport = {
  adapter: string
  browser: string
  cores: string
  deviceMemory: string
  hasHardwareAccelerationHint: boolean
  hasMediaRecorder: boolean
  hasMicrophoneApi: boolean
  hardwareAcceleration: string
  isSecureContext: boolean
  platform: string
  screen: string
  webgpu: boolean
}

type ProgressItem = {
  file: string
  progress?: number
  total?: number
}

type WorkerStatus = 'idle' | 'loading' | 'ready' | 'recording' | 'transcribing' | 'error'
type Stage = 'setup' | 'stories' | 'practice' | 'complete'

const AUDIO_SAMPLE_RATE = 16_000
const MAX_AUDIO_SECONDS = 12
const NOISE_LIMIT = 0.09

export default function PronunciacionActivity() {
  const [stage, setStage] = useState<Stage>('setup')
  const [selectedStoryId, setSelectedStoryId] = useState(miniStories[0].id)
  const [selectedModelId, setSelectedModelId] = useState(whisperModels[0].id)
  const [deviceReport, setDeviceReport] = useState<DeviceReport | null>(null)
  const [showSpecModal, setShowSpecModal] = useState(false)
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>('idle')
  const [loadedModelId, setLoadedModelId] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([])
  const [workerError, setWorkerError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [spokenText, setSpokenText] = useState('')
  const [comparison, setComparison] = useState<PronunciationComparison | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [noiseLevel, setNoiseLevel] = useState(0)
  const [microphoneError, setMicrophoneError] = useState('')
  const chunksRef = useRef<Blob[]>([])
  const workerRef = useRef<Worker | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserFrameRef = useRef<number | null>(null)

  const selectedStory = useMemo(
    () => miniStories.find((story) => story.id === selectedStoryId) ?? miniStories[0],
    [selectedStoryId],
  )
  const currentSentence = selectedStory.sentences[currentIndex] ?? selectedStory.sentences[0]
  const currentSentenceRef = useRef(currentSentence)
  const isCompatible = Boolean(
    deviceReport?.webgpu &&
      deviceReport.isSecureContext &&
      deviceReport.hasMicrophoneApi &&
      deviceReport.hasMediaRecorder,
  )
  const canStart = workerStatus === 'ready' && loadedModelId === selectedModelId && isCompatible

  useEffect(() => {
    let cancelled = false

    getDeviceReport().then((report) => {
      if (cancelled) return
      setDeviceReport(report)
      setShowSpecModal(
        !(report.webgpu && report.isSecureContext && report.hasMicrophoneApi && report.hasMediaRecorder),
      )
    })

    return () => {
      cancelled = true
      cleanupAudio()
      workerRef.current?.terminate()
    }
  }, [])

  useEffect(() => {
    if (loadedModelId !== selectedModelId) {
      setLoadingMessage('')
      setProgressItems([])
      setWorkerError('')
    }
  }, [loadedModelId, selectedModelId])

  useEffect(() => {
    currentSentenceRef.current = currentSentence
  }, [currentSentence])

  function ensureWorker() {
    if (workerRef.current) return workerRef.current

    const worker = new Worker(new URL('./whisperWorker.ts', import.meta.url), { type: 'module' })
    worker.addEventListener('message', (event) => {
      const data = event.data

      if (data.status === 'loading') {
        setWorkerStatus('loading')
        setLoadingMessage(data.data ?? 'Cargando modelo...')
        return
      }

      if (data.status === 'initiate' || data.status === 'progress') {
        setProgressItems((items) => upsertProgress(items, data))
        return
      }

      if (data.status === 'done') {
        setProgressItems((items) => items.filter((item) => item.file !== data.file))
        return
      }

      if (data.status === 'ready') {
        setLoadedModelId(data.modelId)
        setWorkerStatus('ready')
        setLoadingMessage('Modelo listo')
        return
      }

      if (data.status === 'start') {
        setWorkerStatus('transcribing')
        return
      }

      if (data.status === 'complete') {
        const text = data.text ?? ''
        const nextComparison = comparePronunciation(currentSentenceRef.current, text)
        setSpokenText(text)
        setComparison(nextComparison)
        setAttempts((value) => value + 1)
        setWorkerStatus('ready')
        return
      }

      if (data.status === 'error') {
        setWorkerStatus('error')
        setWorkerError(data.message ?? 'No se pudo transcribir el audio.')
      }
    })

    workerRef.current = worker
    return worker
  }

  function loadSelectedModel() {
    if (!isCompatible) {
      setShowSpecModal(true)
      return
    }

    setWorkerError('')
    setProgressItems([])
    setWorkerStatus('loading')
    ensureWorker().postMessage({ type: 'load', data: { modelId: selectedModelId } })
  }

  async function startRecording() {
    if (!canStart) return

    setWorkerError('')
    setMicrophoneError('')
    setComparison(null)
    setSpokenText('')

    try {
      const stream = await ensureMicrophone()
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      recorder.onstop = () => transcribeRecording(recorder.mimeType)
      recorder.start()
      setWorkerStatus('recording')
    } catch (error) {
      setMicrophoneError(getMicrophoneErrorMessage(error))
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
  }

  async function transcribeRecording(mimeType: string) {
    try {
      setWorkerStatus('transcribing')
      const blob = new Blob(chunksRef.current, { type: mimeType })
      const buffer = await blob.arrayBuffer()
      const context = getAudioContext()
      const decoded = await context.decodeAudioData(buffer.slice(0))
      const channel = decoded.getChannelData(0)
      const maxLength = AUDIO_SAMPLE_RATE * MAX_AUDIO_SECONDS
      const trimmed = channel.length > maxLength ? channel.slice(channel.length - maxLength) : channel
      const audio = new Float32Array(trimmed)

      ensureWorker().postMessage({ type: 'transcribe', data: { audio, modelId: selectedModelId } }, [audio.buffer])
    } catch (error) {
      setWorkerStatus('ready')
      setWorkerError(error instanceof Error ? error.message : 'No se pudo procesar la grabación.')
    }
  }

  async function ensureMicrophone() {
    if (streamRef.current) return streamRef.current

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
      },
    })
    streamRef.current = stream
    startNoiseMeter(stream)
    return stream
  }

  function getAudioContext() {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE })
    }

    return audioContextRef.current
  }

  function startNoiseMeter(stream: MediaStream) {
    const context = getAudioContext()
    const source = context.createMediaStreamSource(stream)
    const analyser = context.createAnalyser()
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.fftSize = 1024
    source.connect(analyser)

    const tick = () => {
      analyser.getByteTimeDomainData(data)
      let sum = 0
      for (const value of data) {
        const centered = (value - 128) / 128
        sum += centered * centered
      }
      setNoiseLevel(Math.sqrt(sum / data.length))
      analyserFrameRef.current = requestAnimationFrame(tick)
    }

    tick()
  }

  function cleanupAudio() {
    if (analyserFrameRef.current !== null) cancelAnimationFrame(analyserFrameRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    audioContextRef.current?.close().catch(() => undefined)
  }

  function speakCurrent() {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(currentSentence)
    utterance.lang = 'es-CL'
    utterance.rate = 0.82
    window.speechSynthesis.speak(utterance)
  }

  function goNext() {
    if (!comparison?.accepted) return

    if (currentIndex < selectedStory.sentences.length - 1) {
      setCurrentIndex((index) => index + 1)
      setSpokenText('')
      setComparison(null)
      return
    }

    setStage('complete')
  }

  function chooseStory(story: MiniStory) {
    setSelectedStoryId(story.id)
    setCurrentIndex(0)
    setSpokenText('')
    setComparison(null)
    setAttempts(0)
    setStage('practice')
  }

  function returnToStories() {
    setCurrentIndex(0)
    setSpokenText('')
    setComparison(null)
    setAttempts(0)
    setStage('stories')
  }

  if (stage === 'complete') {
    return (
      <section className="pronunciation pronunciation-complete">
        <div className="pronunciation-confetti" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <Sparkles size={38} />
        <span className="task-badge">Minihistoria completa</span>
        <h2>¡Muy bien! Terminaste {selectedStory.title}</h2>
        <p>Leíste todas las oraciones en voz alta.</p>
        <div className="pronunciation-actions">
          <button className="primary-button" onClick={returnToStories} type="button">
            <RefreshCcw size={18} />
            Elegir otra minihistoria
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="pronunciation">
      {showSpecModal && deviceReport ? (
        <SpecModal
          deviceReport={deviceReport}
          isCompatible={isCompatible}
          onClose={() => setShowSpecModal(false)}
        />
      ) : null}

      {stage === 'setup' ? (
        <SetupScreen
          canStart={canStart}
          deviceReport={deviceReport}
          isCompatible={isCompatible}
          loadingMessage={loadingMessage}
          progressItems={progressItems}
          selectedModelId={selectedModelId}
          setSelectedModelId={setSelectedModelId}
          workerError={workerError}
          workerStatus={workerStatus}
          onLoadModel={loadSelectedModel}
          onOpenSpecs={() => setShowSpecModal(true)}
          onStart={() => setStage('stories')}
        />
      ) : stage === 'stories' ? (
        <StoryMenuScreen
          deviceReport={deviceReport}
          isCompatible={isCompatible}
          onChooseStory={chooseStory}
          onOpenSpecs={() => setShowSpecModal(true)}
        />
      ) : (
        <PracticeScreen
          attempts={attempts}
          comparison={comparison}
          currentIndex={currentIndex}
          currentSentence={currentSentence}
          story={selectedStory}
          isNoisy={noiseLevel > NOISE_LIMIT}
          microphoneError={microphoneError}
          noiseLevel={noiseLevel}
          spokenText={spokenText}
          workerError={workerError}
          workerStatus={workerStatus}
          onNext={goNext}
          onSpeak={speakCurrent}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
        />
      )}
    </section>
  )
}

function SetupScreen(props: {
  canStart: boolean
  deviceReport: DeviceReport | null
  isCompatible: boolean
  loadingMessage: string
  onLoadModel: () => void
  onOpenSpecs: () => void
  onStart: () => void
  progressItems: ProgressItem[]
  selectedModelId: string
  setSelectedModelId: (modelId: string) => void
  workerError: string
  workerStatus: WorkerStatus
}) {
  return (
    <div className="pronunciation-setup">
      <div className="pronunciation-menu-layout">
        <div className="pronunciation-menu-main">
          <section className="pronunciation-hero">
            <span className="task-badge">Rezago lector</span>
            <h2>Hola, vamos a practicar lectura en voz alta</h2>
            <p>Primero descarga el modelo de voz para este equipo.</p>
          </section>

          <section className="pronunciation-panel">
            <PanelTitle icon={<Cpu size={20} />} title="Modelo de voz" />
            <div className="pronunciation-models">
              {whisperModels.map((model) => (
                <button
                  className={props.selectedModelId === model.id ? 'is-selected' : ''}
                  key={model.id}
                  onClick={() => props.setSelectedModelId(model.id)}
                  type="button"
                >
                  <span>{model.tag}</span>
                  <strong>{model.label}</strong>
                  <small>
                    {model.description} {model.size}
                  </small>
                </button>
              ))}
            </div>
          </section>

          <section className="pronunciation-panel pronunciation-load-panel">
            <PanelTitle icon={<Mic size={20} />} title="Preparar Whisper" />
            <p>La primera carga descarga el modelo. Después queda guardado en caché del navegador.</p>
            <button
              className="primary-button"
              disabled={props.workerStatus === 'loading' || !props.isCompatible}
              onClick={props.onLoadModel}
              type="button"
            >
              {props.workerStatus === 'loading' ? <Loader2 className="spin" size={18} /> : <Cpu size={18} />}
              {props.workerStatus === 'loading' ? 'Cargando...' : 'Descargar modelo'}
            </button>
            {props.loadingMessage ? <p className="pronunciation-loading-text">{props.loadingMessage}</p> : null}
            {props.progressItems.length > 0 ? <ProgressList items={props.progressItems} /> : null}
            {props.workerError ? <p className="pronunciation-error">{props.workerError}</p> : null}
          </section>

          <section className="pronunciation-start-panel">
            <span>Cuando el modelo esté listo</span>
            <button className="primary-button" disabled={!props.canStart} onClick={props.onStart} type="button">
              Elegir minihistoria
              <ChevronRight size={18} />
            </button>
          </section>
        </div>

        <EquipmentSidebar
          deviceReport={props.deviceReport}
          isCompatible={props.isCompatible}
          onOpenSpecs={props.onOpenSpecs}
        />
      </div>
    </div>
  )
}

function StoryMenuScreen(props: {
  deviceReport: DeviceReport | null
  isCompatible: boolean
  onChooseStory: (story: MiniStory) => void
  onOpenSpecs: () => void
}) {
  return (
    <div className="pronunciation-setup">
      <div className="pronunciation-menu-layout">
        <div className="pronunciation-menu-main">
          <section className="pronunciation-hero">
            <span className="task-badge">Rezago lector</span>
            <h2>Elige una minihistoria</h2>
            <p>Lee cada oración en voz alta. Whisper escuchará tu voz.</p>
          </section>

          <section className="pronunciation-panel pronunciation-story-list">
            <PanelTitle icon={<BookOpen size={20} />} title="Minihistorias disponibles" />
            <div className="pronunciation-story-cards">
              {miniStories.map((story) => (
                <article className="pronunciation-story-card" key={story.id}>
                  <div className="pronunciation-story-image" aria-label={`Imagen pendiente: ${story.imageHint}`}>
                    <Image size={28} />
                    <span>Imagen después</span>
                  </div>
                  <div>
                    <h3>{story.title}</h3>
                    <p>{story.description}</p>
                    <small>{story.sentences.length} oraciones cortas</small>
                  </div>
                  <button className="primary-button" onClick={() => props.onChooseStory(story)} type="button">
                    Comenzar
                    <ChevronRight size={18} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>

        <EquipmentSidebar
          deviceReport={props.deviceReport}
          isCompatible={props.isCompatible}
          onOpenSpecs={props.onOpenSpecs}
        />
      </div>
    </div>
  )
}

function EquipmentSidebar(props: {
  deviceReport: DeviceReport | null
  isCompatible: boolean
  onOpenSpecs: () => void
}) {
  return (
    <aside className="pronunciation-panel pronunciation-spec-summary">
      <PanelTitle icon={<ShieldCheck size={20} />} title="Estado del equipo" />
      {props.deviceReport ? (
        <>
          <div className={`pronunciation-status ${props.isCompatible ? 'is-ok' : 'is-bad'}`}>
            {props.isCompatible ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {props.isCompatible ? 'Compatible' : 'No compatible'}
          </div>
          <SpecList deviceReport={props.deviceReport} />
        </>
      ) : (
        <p>Revisando este equipo...</p>
      )}
      <button className="secondary-button" onClick={props.onOpenSpecs} type="button">
        <Monitor size={18} />
        Ver especificaciones
      </button>
    </aside>
  )
}

function PracticeScreen(props: {
  attempts: number
  comparison: PronunciationComparison | null
  currentIndex: number
  currentSentence: string
  isNoisy: boolean
  microphoneError: string
  noiseLevel: number
  onNext: () => void
  onSpeak: () => void
  onStartRecording: () => void
  onStopRecording: () => void
  spokenText: string
  story: MiniStory
  workerError: string
  workerStatus: WorkerStatus
}) {
  const isRecording = props.workerStatus === 'recording'
  const isBusy = props.workerStatus === 'transcribing'
  const hasRecognizedSpeech = props.spokenText.trim().length > 0
  const canGoNext = Boolean(props.comparison?.accepted)

  return (
    <div className="pronunciation-reading-layout">
      <main className="pronunciation-practice">
        <header className="pronunciation-topbar">
          <div>
            <span className="task-badge">Oración {props.currentIndex + 1} de {props.story.sentences.length}</span>
            <h2>{props.story.title}</h2>
            <p>Lee la oración actual con calma.</p>
          </div>
          <div className="pronunciation-score">
            <span>Intentos</span>
            <strong>{props.attempts}</strong>
          </div>
        </header>

        <section className="pronunciation-word-card" aria-label="Texto esperado">
          {props.comparison ? (
            props.comparison.wordMatches.map((match, index) => (
              <span className={`word-chip is-${match.state}`} key={`${match.expected}-${index}`}>
                {match.expected}
              </span>
            ))
          ) : (
            <span>{props.currentSentence}</span>
          )}
        </section>

        <div className="pronunciation-controls">
          <button className="secondary-button" onClick={props.onSpeak} type="button">
            <Volume2 size={20} />
            Escuchar
          </button>
          {isRecording ? (
            <button className="danger-button" onClick={props.onStopRecording} type="button">
              <Square size={20} />
              Detener
            </button>
          ) : (
            <button
              className="primary-button"
              disabled={isBusy}
              onClick={props.onStartRecording}
              type="button"
            >
              {isBusy ? <Loader2 className="spin" size={20} /> : <Mic size={20} />}
              {isBusy ? 'Revisando...' : 'Grabar'}
            </button>
          )}
        </div>

        <div className={`pronunciation-noise ${props.isNoisy ? 'is-noisy' : ''}`}>
          <span style={{ width: `${Math.min(100, props.noiseLevel * 650)}%` }} />
          <strong>{props.isNoisy ? 'Hay harto ruido cerca' : 'Filtro de ruido activo'}</strong>
        </div>

        {props.spokenText ? (
          <section className="pronunciation-transcript">
            <span>Whisper escuchó</span>
            <p>{props.spokenText}</p>
          </section>
        ) : props.comparison ? (
          <section className="pronunciation-transcript">
            <span>Whisper escuchó</span>
            <p>No se escuchó una palabra clara.</p>
          </section>
        ) : null}

        {props.comparison ? (
          <section className={`pronunciation-feedback ${props.comparison.accepted ? 'is-ok' : 'is-try'}`}>
            <strong>
              {props.comparison.accepted
                ? 'Muy bien, se entendió claro.'
                : hasRecognizedSpeech
                  ? 'Casi, probemos de nuevo.'
                  : 'No se escuchó claro, probemos de nuevo.'}
            </strong>
            <span>Coincidencia: {props.comparison.score}%</span>
            {props.comparison.extraWords.length > 0 ? (
              <small>También se escuchó: {props.comparison.extraWords.join(', ')}</small>
            ) : null}
            {!canGoNext ? <small>Inténtalo de nuevo para avanzar a la próxima oración.</small> : null}
            <button className="primary-button" disabled={!canGoNext} onClick={props.onNext} type="button">
              Siguiente
              <ChevronRight size={18} />
            </button>
          </section>
        ) : (
          <p className="pronunciation-helper">Graba tu lectura para revisar la oración.</p>
        )}

        {props.microphoneError ? <p className="pronunciation-error">{props.microphoneError}</p> : null}
        {props.workerError ? <p className="pronunciation-error">{props.workerError}</p> : null}
      </main>

      <aside className="pronunciation-story-sidebar">
        <PanelTitle icon={<BookOpen size={20} />} title="Minihistoria completa" />
        <h3>{props.story.title}</h3>
        <ol>
          {props.story.sentences.map((sentence, index) => (
            <li
              className={[
                index === props.currentIndex ? 'is-current' : '',
                index < props.currentIndex ? 'is-done' : '',
              ].filter(Boolean).join(' ')}
              key={sentence}
            >
              <span>{index + 1}</span>
              <p>{sentence}</p>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  )
}

function SpecModal({
  deviceReport,
  isCompatible,
  onClose,
}: {
  deviceReport: DeviceReport
  isCompatible: boolean
  onClose: () => void
}) {
  return (
    <div className="pronunciation-modal-backdrop" role="presentation">
      <section aria-labelledby="spec-modal-title" className="pronunciation-modal" role="dialog">
        <button aria-label="Cerrar" className="icon-button" onClick={onClose} type="button">
          <X size={19} />
        </button>
        {isCompatible ? <Monitor size={30} /> : <AlertTriangle size={30} />}
        <h2 id="spec-modal-title">
          {isCompatible ? 'Especificaciones del equipo' : 'Este equipo no cumple las especificaciones básicas'}
        </h2>
        <p>
          {isCompatible
            ? 'Este equipo puede cargar Whisper WebGPU para trabajar localmente en el navegador.'
            : 'Para usar Whisper local se necesita Chrome o Edge actualizado, WebGPU activo, aceleración por hardware y micrófono disponible.'}
        </p>
        <SpecList deviceReport={deviceReport} />
      </section>
    </div>
  )
}

function SpecList({ compact = false, deviceReport }: { compact?: boolean; deviceReport: DeviceReport }) {
  const specs = [
    ['WebGPU', deviceReport.webgpu ? 'Compatible' : 'No disponible'],
    ['Contexto seguro', deviceReport.isSecureContext ? 'Sí' : 'No'],
    ['Aceleración', deviceReport.hardwareAcceleration],
    ['Micrófono', deviceReport.hasMicrophoneApi ? 'Disponible' : 'No disponible'],
    ['Grabación', deviceReport.hasMediaRecorder ? 'Disponible' : 'No disponible'],
    ['GPU', deviceReport.adapter],
    ['Navegador', deviceReport.browser],
    ['Sistema', deviceReport.platform],
    ['CPU', deviceReport.cores],
    ['Memoria', deviceReport.deviceMemory],
    ['Pantalla', deviceReport.screen],
  ]

  return (
    <dl className={`pronunciation-spec-list ${compact ? 'is-compact' : ''}`}>
      {specs.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ProgressList({ items }: { items: ProgressItem[] }) {
  return (
    <div className="pronunciation-progress-list">
      {items.map((item) => {
        const progress = item.progress ?? 0
        return (
          <div key={item.file}>
            <span>{item.file}</span>
            <div>
              <i style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
            <small>
              {progress.toFixed(1)}%{item.total ? ` de ${formatBytes(item.total)}` : ''}
            </small>
          </div>
        )
      })}
    </div>
  )
}

function PanelTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="pronunciation-panel-title">
      {icon}
      <h3>{title}</h3>
    </div>
  )
}

function upsertProgress(items: ProgressItem[], data: ProgressItem) {
  if (!data.file) return items
  const index = items.findIndex((item) => item.file === data.file)

  if (index === -1) {
    return [...items, data]
  }

  return items.map((item) => (item.file === data.file ? { ...item, ...data } : item))
}

async function getDeviceReport(): Promise<DeviceReport> {
  const nav = navigator as Navigator & {
    deviceMemory?: number
    gpu?: { requestAdapter: () => Promise<{ info?: { description?: string; vendor?: string } } | null> }
    userAgentData?: { brands?: { brand: string; version: string }[]; platform?: string }
  }
  const adapter = nav.gpu ? await nav.gpu.requestAdapter().catch(() => null) : null
  const browser = nav.userAgentData?.brands?.map((brand) => `${brand.brand} ${brand.version}`).join(', ') ?? navigator.userAgent
  const adapterInfo = adapter?.info

  return {
    adapter: adapterInfo?.description || adapterInfo?.vendor || (adapter ? 'GPU detectada' : 'No detectada'),
    browser,
    cores: `${navigator.hardwareConcurrency ?? 'No informado'} núcleos`,
    deviceMemory: nav.deviceMemory ? `${nav.deviceMemory} GB aprox.` : 'No informado',
    hasHardwareAccelerationHint: Boolean(nav.gpu),
    hardwareAcceleration: nav.gpu ? 'Disponible' : 'No detectada',
    hasMediaRecorder: 'MediaRecorder' in window,
    hasMicrophoneApi: Boolean(navigator.mediaDevices?.getUserMedia),
    isSecureContext: window.isSecureContext,
    platform: nav.userAgentData?.platform ?? navigator.platform,
    screen: `${window.screen.width} x ${window.screen.height}`,
    webgpu: Boolean(nav.gpu && adapter),
  }
}

function getMicrophoneErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return 'El micrófono está bloqueado. Revisa el permiso del navegador y vuelve a intentar.'
  }

  if (error instanceof DOMException && error.name === 'NotFoundError') {
    return 'No se encontró un micrófono disponible en este equipo.'
  }

  return error instanceof Error ? error.message : 'No se pudo abrir el micrófono.'
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`
}
