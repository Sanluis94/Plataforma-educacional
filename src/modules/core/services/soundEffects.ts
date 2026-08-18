/**
 * SoundEffects — Sintetizador de efeitos sonoros usando a Web Audio API.
 * Permite reproduzir sons rápidos de feedback sem depender de arquivos de áudio estáticos.
 */
class SoundEffects {
  private static ctx: AudioContext | null = null;

  private static getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Som de moeda (ganho de moedas ou compra de item).
   * Dois bips curtos e crescentes que dão a sensação de recompensa retrô.
   */
  public static playCoin() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // Nota B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // Nota E6

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('[SoundEffects] Falha ao sintetizar som de moeda:', e);
    }
  }

  /**
   * Fanfarra de conquista/desbloqueio.
   * Acorde arpejado brilhante usando onda de triângulo para som retrô de flauta.
   */
  public static playUnlock() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
      };

      playTone(523.25, now, 0.15); // C5
      playTone(659.25, now + 0.1, 0.15); // E5
      playTone(783.99, now + 0.2, 0.15); // G5
      playTone(1046.50, now + 0.3, 0.45); // C6
    } catch (e) {
      console.warn('[SoundEffects] Falha ao sintetizar som de conquista:', e);
    }
  }
}

export default SoundEffects;
