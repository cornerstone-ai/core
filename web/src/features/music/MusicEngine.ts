export type MusicEngineOptions = {
  volume?: number
  bpm?: number
  theme?: string
}

// Simple audio-element-based engine to avoid regressions. Uses /music/loop.* from public/.
export class MusicEngine {
  private audio: HTMLAudioElement
  private disposed = false

  constructor(opts: MusicEngineOptions = {}) {
    const audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous'
    audio.volume = clamp(opts.volume ?? 0.25, 0, 1)

    // Provide multiple sources for compatibility; prefer mp3 with ogg fallback handled by the browser via <source> usually,
    // but for programmatic Audio() we set src to mp3 and let deployments optionally swap to ogg.
    // If mp3 404s, consumers should provide the correct asset. We expose a small retry on start().
    audio.src = '/music/loop.mp3'

    this.audio = audio
  }

  async start() {
    if (this.disposed) return
    try {
      await this.audio.play()
    } catch (err) {
      // Retry once with ogg if available
      if (!this.audio.src.endsWith('.ogg')) {
        this.audio.src = '/music/loop.ogg'
        try { await this.audio.play() } catch {}
      }
    }
  }

  stop() {
    if (this.disposed) return
    this.audio.pause()
  }

  setVolume(v: number) {
    if (this.disposed) return
    this.audio.volume = clamp(v, 0, 1)
  }

  setTheme(_theme: string) {
    // no-op for file-based loop; reserved for future per-theme tracks
  }

  dispose() {
    this.disposed = true
    try {
      this.audio.pause()
      // Release src to allow GC in some browsers
      this.audio.src = ''
      // @ts-ignore
      this.audio = null
    } catch {}
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
