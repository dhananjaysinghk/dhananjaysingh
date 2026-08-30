// Web Audio API Synthesizer for 0kb zero-dependency UI Sound FX

class SoundFX {
  private ctx: AudioContext | null = null
  private isMuted: boolean = true

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ds_sound_enabled")
        this.isMuted = saved !== "true" // Default to muted for polite UX
      } catch {
        this.isMuted = true
      }
    }
  }

  private initCtx() {
    if (typeof window === "undefined") return
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        this.ctx = new AudioContextClass()
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume()
    }
  }

  public toggleSound(): boolean {
    this.initCtx()
    this.isMuted = !this.isMuted
    if (typeof window !== "undefined") {
      localStorage.setItem("ds_sound_enabled", (!this.isMuted).toString())
    }
    if (!this.isMuted) {
      this.playChime()
    }
    return !this.isMuted
  }

  public getSoundEnabled(): boolean {
    return !this.isMuted
  }

  // 1. Soft UI Click (Pop)
  public playClick() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(800, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04)

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.04)
    } catch {
      // Ignore audio glitches
    }
  }

  // 2. Navigation Switch / Toggle Chime
  public playToggle() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = "triangle"
      osc.frequency.setValueAtTime(440, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.06)

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.06)
    } catch {
      // Ignore audio glitches
    }
  }

  // 3. Activation Chime
  public playChime() {
    this.initCtx()
    if (!this.ctx) return

    try {
      const notes = [523.25, 659.25, 783.99] // C5, E5, G5
      notes.forEach((freq, idx) => {
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05)

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime + idx * 0.05)
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          this.ctx.currentTime + idx * 0.05 + 0.12
        )

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(this.ctx.currentTime + idx * 0.05)
        osc.stop(this.ctx.currentTime + idx * 0.05 + 0.12)
      })
    } catch {
      // Ignore audio glitches
    }
  }
}

export const soundFx = new SoundFX()
