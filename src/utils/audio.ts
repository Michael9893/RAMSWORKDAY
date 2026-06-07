/**
 * Highly functional Web Audio API synthesizer for offline focus drones and reminder chimes
 */

export class AmbientSynth {
  private ctx: AudioContext | null = null;
  private oscs: OscillatorNode[] = [];
  private gains: GainNode[] = [];
  private intervalId: any = null;
  private masterGain: GainNode | null = null;

  start(frequency: number = 110, waveType: "sine" | "triangle" | "sawtooth" = "sine") {
    this.stop();
    
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("AudioContext initialization failed", e);
      return;
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.06, this.ctx.currentTime); // default comfortable soft level
    this.masterGain.connect(this.ctx.destination);

    // Setup base soft warming drone 
    const osc1 = this.ctx.createOscillator();
    const filter1 = this.ctx.createBiquadFilter();
    const gain1 = this.ctx.createGain();

    osc1.type = waveType;
    osc1.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    
    filter1.type = "lowpass";
    filter1.frequency.setValueAtTime(320, this.ctx.currentTime); // keeps it ultra smooth and warm

    gain1.gain.setValueAtTime(0.5, this.ctx.currentTime);

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(this.masterGain);

    osc1.start();
    this.oscs.push(osc1);
    this.gains.push(gain1);

    // Perfect fifth layer drone
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(frequency * 1.5, this.ctx.currentTime);
    gain2.gain.setValueAtTime(0.25, this.ctx.currentTime);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    
    osc2.start();
    this.oscs.push(osc2);
    this.gains.push(gain2);

    // Procedural light focus bell echoes triggering every 5 seconds
    const triggerBell = () => {
      if (!this.ctx || !this.masterGain) return;
      const chordNotes = [1, 1.25, 1.5, 1.875, 2, 2.5, 3]; // Major and minor harmonic intervals
      const randomMultiplier = chordNotes[Math.floor(Math.random() * chordNotes.length)];
      const bellFreq = frequency * 2 * randomMultiplier;

      const bellOsc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      const bellFilter = this.ctx.createBiquadFilter();

      bellOsc.type = "sine";
      bellOsc.frequency.setValueAtTime(bellFreq, this.ctx.currentTime);

      bellFilter.type = "bandpass";
      bellFilter.frequency.setValueAtTime(bellFreq, this.ctx.currentTime);

      bellGain.gain.setValueAtTime(0, this.ctx.currentTime);
      bellGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.08); // soft attack
      bellGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.5); // long delay

      bellOsc.connect(bellFilter);
      bellFilter.connect(bellGain);
      bellGain.connect(this.masterGain);

      bellOsc.start();
      bellOsc.stop(this.ctx.currentTime + 4.0);
    };

    triggerBell();
    this.intervalId = setInterval(triggerBell, 5000);
  }

  playChime(type: "break-start" | "break-end" | "success" | "warning") {
    try {
      const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gainNode = tempCtx.createGain();
      gainNode.gain.setValueAtTime(0.12, tempCtx.currentTime);
      gainNode.connect(tempCtx.destination);

      let notes: number[] = [];
      if (type === "success") {
        notes = [261.63, 329.63, 392.00, 523.25]; // Uplifting ascending C major
      } else if (type === "warning") {
        notes = [392.00, 311.13, 233.08]; // Minor scale descend warning
      } else if (type === "break-start") {
        notes = [440.00, 554.37, 659.25, 880.00]; // Rich cheerful break alert
      } else { // break-end
        notes = [523.25, 440.00, 349.23, 261.63]; // Descendent return-to-work focus
      }

      notes.forEach((freq, idx) => {
        const osc = tempCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, tempCtx.currentTime + idx * 0.12);
        
        const noteGain = tempCtx.createGain();
        noteGain.gain.setValueAtTime(0.08, tempCtx.currentTime + idx * 0.12);
        noteGain.gain.exponentialRampToValueAtTime(0.001, tempCtx.currentTime + idx * 0.12 + 0.5);

        osc.connect(noteGain);
        noteGain.connect(gainNode);

        osc.start(tempCtx.currentTime + idx * 0.12);
        osc.stop(tempCtx.currentTime + idx * 0.12 + 0.5);
      });
    } catch (e) {
      console.warn("Procedural chime failed:", e);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.oscs.forEach(osc => {
      try { osc.stop(); } catch(e){}
    });
    this.oscs = [];
    this.gains = [];
    if (this.ctx) {
      try { this.ctx.close(); } catch(e){}
      this.ctx = null;
    }
    this.masterGain = null;
  }

  setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(volume * 0.15, this.ctx.currentTime);
    }
  }
}

export const ambientSynth = new AmbientSynth();
