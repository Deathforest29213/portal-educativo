import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Loader2,
  Mic,
  Monitor,
  Play,
  RefreshCcw,
  ShieldCheck,
  Square,
  Volume2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { practiceItems, whisperModels, type PracticeMode } from './data/content'
import { comparePronunciation, type PronunciationComparison } from './domain/matching'

type DeviceReport = {
  adapter: string
  browser: string
  cores: string
  deviceMemory: string
  hasHardwareAccelerationHint: boolean
  hasMediaRecorder: boolean
  hasMicrophoneApi: boolean
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
type Stage = 'setup' | 'practice' | 'complete'

const AUDIO_SAMPLE_RATE = 16_000
const MAX_AUDIO_SECONDS = 12
const NOISE_LIMIT = 0.09

export default function PronunciacionActivity() {
  const [stage, setStage] = useState<Stage>('setup')
  const [mode, setMode] = useState<PracticeMode>('frases')
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
  const [correctCount, setCorrectCount] = useState(0)
  const [noiseLevel, setNoiseLevel] = useState(0)
  const [microphoneError, setMicrophoneError] = useState('')
  const chunksRef = useRef<Blob[]>([])
  const workerRef = useRef<Worker | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserFrameRef = useRef<number | null>(null)

  const visibleItems = useMemo(() => practiceItems.filter((item) => item.mode === mode), [mode])
  const currentItem = visibleItems[currentIndex]
  const currentItemRef = useRef(currentItem)
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
    setCurrentIndex(0)
    setSpokenText('')
    setComparison(null)
    setAttempts(0)
    setCorrectCount(0)
  }, [mode])

  useEffect(() => {
    currentItemRef.current = currentItem
  }, [currentItem])

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
        const nextComparison = comparePronunciation(currentItemRef.current.text, text)
        setSpokenText(text)
        setComparison(nextComparison)
        setAttempts((value) => value + 1)
        setCorrectCount((value) => value + (nextComparison.accepted ? 1 : 0))
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
      setMicrophoneError(error instanceof Error ? error.message : 'No se pudo abrir el microfono.')
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
      setWorkerError(error instanceof Error ? error.message : 'No se pudo procesar la grabacion.')
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
    const utterance = new SpeechSynthesisUtterance(currentItem.text)
    utterance.lang = 'es-CL'
    utterance.rate = 0.82
    window.speechSynthesis.speak(utterance)
  }

  function goNext() {
    if (currentIndex < visibleItems.length - 1) {
      setCurrentIndex((index) => index + 1)
      setSpokenText('')
      setComparison(null)
      return
    }

    setStage('complete')
  }

  function restart() {
    setCurrentIndex(0)
    setSpokenText('')
    setComparison(null)
    setAttempts(0)
    setCorrectCount(0)
    setStage('setup')
  }

  if (stage === 'complete') {
    return (
      <section className="pronunciation pronunciation-complete">
        <span className="task-badge">Pronunciacion</span>
        <h2>Actividad terminada</h2>
        <p>
          Lograste {correctCount} de {visibleItems.length} intentos correctos.
        </p>
        <div className="pronunciation-actions">
          <button className="primary-button" onClick={restart} type="button">
            <RefreshCcw size={18} />
            Volver al menu
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
          mode={mode}
          progressItems={progressItems}
          selectedModelId={selectedModelId}
          setMode={setMode}
          setSelectedModelId={setSelectedModelId}
          workerError={workerError}
          workerStatus={workerStatus}
          onLoadModel={loadSelectedModel}
          onOpenSpecs={() => setShowSpecModal(true)}
          onStart={() => setStage('practice')}
        />
      ) : (
        <PracticeScreen
          attempts={attempts}
          comparison={comparison}
          currentIndex={currentIndex}
          currentItem={currentItem}
          isNoisy={noiseLevel > NOISE_LIMIT}
          microphoneError={microphoneError}
          noiseLevel={noiseLevel}
          spokenText={spokenText}
          totalItems={visibleItems.length}
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
  mode: PracticeMode
  onLoadModel: () => void
  onOpenSpecs: () => void
  onStart: () => void
  progressItems: ProgressItem[]
  selectedModelId: string
  setMode: (mode: PracticeMode) => void
  setSelectedModelId: (modelId: string) => void
  workerError: string
  workerStatus: WorkerStatus
}) {
  return (
    <div className="pronunciation-setup">
      <div className="pronunciation-hero">
        <div>
          <span className="task-badge">Rezago lector</span>
          <h2>Practiquemos pronunciacion</h2>
          <p>Elige una modalidad, revisa el equipo y carga Whisper antes de comenzar.</p>
        </div>
        <button className="secondary-button" onClick={props.onOpenSpecs} type="button">
          <Monitor size={18} />
          Ver equipo
        </button>
      </div>

      <div className="pronunciation-setup-grid">
        <section className="pronunciation-panel">
          <PanelTitle icon={<Play size={20} />} title="Modalidad" />
          <div className="pronunciation-segments">
            <button
              className={props.mode === 'palabras' ? 'is-active' : ''}
              onClick={() => props.setMode('palabras')}
              type="button"
            >
              Palabras
            </button>
            <button
              className={props.mode === 'frases' ? 'is-active' : ''}
              onClick={() => props.setMode('frases')}
              type="button"
            >
              Frases cortas
            </button>
          </div>
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

        <section className="pronunciation-panel pronunciation-spec-summary">
          <PanelTitle icon={<ShieldCheck size={20} />} title="Compatibilidad" />
          {props.deviceReport ? (
            <SpecList deviceReport={props.deviceReport} compact />
          ) : (
            <p>Revisando este equipo...</p>
          )}
          <div className={`pronunciation-status ${props.isCompatible ? 'is-ok' : 'is-bad'}`}>
            {props.isCompatible ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {props.isCompatible ? 'Equipo compatible' : 'Falta un requisito'}
          </div>
        </section>

        <section className="pronunciation-panel pronunciation-load-panel">
          <PanelTitle icon={<Mic size={20} />} title="Preparar Whisper" />
          <p>La primera carga descarga el modelo. Despues queda guardado en cache del navegador.</p>
          <button
            className="primary-button"
            disabled={props.workerStatus === 'loading' || !props.isCompatible}
            onClick={props.onLoadModel}
            type="button"
          >
            {props.workerStatus === 'loading' ? <Loader2 className="spin" size={18} /> : <Cpu size={18} />}
            {props.workerStatus === 'loading' ? 'Cargando...' : 'Cargar modelo'}
          </button>
          {props.loadingMessage ? <p className="pronunciation-loading-text">{props.loadingMessage}</p> : null}
          {props.progressItems.length > 0 ? <ProgressList items={props.progressItems} /> : null}
          {props.workerError ? <p className="pronunciation-error">{props.workerError}</p> : null}
          <button className="primary-button" disabled={!props.canStart} onClick={props.onStart} type="button">
            Comenzar
            <ChevronRight size={18} />
          </button>
        </section>
      </div>
    </div>
  )
}

function PracticeScreen(props: {
  attempts: number
  comparison: PronunciationComparison | null
  currentIndex: number
  currentItem: { support: string; text: string }
  isNoisy: boolean
  microphoneError: string
  noiseLevel: number
  onNext: () => void
  onSpeak: () => void
  onStartRecording: () => void
  onStopRecording: () => void
  spokenText: string
  totalItems: number
  workerError: string
  workerStatus: WorkerStatus
}) {
  const isRecording = props.workerStatus === 'recording'
  const isBusy = props.workerStatus === 'transcribing'

  return (
    <div className="pronunciation-practice">
      <header className="pronunciation-topbar">
        <div>
          <span className="task-badge">Frase {props.currentIndex + 1} de {props.totalItems}</span>
          <h2>{props.currentItem.text}</h2>
          <p>{props.currentItem.support}</p>
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
          <span>{props.currentItem.text}</span>
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
          <span>Whisper escucho</span>
          <p>{props.spokenText}</p>
        </section>
      ) : null}

      {props.comparison ? (
        <section className={`pronunciation-feedback ${props.comparison.accepted ? 'is-ok' : 'is-try'}`}>
          <strong>
            {props.comparison.accepted ? 'Muy bien, se entendio claro.' : 'Casi, probemos de nuevo.'}
          </strong>
          <span>Coincidencia: {props.comparison.score}%</span>
          {props.comparison.extraWords.length > 0 ? (
            <small>Tambien se escucho: {props.comparison.extraWords.join(', ')}</small>
          ) : null}
          <button className="primary-button" onClick={props.onNext} type="button">
            Siguiente
            <ChevronRight size={18} />
          </button>
        </section>
      ) : null}

      {props.microphoneError ? <p className="pronunciation-error">{props.microphoneError}</p> : null}
      {props.workerError ? <p className="pronunciation-error">{props.workerError}</p> : null}
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
            : 'Para usar Whisper local se necesita Chrome o Edge actualizado, WebGPU activo, aceleracion por hardware y microfono disponible.'}
        </p>
        <SpecList deviceReport={deviceReport} />
      </section>
    </div>
  )
}

function SpecList({ compact = false, deviceReport }: { compact?: boolean; deviceReport: DeviceReport }) {
  const specs = [
    ['WebGPU', deviceReport.webgpu ? 'Compatible' : 'No disponible'],
    ['Contexto seguro', deviceReport.isSecureContext ? 'Si' : 'No'],
    ['Microfono', deviceReport.hasMicrophoneApi ? 'Disponible' : 'No disponible'],
    ['Grabacion', deviceReport.hasMediaRecorder ? 'Disponible' : 'No disponible'],
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
    cores: `${navigator.hardwareConcurrency ?? 'No informado'} nucleos`,
    deviceMemory: nav.deviceMemory ? `${nav.deviceMemory} GB aprox.` : 'No informado',
    hasHardwareAccelerationHint: Boolean(nav.gpu),
    hasMediaRecorder: 'MediaRecorder' in window,
    hasMicrophoneApi: Boolean(navigator.mediaDevices?.getUserMedia),
    isSecureContext: window.isSecureContext,
    platform: nav.userAgentData?.platform ?? navigator.platform,
    screen: `${window.screen.width} x ${window.screen.height}`,
    webgpu: Boolean(nav.gpu && adapter),
  }
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
