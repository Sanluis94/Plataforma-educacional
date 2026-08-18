import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

const CURRICULARIZACAO_DIR = 'C:\\Users\\Asus\\Desktop\\Projeto integrador\\curricularização';
const INPUT_PATH = path.join(CURRICULARIZACAO_DIR, 'video_demonstracao.webm');
const OUTPUT_PATH = path.join(CURRICULARIZACAO_DIR, 'video_demonstracao.mp4');

console.log('--- Iniciando conversão de vídeo ---');
console.log('Caminho do ffmpeg:', ffmpegPath);
console.log('Vídeo de origem:', INPUT_PATH);
console.log('Vídeo de destino:', OUTPUT_PATH);

if (!fs.existsSync(INPUT_PATH)) {
  console.error('Erro: O arquivo de origem não existe:', INPUT_PATH);
  process.exit(1);
}

if (!ffmpegPath) {
  console.error('Erro: O binário do ffmpeg não foi encontrado por ffmpeg-static.');
  process.exit(1);
}

// Executar conversão via ffmpeg
const ffmpegProcess = spawn(ffmpegPath, [
  '-y',                 // Sobrescrever se já existir
  '-i', INPUT_PATH,     // Entrada
  '-c:v', 'libx264',    // Codec de vídeo H.264
  '-pix_fmt', 'yuv420p',// Formato de pixel compatível com Windows Media Player
  '-preset', 'slow',    // Preset de compressão
  '-crf', '22',         // Fator de qualidade (boa qualidade e tamanho baixo)
  OUTPUT_PATH           // Saída
], {
  stdio: 'inherit'
});

ffmpegProcess.on('close', (code) => {
  if (code === 0) {
    console.log('=== Vídeo convertido com SUCESSO para MP4! ===');
    console.log('Arquivo gerado:', OUTPUT_PATH);
    
    // Opcional: remover o .webm original para não ocupar espaço duplicado
    try {
      fs.unlinkSync(INPUT_PATH);
      console.log('Vídeo .webm original removido para economizar espaço.');
    } catch (e) {
      console.warn('Não foi possível remover o arquivo .webm original:', e.message);
    }
  } else {
    console.error(`Erro: O ffmpeg terminou com código de saída ${code}`);
  }
});
