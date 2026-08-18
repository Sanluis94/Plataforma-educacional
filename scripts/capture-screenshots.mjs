import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_DIR = path.resolve(__dirname, '..');
const CURRICULARIZACAO_DIR = 'C:\\Users\\Asus\\Desktop\\Projeto integrador\\curricularização';
const VIDEOS_DIR = path.join(CURRICULARIZACAO_DIR, 'temp_videos');
const ENV_PATH = path.join(PROJECT_DIR, '.env');
const ENV_BAK_PATH = path.join(PROJECT_DIR, '.env.bak');

console.log('--- Configurando diretórios e ambiente ---');
if (!fs.existsSync(CURRICULARIZACAO_DIR)) {
  fs.mkdirSync(CURRICULARIZACAO_DIR, { recursive: true });
}
if (fs.existsSync(VIDEOS_DIR)) {
  console.log('Limpando diretório temporário de vídeos...');
  fs.readdirSync(VIDEOS_DIR).forEach(file => {
    try {
      fs.unlinkSync(path.join(VIDEOS_DIR, file));
    } catch (e) {}
  });
} else {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// 1. Temporariamente desativar o .env para forçar o modo de autenticação local
let envRenamed = false;
try {
  if (fs.existsSync(ENV_PATH)) {
    console.log('Renomeando .env para .env.bak para ativar o modo de autenticação local...');
    fs.renameSync(ENV_PATH, ENV_BAK_PATH);
    envRenamed = true;
  } else {
    console.log('Nenhum arquivo .env encontrado. O app já está no modo local.');
  }
} catch (err) {
  console.error('Erro ao renomear .env:', err);
}

let devServerProcess = null;

// Função de limpeza para restaurar o .env e parar o servidor
function cleanUp() {
  console.log('\n--- Realizando limpeza e restauração ---');
  if (devServerProcess) {
    console.log('Parando o servidor de desenvolvimento...');
    try {
      devServerProcess.kill('SIGINT');
      devServerProcess.kill('SIGTERM');
    } catch (e) {
      console.warn('Erro ao matar processo do servidor:', e);
    }
  }

  if (envRenamed && fs.existsSync(ENV_BAK_PATH)) {
    console.log('Restaurando .env.bak para .env...');
    try {
      if (fs.existsSync(ENV_PATH)) {
        fs.unlinkSync(ENV_PATH);
      }
      fs.renameSync(ENV_BAK_PATH, ENV_PATH);
      console.log('.env restaurado com sucesso.');
    } catch (err) {
      console.error('Erro ao restaurar .env:', err);
    }
  }
}

// Intercepta encerramentos inesperados para garantir a limpeza
process.on('exit', cleanUp);
process.on('SIGINT', () => {
  cleanUp();
  process.exit();
});
process.on('SIGTERM', () => {
  cleanUp();
  process.exit();
});

async function main() {
  try {
    // 2. Iniciar o servidor Vite
    console.log('Iniciando o servidor Vite...');
    devServerProcess = spawn('npm', ['run', 'dev'], {
      shell: true,
      cwd: PROJECT_DIR,
    });

    let port = 5173;
    const serverReady = new Promise((resolve, reject) => {
      let resolved = false;

      // Timeout de 20s
      const timeout = setTimeout(() => {
        if (!resolved) {
          console.warn('Timeout aguardando log do Vite. Usando porta padrão 5173.');
          resolved = true;
          resolve(5173);
        }
      }, 20000);

      devServerProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('[Vite stdout]:', output.trim());

        const match = output.match(/http:\/\/localhost:(\d+)/);
        if (match) {
          port = parseInt(match[1], 10);
          console.log(`Servidor Vite pronto e ouvindo na porta ${port}!`);
          resolved = true;
          clearTimeout(timeout);
          resolve(port);
        }
      });

      devServerProcess.stderr.on('data', (data) => {
        console.error('[Vite stderr]:', data.toString().trim());
      });

      devServerProcess.on('error', (err) => {
        console.error('Erro ao iniciar servidor Vite:', err);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          reject(err);
        }
      });
    });

    await serverReady;

    // Aguarda mais 2 segundos para o servidor estabilizar
    await new Promise(r => setTimeout(r, 2000));

    console.log('--- Iniciando automação com Playwright ---');
    const browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      recordVideo: {
        dir: VIDEOS_DIR,
        size: { width: 1280, height: 800 },
      },
    });

    const page = await context.newPage();
    let videoPath = null;
    try {
      const videoObj = page.video();
      if (videoObj) {
        videoPath = await videoObj.path();
        console.log('Vídeo sendo gravado em:', videoPath);
      }
    } catch (e) {
      console.warn('Não foi possível obter o caminho do vídeo:', e.message);
    }

    console.log(`Navegando para http://localhost:${port}...`);
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(3000);

    // --- CENA 1: LOGIN PAGE ---
    console.log('Abrindo modal de login...');
    await page.click('button:has-text("Começar Agora"), header button:has-text("Entrar")');
    await page.waitForTimeout(1500);

    console.log('Tirando Screenshot 1: Tela de Login');
    await page.screenshot({ path: path.join(CURRICULARIZACAO_DIR, 'login_page_1781651187666.png') });

    // --- CENA 2: PROFESSOR DASHBOARD ---
    console.log('Logando como Professor...');
    await page.click('button:has-text("Sou Professor")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Entrar localmente")');
    await page.waitForTimeout(3000);

    console.log('Tirando Screenshot 2: Painel do Professor');
    await page.screenshot({ path: path.join(CURRICULARIZACAO_DIR, 'professor_dashboard_1781651217795.png') });

    // Copiar código da primeira turma
    console.log('Lendo código da turma...');
    const classCodeElement = page.locator('div:has-text("Código da Turma:") strong').first();
    let classCode = 'class-001';
    if (await classCodeElement.isVisible()) {
      classCode = (await classCodeElement.innerText()).trim();
      console.log(`Código da turma obtido: ${classCode}`);
    } else {
      console.log(`Não foi possível achar o código na página. Usando código padrão: ${classCode}`);
    }

    console.log('Deslogando...');
    await page.click('button:has-text("Sair")');
    await page.waitForTimeout(2000);

    // --- CENA 3: STUDENT DASHBOARD & IA ---
    console.log('Logando como Estudante...');
    await page.click('header button:has-text("Entrar")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Sou Estudante")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Entrar localmente")');
    await page.waitForTimeout(4000); // Aguarda a IA carregar a recomendação

    console.log('Tirando Screenshot 3: Painel do Estudante');
    await page.screenshot({ path: path.join(CURRICULARIZACAO_DIR, 'student_dashboard_1781651203536.png') });

    // Matricular na turma
    console.log('Navegando para aba de Turmas...');
    await page.click('button:has-text("Turmas")');
    await page.waitForTimeout(1000);

    console.log(`Matriculando na turma com o código ${classCode}...`);
    await page.fill('input[placeholder="Ex: tB4xY9qR12kL"]', classCode);
    await page.waitForTimeout(500);
    await page.click('button:has-text("Entrar")');
    await page.waitForTimeout(2000);

    // --- CENA 4: FISICA SIMULATOR ---
    console.log('Navegando de volta para Aprendizado...');
    await page.click('button:has-text("Aprendizado")');
    await page.waitForTimeout(1000);

    console.log('Abrindo disciplina de Física...');
    await page.click('button:has-text("Física")');
    await page.waitForTimeout(1500);

    console.log('Abrindo simulador Cinemática do Pêndulo...');
    await page.click('button:has-text("Cinemática do Pêndulo"), button:has-text("Acessar Laboratório")');
    await page.waitForTimeout(2000);

    console.log('Iniciando animação do Pêndulo...');
    await page.click('button:has-text("Iniciar")');
    await page.waitForTimeout(4000); // Deixa rodar por 4 segundos para ver no vídeo

    console.log('Tirando Screenshot 4: Simulador de Física');
    await page.screenshot({ path: path.join(CURRICULARIZACAO_DIR, 'physics_simulator_1781651233813.png') });

    console.log('Concluindo atividade do Pêndulo...');
    await page.click('button:has-text("Concluir Laboratório")');
    await page.waitForTimeout(3000); // Aguarda animação de XP e retorno

    console.log('Voltando para lista de disciplinas...');
    await page.click('button:has-text("Voltar para Disciplinas")');
    await page.waitForTimeout(1500);

    // --- CENA 5: MATH SIMULATOR & VOLTA AO PROFESSOR ---
    console.log('Abrindo disciplina de Matemática...');
    await page.click('button:has-text("Matemática")');
    await page.waitForTimeout(1500);

    console.log('Abrindo simulador Função de 1º Grau...');
    await page.click('button:has-text("Função de 1º Grau"), button:has-text("Acessar Laboratório")');
    await page.waitForTimeout(2000);

    console.log('Tirando Screenshot 5: Simulador de Matemática');
    await page.screenshot({ path: path.join(CURRICULARIZACAO_DIR, 'math_simulator_1781651249815.png') });

    console.log('Concluindo atividade de Matemática...');
    await page.click('button:has-text("Finalizar Análise")');
    await page.waitForTimeout(2500);

    // Deslogar Estudante e logar Professor de volta para mostrar progresso reativo
    console.log('Deslogando Estudante...');
    await page.click('button:has-text("Sair")');
    await page.waitForTimeout(1500);

    console.log('Logando de volta como Professor para mostrar relatório...');
    await page.click('header button:has-text("Entrar")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Sou Professor")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Entrar localmente")');
    await page.waitForTimeout(2500);

    console.log('Abrindo relatório pedagógico...');
    await page.click('button:has-text("Visualizar Relatório")');
    await page.waitForTimeout(3500);

    console.log('Fechando navegador...');
    await context.close();
    await browser.close();

    // 3. Renomear o arquivo de vídeo gerado
    console.log('Processando gravação de vídeo...');
    // Aguardar 1 segundo para garantir que o arquivo de vídeo seja liberado pelo SO
    await new Promise(r => setTimeout(r, 1000));

    if (videoPath && fs.existsSync(videoPath)) {
      const destVideoPath = path.join(CURRICULARIZACAO_DIR, 'video_demonstracao.webm');
      fs.copyFileSync(videoPath, destVideoPath);
      console.log(`Vídeo copiado com sucesso para: ${destVideoPath}`);
    } else {
      // Fallback para varredura caso videoPath não tenha sido capturado
      const videoFiles = fs.readdirSync(VIDEOS_DIR).filter(file => file.endsWith('.webm'));
      console.log('Arquivos .webm encontrados no diretório temporário:', videoFiles);
      if (videoFiles.length > 0) {
        const srcVideoPath = path.join(VIDEOS_DIR, videoFiles[0]);
        const destVideoPath = path.join(CURRICULARIZACAO_DIR, 'video_demonstracao.webm');
        fs.copyFileSync(srcVideoPath, destVideoPath);
        console.log(`Vídeo copiado com sucesso (fallback) para: ${destVideoPath}`);
      } else {
        console.warn('Nenhum arquivo de vídeo .webm foi encontrado.');
      }
    }

    // Remover diretório temporário de vídeos
    try {
      fs.rmSync(VIDEOS_DIR, { recursive: true, force: true });
    } catch (e) {
      console.warn('Não foi possível remover o diretório temporário de vídeos:', e.message);
    }

    console.log('=== Processo concluído com SUCESSO! ===');
  } catch (error) {
    console.error('Ocorreu um erro crítico na execução do main:', error);
  } finally {
    cleanUp();
  }
}

main();
