// src/utils/sound.js

export function playSpinSound(context) {
  const bufferSize = 2 * context.sampleRate;
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer;

  const filter = context.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 600;
  filter.Q.value = 1.0;

  noise.connect(filter).connect(context.destination);
  noise.start();
  noise.stop(context.currentTime + 0.5);
}

export function playWinSound(context) {
  const now = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.connect(gain).connect(context.destination);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.02);

  const freqs = [523.25, 659.25, 783.99];
  freqs.forEach((f, i) => {
    osc.frequency.setValueAtTime(f, now + i * 0.15);
  });

  osc.start(now);
  osc.stop(now + freqs.length * 0.15 + 0.1);
}
