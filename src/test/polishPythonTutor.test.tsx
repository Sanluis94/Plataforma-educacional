import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import {LabPythonRunnerModal} from '../modules/ux/components/labs/LabPythonRunnerModal';
import {LabSocraticTutorModal} from '../modules/ux/components/labs/LabSocraticTutorModal';
const ai=vi.hoisted(()=>({key:null as string|null,call:vi.fn()}));
vi.mock('../modules/core/services/geminiService',()=>({getEffectiveGeminiApiKey:()=>ai.key,callGeminiWithKey:ai.call}));
class TestWorker{static latest:TestWorker;onmessage:((event:MessageEvent)=>void)|null=null;onerror:((event:Event)=>void)|null=null;addEventListener(type:string,handler:unknown){if(type==='message')this.onmessage=handler as (event:MessageEvent)=>void;if(type==='error')this.onerror=handler as (event:Event)=>void;}removeEventListener=vi.fn();postMessage=vi.fn();terminate=vi.fn();constructor(){TestWorker.latest=this;}}
beforeEach(()=>{ai.key=null;ai.call.mockReset();vi.stubGlobal('Worker',TestWorker);});
afterEach(()=>{cleanup();localStorage.clear();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('Python envia exatamente o código editado, mostra erro e pode interromper',async()=>{
  const view=render(<LabPythonRunnerModal isOpen onClose={()=>{}} labTitle="Medir movimento" telemetry={{speed:4}} history={[]} sampleTimes={[]}/>);fireEvent.change(screen.getByLabelText('Código Python'),{target:{value:'print(7 * 6)'}});fireEvent.click(screen.getByRole('button',{name:'Executar código'}));expect(TestWorker.latest.postMessage).toHaveBeenCalledWith({code:'print(7 * 6)'});act(()=>TestWorker.latest.onmessage?.({data:{type:'error',text:'SyntaxError real'}} as MessageEvent));await screen.findByRole('alert');fireEvent.click(screen.getByRole('button',{name:'Executar código'}));fireEvent.click(screen.getByRole('button',{name:'Interromper execução'}));expect(TestWorker.latest.terminate).toHaveBeenCalled();view.unmount();
});
it('Python nunca inventa amostras quando a bancada está vazia',()=>{render(<LabPythonRunnerModal isOpen onClose={()=>{}} labTitle="Vazio" telemetry={{}} history={[]}/>);expect((screen.getByLabelText('Código Python') as HTMLTextAreaElement).value).toContain('np.array([], dtype=float)');expect((screen.getByLabelText('Código Python') as HTMLTextAreaElement).value).not.toContain('10.2');});
it('código Python da mesma bancada pertence à aula em que foi editado',()=>{
  const props={isOpen:true,onClose:()=>{},labId:'test-lab',labTitle:'Bancada fictícia',telemetry:{speed:2},history:[2]};
  const view=render(<LabPythonRunnerModal {...props} activityScope="class-a:plan-a"/>);fireEvent.change(screen.getByLabelText('Código Python'),{target:{value:'print("aula A")'}});
  view.rerender(<LabPythonRunnerModal {...props} activityScope="class-b:plan-b"/>);expect(screen.getByLabelText('Código Python')).not.toHaveValue('print("aula A")');
  view.rerender(<LabPythonRunnerModal {...props} activityScope="class-a:plan-a"/>);expect(screen.getByLabelText('Código Python')).toHaveValue('print("aula A")');
});
it('tutor sem chave identifica roteiro local e usa somente leituras observadas',async()=>{render(<LabSocraticTutorModal isOpen onClose={()=>{}} labTitle="Movimento" topic="Velocidade" parameters={{massa:2}} telemetry={{speed:4}}/>);fireEvent.change(screen.getByLabelText('Sua hipótese ou pergunta'),{target:{value:'A velocidade aumenta'}});fireEvent.click(screen.getByRole('button',{name:'Enviar ao tutor'}));await screen.findByText(/Que medição apoia sua resposta/);expect(ai.call).not.toHaveBeenCalled();expect(screen.getByText(/Roteiro local ativo/)).toBeInTheDocument();});
it('tutor com chave usa a resposta real, e falha conserva mensagem para tentar novamente',async()=>{ai.key='fake-key';ai.call.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce('Qual medição mudou?');render(<LabSocraticTutorModal isOpen onClose={()=>{}} labTitle="Movimento" topic="Velocidade" parameters={{massa:2}} telemetry={{speed:4}}/>);fireEvent.change(screen.getByLabelText('Sua hipótese ou pergunta'),{target:{value:'O que mudou?'}});fireEvent.click(screen.getByRole('button',{name:'Enviar ao tutor'}));await screen.findByRole('alert');expect(screen.getByLabelText('Sua hipótese ou pergunta')).toHaveValue('O que mudou?');fireEvent.click(screen.getByRole('button',{name:'Enviar ao tutor'}));await screen.findByText('Qual medição mudou?');expect(ai.call).toHaveBeenLastCalledWith('fake-key',expect.stringContaining('"speed":4'),expect.objectContaining({signal:expect.any(AbortSignal)}));});
it('microfone realmente encerra ao parar e ao desmontar',async()=>{const abort=vi.fn();class Recognition{lang='';continuous=false;interimResults=false;onstart:(()=>void)|null=null;onend=null;onerror=null;onresult=null;start(){this.onstart?.();}abort=abort;}vi.stubGlobal('SpeechRecognition',Recognition);const view=render(<LabSocraticTutorModal isOpen onClose={()=>{}} labTitle="Movimento" topic="Velocidade" parameters={{}} telemetry={{}}/>);fireEvent.click(screen.getByRole('button',{name:'Usar microfone'}));fireEvent.click(await screen.findByRole('button',{name:'Parar microfone'}));await waitFor(()=>expect(abort).toHaveBeenCalledTimes(1));fireEvent.click(screen.getByRole('button',{name:'Usar microfone'}));view.unmount();expect(abort).toHaveBeenCalledTimes(2);});

it('falha ao abrir o worker libera o editor e permite tentar novamente',()=>{
  vi.stubGlobal('Worker',class{constructor(){throw new Error('blocked');}});
  render(<LabPythonRunnerModal isOpen onClose={()=>{}} labTitle="Movimento" telemetry={{}} history={[]}/>);
  fireEvent.click(screen.getByRole('button',{name:'Executar código'}));
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível abrir o ambiente Python');
  expect(screen.getByRole('button',{name:'Executar código'})).toBeEnabled();
  expect(screen.getByLabelText('Código Python')).toBeEnabled();
});

it('retorno atrasado do worker interrompido não anuncia conclusão',()=>{
  render(<LabPythonRunnerModal isOpen onClose={()=>{}} labTitle="Movimento" telemetry={{}} history={[]}/>);
  fireEvent.click(screen.getByRole('button',{name:'Executar código'}));
  const oldMessage=TestWorker.latest.onmessage;
  fireEvent.click(screen.getByRole('button',{name:'Interromper execução'}));
  act(()=>oldMessage?.({data:{type:'done'}} as MessageEvent));
  expect(screen.getByRole('status')).toHaveTextContent('Execução interrompida');
  expect(screen.queryByText('Execução concluída.')).not.toBeInTheDocument();
});

it('retry do tutor reaproveita uma única mensagem pendente',async()=>{
  ai.key='fake-key';ai.call.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce('Observe a medição.');
  render(<LabSocraticTutorModal isOpen onClose={()=>{}} labTitle="Movimento" topic="Velocidade" parameters={{}} telemetry={{}}/>);
  fireEvent.change(screen.getByLabelText('Sua hipótese ou pergunta'),{target:{value:'Minha pergunta pendente'}});
  fireEvent.click(screen.getByRole('button',{name:'Enviar ao tutor'}));await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button',{name:'Enviar ao tutor'}));await screen.findByText('Observe a medição.');
  expect(within(screen.getByRole('log')).getAllByText('Minha pergunta pendente')).toHaveLength(1);
});

it('resultado tardio do microfone cancelado não substitui o texto digitado',async()=>{
  class Recognition{
    static latest:Recognition;lang='';continuous=false;interimResults=false;onstart:(()=>void)|null=null;onend:(()=>void)|null=null;onerror:((event:{error:string})=>void)|null=null;onresult:((event:{results:{[index:number]:{[index:number]:{transcript:string}}}})=>void)|null=null;
    constructor(){Recognition.latest=this;}start(){this.onstart?.();}abort=vi.fn();
  }
  vi.stubGlobal('SpeechRecognition',Recognition);
  render(<LabSocraticTutorModal isOpen onClose={()=>{}} labTitle="Movimento" topic="Velocidade" parameters={{}} telemetry={{}}/>);
  fireEvent.click(screen.getByRole('button',{name:'Usar microfone'}));
  const lateResult=Recognition.latest.onresult;
  fireEvent.click(await screen.findByRole('button',{name:'Parar microfone'}));
  fireEvent.change(screen.getByLabelText('Sua hipótese ou pergunta'),{target:{value:'Texto que quero enviar'}});
  act(()=>lateResult?.({results:{0:{0:{transcript:'Reconhecimento antigo'}}}}));
  expect(screen.getByLabelText('Sua hipótese ou pergunta')).toHaveValue('Texto que quero enviar');
  expect(Recognition.latest.onresult).toBeNull();
});
