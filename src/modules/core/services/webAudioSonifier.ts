/**
 * Sonificador Científico de Dados via Web Audio API
 * e Disparador de Feedback Háptico
 * Melhorias #13 e #16 do Plano Estratégico
 */

class WebAudioSonifier {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isMuted: boolean = false;
  private isContinuousPlaying: boolean = false;

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.gainNode) {
      this.gainNode.gain.setValueAtTime(0, this.audioCtx?.currentTime || 0);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Emite um tom sonoro contínuo cuja frequência varia com a grandeza telemétrica
   * Exemplo: de 150 Hz a 1000 Hz baseado em um valor de 0 a 100
   */
  public updateContinuousPitch(val: number, minVal: number = 0, maxVal: number = 100) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const clampedVal = Math.max(minVal, Math.min(maxVal, val));
    const normalized = (clampedVal - minVal) / Math.max(1, maxVal - minVal);
    const targetFreq = 180 + normalized * 800; // 180 Hz a 980 Hz

    if (!this.oscillator || !this.isContinuousPlaying) {
      this.oscillator = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(targetFreq, this.audioCtx.currentTime);
      this.gainNode.gain.setValueAtTime(0.05, this.audioCtx.currentTime);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
      this.oscillator.start();
      this.isContinuousPlaying = true;
    } else {
      this.oscillator.frequency.setTargetAtTime(targetFreq, this.audioCtx.currentTime, 0.05);
    }
  }

  public stopContinuousPitch() {
    if (this.oscillator && this.isContinuousPlaying) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (_e) {}
      this.oscillator = null;
      this.isContinuousPlaying = false;
    }
  }

  /**
   * Toca um clique curto (estilo contador Geiger ou evento de colisão)
   */
  public playClick(frequency: number = 800) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (_e) {}
  }

  /**
   * Acorde harmônico de sucesso na conclusão do experimento
   */
  public playSuccessChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // Dó, Mi, Sol, Dó
    notes.forEach((freq, idx) => {
      try {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        const startTime = this.audioCtx!.currentTime + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.06, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      } catch (_e) {}
    });

    // Feedback háptico se disponível no dispositivo
    this.triggerHaptic([30, 50, 60]);
  }

  /**
   * Dispara vibração háptica no celular se suportado
   */
  public triggerHaptic(pattern: number | number[] = 40) {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (_e) {}
    }
  }
}

export const sonifier = new WebAudioSonifier();
