type BrowserWindowWithWebkitAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

export function playFeedbackSound(isCorrect: boolean) {
  const AudioContextClass =
    window.AudioContext ||
    (window as BrowserWindowWithWebkitAudio).webkitAudioContext
  if (!AudioContextClass) return

  const context = new AudioContextClass()
  const tones = isCorrect ? [523.25, 659.25, 783.99] : [220, 164.81]
  const now = context.currentTime

  tones.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = isCorrect ? 'sine' : 'triangle'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.001, now + index * 0.1)
    gain.gain.exponentialRampToValueAtTime(0.16, now + index * 0.1 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.16)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now + index * 0.1)
    oscillator.stop(now + index * 0.1 + 0.18)
  })
}
