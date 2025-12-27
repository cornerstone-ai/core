// MusicEngine: MIDI-backed background music player using Tone.js
// Plays /decoded_track.mid from the Vite public folder and loops until stopped.

import * as Tone from 'tone'
import { Midi } from '@tonejs/midi'

export type MusicEngineOptions = {
  volume?: number // 0..1
  bpm?: number // optional hint; MIDI file tempo is respected if present
  theme?: string // optional: can be used to vary synth characteristics later
  speed?: number // playback speed multiplier; 2 = double speed
}

export class MusicEngine {
  private gain: Tone.Gain
  private volume: number
  private theme?: string
  private bpm?: number
  private speed: number

  private loaded = false
  private loading?: Promise<void>
  private disposed = false

  private synths: Tone.PolySynth[] = []
  private parts: Tone.Part[] = []

  private readonly midiUrl = '/decoded_track.mid'

  constructor(opts: MusicEngineOptions = {}) {
    this.volume = opts.volume ?? 0.25
    this.bpm = opts.bpm
    this.theme = opts.theme
    this.speed = Math.max(0.1, opts.speed ?? 1)

    // Master gain to control volume smoothly
    this.gain = new Tone.Gain(this.volume).toDestination()
  }

  setTheme(theme?: string) {
    this.theme = theme
    // Future: adjust synth options based on theme (e.g., oscillator type)
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v))
    // Use a short ramp for click-free changes
    this.gain.gain.rampTo(this.volume, 0.05)
  }

  // Note: changing speed after load would require rescheduling events.
  // For now, setSpeed applies to the next start()/load() cycle.
  setSpeed(mult: number) {
    this.speed = Math.max(0.1, mult)
  }

  private async ensureLoaded() {
    if (this.disposed) return
    if (this.loaded) return
    if (!this.loading) this.loading = this.load()
    return this.loading
  }

  private async load() {
    // Ensure AudioContext is unlocked as part of a user gesture via Tone.start()
    await Tone.start()

    // Parse MIDI
    const midi = await Midi.fromUrl(this.midiUrl)

    // Optional: honor external bpm if provided, else keep MIDI tempo map
    if (this.bpm) {
      Tone.Transport.bpm.value = this.bpm
    } else if (midi.header?.tempos?.length) {
      // Use the first tempo as a baseline; MIDI tempo changes will be baked into note times
      Tone.Transport.bpm.value = midi.header.tempos[0].bpm
    }

    // Clean existing schedule
    Tone.Transport.cancel(0)

    // Apply speed multiplier by scaling the loop end and all event times/durations
    const speed = this.speed
    const loopEnd = midi.duration / speed // seconds
    Tone.Transport.loop = true
    Tone.Transport.loopStart = 0
    Tone.Transport.loopEnd = loopEnd

    // Simple, light synth for background music. We use a single PolySynth to reduce CPU.
    const poly = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.8 },
    }).connect(this.gain)

    // Flatten all track notes; MIDI note times are in seconds already
    const events = midi.tracks.flatMap(t => t.notes.map(n => ({
      time: n.time / speed,
      name: n.name,
      duration: Math.max(0.005, n.duration / speed),
      velocity: n.velocity,
    })))

    // Schedule with a Part so it can loop with the Transport
    const part = new Tone.Part((time, ev: { name: string; duration: number; velocity: number }) => {
      poly.triggerAttackRelease(ev.name, ev.duration, time, ev.velocity)
    }, events)

    part.loop = true
    part.loopEnd = loopEnd
    part.start(0)

    this.synths = [poly]
    this.parts = [part]
    this.loaded = true
  }

  async start() {
    if (this.disposed) return
    await this.ensureLoaded()
    await Tone.start() // iOS/Safari safety
    Tone.Transport.start()
  }

  stop() {
    if (this.disposed) return
    Tone.Transport.stop()
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    try {
      this.stop()
      // Stop and dispose parts/synths
      this.parts.forEach(p => { try { p.stop(); p.dispose() } catch { /* noop */ } })
      this.synths.forEach(s => { try { s.dispose() } catch { /* noop */ } })
      this.parts = []
      this.synths = []
      this.loaded = false
    } catch {
      // noop
    }
  }
}
