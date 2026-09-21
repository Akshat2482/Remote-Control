// Minimal high-tech Web Audio SFX generator for holographic tactile feedback

class SoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Futuristic digital chirp for command selection
  playChirp() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio playback fails gracefully if muted
    }
  }

  // Arc reactor low energy pulse sound
  playReactorHum() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(320, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // Silently catch
    }
  }

  // Tactical mouse click sound
  playClick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Ignore
    }
  }

  // Arc pulse sound
  playArcPulse() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // Ignore
    }
  }

  // Sentry lockdown alert tone
  playAlert() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.setValueAtTime(450, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {
      // Ignore
    }
  }
}

export const sfx = new SoundEffects();

// Web Speech Synthesis wrapper for JARVIS British AI voice
let cachedDefaultVoice: SpeechSynthesisVoice | null = null;

export function getJarvisDefaultVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Check if user locked in a voice URI in localStorage
  try {
    const lockedURI = localStorage.getItem("jarvis_locked_voice_uri");
    if (lockedURI) {
      const found = voices.find((v) => v.voiceURI === lockedURI);
      if (found) {
        cachedDefaultVoice = found;
        return found;
      }
    }
  } catch {
    // Ignore storage issues
  }

  if (cachedDefaultVoice && voices.some((v) => v.voiceURI === cachedDefaultVoice?.voiceURI)) {
    return cachedDefaultVoice;
  }

  // Consistent stable priority selection
  const britishVoice =
    voices.find(
      (v) =>
        v.lang.startsWith("en-GB") &&
        (v.name.toLowerCase().includes("male") ||
          v.name.toLowerCase().includes("george") ||
          v.name.toLowerCase().includes("daniel") ||
          v.name.toLowerCase().includes("uk"))
    ) ||
    voices.find((v) => v.lang.startsWith("en-GB")) ||
    voices.find((v) => v.name.toLowerCase().includes("natural") && v.lang.startsWith("en")) ||
    voices.find((v) => v.lang.startsWith("en-US")) ||
    voices[0];

  if (britishVoice) {
    cachedDefaultVoice = britishVoice;
    try {
      localStorage.setItem("jarvis_locked_voice_uri", britishVoice.voiceURI);
    } catch {
      // Ignore
    }
  }
  return cachedDefaultVoice;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    getJarvisDefaultVoice();
  };
}

export function speakAsJarvis(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 0.95;
  utterance.rate = 1.05;

  const defaultVoice = getJarvisDefaultVoice();
  if (defaultVoice) {
    utterance.voice = defaultVoice;
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}

