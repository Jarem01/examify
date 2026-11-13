/**
 * Tiny synthesized feedback tones — no audio files, no network.
 * Kept quiet and short on purpose: these should read as a confirmation,
 * not a game show.
 */

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!context) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      context = new Ctor();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return null;
  }
}

function tone(
  frequency: number,
  duration: number,
  gain: number,
  delay = 0,
  type: OscillatorType = 'sine',
): void {
  const ctx = audio();
  if (!ctx) return;
  try {
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  } catch {
    /* audio is best-effort */
  }
}

export function playCorrect(enabled = true): void {
  if (!enabled) return;
  tone(659, 0.09, 0.045);
  tone(988, 0.11, 0.03, 0.055);
}

export function playIncorrect(enabled = true): void {
  if (!enabled) return;
  tone(233, 0.12, 0.045, 0, 'triangle');
  tone(185, 0.14, 0.028, 0.06, 'triangle');
}

export function playFeedback(correct: boolean, enabled = true): void {
  if (correct) playCorrect(enabled);
  else playIncorrect(enabled);
}
