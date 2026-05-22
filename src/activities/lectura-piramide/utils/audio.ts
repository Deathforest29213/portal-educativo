import { useRef } from 'react'

type ToneKind = 'step' | 'success'

export function useTonePlayer() {
  const audioRef = useRef<AudioContext | null>(null)

  return (kind: ToneKind) => {
    const webAudioWindow = window as Window &
      typeof globalThis & {
        webkitAudioContext?: typeof AudioContext
      }
    const AudioContextClass = webAudioWindow.AudioContext ?? webAudioWindow.webkitAudioContext
    if (!AudioContextClass) return

    if (!audioRef.current) {
      audioRef.current = new AudioContextClass()
    }

    const context = audioRef.current
    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = kind === 'success' ? 'triangle' : 'sine'
    oscillator.frequency.setValueAtTime(kind === 'success' ? 660 : 360, now)
    oscillator.frequency.exponentialRampToValueAtTime(
      kind === 'success' ? 990 : 420,
      now + 0.18,
    )

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(kind === 'success' ? 0.12 : 0.06, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.24)
  }
}
