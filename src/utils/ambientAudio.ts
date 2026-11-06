// Procedural Web Audio API sound generator for study focus
// Generates Rain, Brown/Pink Noise, and Alpha Wave Focus Beats without external audio assets

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private currentType: string | null = null;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.4;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(type: 'rain' | 'binaural' | 'white_noise' | 'brown_noise' | 'waves', volume: number = 0.4) {
    this.initContext();
    if (!this.ctx) return;
    this.stop();

    this.currentType = type;
    this.volume = volume;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (type === 'white_noise' || type === 'brown_noise' || type === 'rain' || type === 'waves') {
      this.playNoiseBased(type);
    } else if (type === 'binaural') {
      this.playBinauralBeats();
    }

    this.isPlaying = true;
  }

  private playNoiseBased(type: string) {
    if (!this.ctx || !this.gainNode) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'brown_noise' || type === 'rain') {
        // Brown noise filter (integrated white noise)
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain compensation
      } else if (type === 'waves') {
        output[i] = (lastOut + 0.015 * white) / 1.015;
        lastOut = output[i];
        output[i] *= 4.0;
      } else {
        output[i] = white * 0.25;
      }
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.filterNode = this.ctx.createBiquadFilter();

    if (type === 'rain') {
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(800, this.ctx.currentTime);
    } else if (type === 'brown_noise') {
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(400, this.ctx.currentTime);
    } else if (type === 'waves') {
      this.filterNode.type = 'bandpass';
      this.filterNode.frequency.setValueAtTime(350, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(0.7, this.ctx.currentTime);

      // Modulate frequency to simulate rolling waves
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec ocean wave period
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(this.filterNode.frequency);
      lfo.start();
    } else {
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(1200, this.ctx.currentTime);
    }

    whiteNoise.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    whiteNoise.start(0);
    this.noiseNode = whiteNoise;
  }

  private playBinauralBeats() {
    if (!this.ctx || !this.gainNode) return;

    // 140Hz left ear, 150Hz right ear => 10Hz Alpha Waves (relaxed alert focus)
    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(140, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(150, this.ctx.currentTime);

    const leftGain = this.ctx.createGain();
    leftGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    const rightGain = this.ctx.createGain();
    rightGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    oscLeft.connect(leftGain);
    oscRight.connect(rightGain);

    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);

    merger.connect(this.gainNode);

    oscLeft.start();
    oscRight.start();

    this.noiseNode = oscLeft;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as any).stop?.();
        this.noiseNode.disconnect();
      } catch (e) {
        // ignore already stopped
      }
      this.noiseNode = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this.isPlaying = false;
    this.currentType = null;
  }

  public playChime() {
    this.initContext();
    if (!this.ctx) return;

    // Pleasant completion chime (E5 -> G#5 -> B5 arpeggio)
    const now = this.ctx.currentTime;
    const notes = [659.25, 830.61, 987.77];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.85);
    });
  }

  public getActive() {
    return {
      isPlaying: this.isPlaying,
      currentType: this.currentType,
      volume: this.volume,
    };
  }
}

export const ambientAudio = new AmbientAudioEngine();
