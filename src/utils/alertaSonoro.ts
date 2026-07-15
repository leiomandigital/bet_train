export function tocarAlertaFimIntervalo(): void {
  try {
    const AudioContextClasse =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const contexto = new AudioContextClasse();
    const osciloscopio = contexto.createOscillator();
    const ganho = contexto.createGain();

    osciloscopio.type = "sine";
    osciloscopio.frequency.value = 880;
    ganho.gain.setValueAtTime(0.2, contexto.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.001, contexto.currentTime + 0.4);

    osciloscopio.connect(ganho);
    ganho.connect(contexto.destination);
    osciloscopio.start();
    osciloscopio.stop(contexto.currentTime + 0.4);
  } catch {
    // Web Audio indisponível (ex: navegador sem suporte) — ignora, o alerta visual continua funcionando.
  }

  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
}
