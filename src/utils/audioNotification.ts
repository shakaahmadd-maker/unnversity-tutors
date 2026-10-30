// Web Audio API Synthesizer for Message Notification Chimes and In-App Notifications

class AudioNotificationService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Check local storage for sound preference (enabled by default)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ut_sound_enabled');
      this.soundEnabled = stored !== null ? stored === 'true' : true;
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ut_sound_enabled', String(enabled));
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch (e) {
      console.warn('[Audio] Failed to initialize AudioContext:', e);
      return null;
    }
  }

  /**
   * Play a clean, musical 2-tone chime when a message is successfully sent.
   */
  public playSentSound() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Note 2: B5 (987.77 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.08);
      gain2.gain.setValueAtTime(0.001, now + 0.08);
      gain2.gain.linearRampToValueAtTime(0.22, now + 0.095);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.28);
    } catch (e) {
      console.warn('[Audio] Error playing sent chime:', e);
    }
  }

  /**
   * Play a pleasant 3-tone melodic musical chime ("music") when an incoming text arrives.
   * Plays C5 (523Hz) -> G5 (784Hz) -> C6 (1046Hz) chord bell melody.
   */
  public playReceivedSound() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const notes = [
        { freq: 523.25, start: 0, duration: 0.12, gain: 0.18 },   // C5
        { freq: 659.25, start: 0.07, duration: 0.14, gain: 0.20 }, // E5
        { freq: 783.99, start: 0.14, duration: 0.18, gain: 0.22 }, // G5
        { freq: 1046.50, start: 0.21, duration: 0.35, gain: 0.25 } // C6
      ];

      notes.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Use smooth triangle/sine hybrid for a warm marimba/celesta bell quality
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.start);

        const startTime = now + note.start;
        const endTime = startTime + note.duration;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(note.gain, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(endTime);
      });
    } catch (e) {
      console.warn('[Audio] Error playing received chime:', e);
    }
  }
}

export const audioNotifier = new AudioNotificationService();

export interface ToastNotification {
  id: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  chatId: string;
  content: string;
  timestamp: string;
}
