// Simple WebAudio step sequencer that synthesizes a cute chiptune-like loop (MIDI-ish via JS)
// No external dependencies. Designed to be started/stopped from a user gesture.

export type MusicEngineOptions = {
  bpm?: number
  volume?: number // 0..1
  theme?: string
}

export class MusicEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private filter: BiquadFilterNode | null = null
  private lookahead = 0.025 // seconds
  private scheduleAhead = 0.15 // seconds
  private timerId: number | null = null
  private nextNoteTime = 0
  private stepIndex = 0
  private stepsPerBeat = 2 // 8th notes
  private bpm = 120
  private volume = 0.25
  private theme = 'pink'

  constructor(opts?: MusicEngineOptions) {
    if (opts?.bpm) this.bpm = opts.bpm
    if (opts?.volume != null) this.volume = opts.volume
    if (opts?.theme) this.theme = opts.theme
  }

  setTheme(theme: string) {
    this.theme = theme
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v))
    if (this.master) this.master.gain.value = this.volume
  }

  setBpm(bpm: number) {
    this.bpm = Math.max(60, Math.min(180, bpm))
  }

  async start() {
    if (!this.ctx) this.createGraph()
    if (!this.ctx) return
    await this.ctx.resume()
    // Initialize scheduling window
    this.nextNoteTime = this.ctx.currentTime + 0.05
    if (this.timerId == null) {
      this.timerId = window.setInterval(() => this.scheduler(), this.lookahead * 1000)
    }
  }

  async stop() {
    if (this.timerId != null) {
      window.clearInterval(this.timerId)
      this.timerId = null
    }
    if (this.ctx) {
      // Keep context for quick resume, but silence immediately
      await this.ctx.suspend().catch(() => {})
    }
  }

  dispose() {
    if (this.timerId != null) {
      window.clearInterval(this.timerId)
      this.timerId = null
    }
    try {
      this.ctx?.close()
    } catch {}
    this.ctx = null
    this.master = null
    this.filter = null
  }

  private createGraph() {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
      if (!Ctx) return
      const ctx: AudioContext = new Ctx()
      const master = ctx.createGain()
      master.gain.value = this.volume
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 2200
      filter.Q.value = 0.8
      filter.connect(master)
      master.connect(ctx.destination)

      this.ctx = ctx
      this.master = master
      this.filter = filter
    } catch {}
  }

  private scheduler() {
    const ctx = this.ctx
    if (!ctx) return
    while (this.nextNoteTime < ctx.currentTime + this.scheduleAhead) {
      this.scheduleStep(this.stepIndex, this.nextNoteTime)
      this.next()
    }
  }

  private next() {
    const secondsPerBeat = 60 / this.bpm
    this.nextNoteTime += secondsPerBeat / this.stepsPerBeat
    this.stepIndex = (this.stepIndex + 1) % 16 // 2 bars of 4/4 at 8th notes
  }

  // Cute game loop pattern; varies waveform and notes by theme
  private scheduleStep(step: number, time: number) {
    const ctx = this.ctx!, dest = this.filter ?? this.master!
    const scaleC = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88] // C major
    const scaleA = [220.00, 246.94, 277.18, 293.66, 329.63, 369.99, 415.30] // A minor

    const isBright = ['yellow', 'orange', 'pink', 'purple'].includes(this.theme)
    const scale = isBright ? scaleC : scaleA

    const root = isBright ? scale[0] : scale[5] // C or A minor emphasis

    // Bass on downbeats
    if (step % 4 === 0) {
      this.triggerVoice({
        time,
        freq: root / 2,
        dur: 0.18,
        type: 'square',
        gain: 0.18,
      }, dest)
    }

    // Arp pattern across steps
    const arp = [0, 2, 4, 7, 4, 2, 0, 7]
    const arpIndex = step % arp.length
    const freq = scale[(arp[arpIndex] % scale.length)] * 2 // high register
    const accent = (step % 2 === 0) ? 1 : 0.85

    this.triggerVoice({
      time,
      freq,
      dur: 0.14,
      type: isBright ? 'triangle' : 'square',
      gain: 0.12 * accent,
    }, dest)

    // Occasional sparkle
    if (step === 7 || step === 15) {
      this.triggerVoice({ time, freq: freq * 1.5, dur: 0.08, type: 'sine', gain: 0.08 }, dest)
    }
  }

  private triggerVoice(opts: { time: number; freq: number; dur: number; type: OscillatorType; gain: number }, dest: AudioNode) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.type = opts.type
    osc.frequency.setValueAtTime(opts.freq, opts.time)

    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0005, opts.time)
    env.gain.exponentialRampToValueAtTime(Math.max(0.0006, opts.gain), opts.time + 0.01)
    env.gain.exponentialRampToValueAtTime(0.0005, opts.time + opts.dur)

    osc.connect(env)
    env.connect(dest)

    osc.start(opts.time)
    osc.stop(opts.time + opts.dur + 0.02)
  }
}
