// Seleção dos elementos do DOM
const luzVermelha = document.getElementById('luzVermelha');
const luzAmarela = document.getElementById('luzAmarela');
const luzVerde = document.getElementById('luzVerde');
const btnIniciar = document.getElementById('btnIniciar');
const statusText = document.getElementById('statusText');

let audioContext;
let analyser;
let microphone;
let isListening = false;

// Evento de clique no botão para iniciar
btnIniciar.addEventListener('click', async () => {
  try {
    // Solicita acesso ao microfone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    // Cria o contexto de áudio
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Garante que o AudioContext esteja ativo (alguns navegadores iniciam em modo suspenso)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Configura o AnalyserNode para capturar frequências de som
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    // Conecta a fonte do microfone ao analisador
    microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);

    // Atualiza a interface
    btnIniciar.style.display = 'none';
    statusText.innerText = 'Medindo ruído...';
    isListening = true;

    // Inicia o loop de medição contínua
    medirAudio();

  } catch (err) {
    alert('Permissão de microfone negada ou não suportada.');
    console.error('Erro ao acessar o microfone:', err);
  }
});

// Função executada a cada quadro de renderização (60fps)
function medirAudio() {
  if (!isListening) return;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  // Calcula a média das frequências capturadas
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }
  const volume = sum / dataArray.length;

  // Atualiza as luzes com base no volume medido
  atualizarSemaforo(volume);

  // Chama a função novamente no próximo ciclo do navegador
  requestAnimationFrame(medirAudio);
}

// Função para controlar as classes das luzes
function atualizarSemaforo(volume) {
  // Apaga todas as luzes
  luzVermelha.classList.remove('ativo');
  luzAmarela.classList.remove('ativo');
  luzVerde.classList.remove('ativo');

  // Define os limites de volume para alternar o semáforo
  if (volume < 15) {
    // Silencioso
    luzVerde.classList.add('ativo');
    statusText.innerText = 'Ambiente Silencioso (Verde)';
  } else if (volume >= 15 && volume < 35) {
    // Ruído Moderado
    luzAmarela.classList.add('ativo');
    statusText.innerText = 'Ruído Moderado (Amarelo)';
  } else {
    // Muito Barulho
    luzVermelha.classList.add('ativo');
    statusText.innerText = 'Muito Barulho! (Vermelho)';
  }
}
