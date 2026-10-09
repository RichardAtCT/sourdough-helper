// Timer alarm sound, synthesized with the Web Audio API.
// Browsers only allow audio after a user gesture, so call unlockAlarm()
// from a click handler (e.g. starting a timer) before the alarm is needed.

let audioContext = null;

export const unlockAlarm = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
};

// Plays three short beeps
export const playAlarm = () => {
  unlockAlarm();
  if (!audioContext) return;

  const start = audioContext.currentTime;
  for (let i = 0; i < 3; i++) {
    const t = start + i * 0.4;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(t);
    oscillator.stop(t + 0.3);
  }
};
