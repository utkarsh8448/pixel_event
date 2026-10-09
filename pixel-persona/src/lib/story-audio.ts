let context: AudioContext | undefined;
export function chime(enabled: boolean, low = false) {
  if (!enabled) return;
  context ??= new AudioContext();
  void context.resume();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(low ? 180 : 520, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(low ? 70 : 780, context.currentTime + .2);
  gain.gain.setValueAtTime(.055, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .35);
  oscillator.connect(gain); gain.connect(context.destination);
  oscillator.start(); oscillator.stop(context.currentTime + .4);
}