import {useEffect,useRef,useState} from 'react';
import {useDialogAccessibility} from '../../hooks/useDialogAccessibility';
import {useActivityDraft} from '../../hooks/useActivityDraft';
import {useAuth} from '../../../core/contexts/AuthContext';
interface Props{isOpen:boolean;onClose:()=>void;labTitle:string;labId?:string;activityScope?:string;telemetry:Record<string,number>;history:number[];sampleTimes?:number[];sampleLabel?:string}
export function LabPythonRunnerModal(props:Props){const {currentUser}=useAuth();return props.isOpen?<PythonEditor key={`${currentUser?.uid}:${props.labId??props.labTitle}:${props.activityScope??''}`} {...props} uid={currentUser?.uid??'visitor'}/>:null;}
function PythonEditor({onClose,labTitle,labId,activityScope,telemetry,history,sampleTimes,sampleLabel,uid}:Props&{uid:string}){
  const samples=history.map((value,index)=>({value,time:sampleTimes?.[index]})).filter(row=>Number.isFinite(row.value));
  const times=samples.map(row=>Number.isFinite(row.time)?String(row.time):'float("nan")').join(',');
  const defaultCode=`# Análise das amostras reais de ${labTitle.replace(/[\r\n]/g,' ')}\nimport numpy as np\n\namostras = np.array(${JSON.stringify(samples.map(row=>row.value))}, dtype=float)\n# Instantes medidos na bancada, em segundos\ntempo_s = np.array([${times}], dtype=float)\n\nif len(amostras) == 0:\n    print("Ainda não há amostras. Execute a bancada e atualize os dados.")\nelse:\n    print(f"Amostras: {len(amostras)}")\n    print(f"Média: {np.mean(amostras):.4f}")\n    print(f"Desvio padrão populacional: {np.std(amostras):.4f}")\n    if len(amostras) > 1 and np.all(np.isfinite(tempo_s)) and tempo_s[-1] > tempo_s[0]:\n        inclinacao, intercepto = np.polyfit(tempo_s, amostras, 1)\n        print(f"Inclinação por segundo: {inclinacao:.4f}")\n        print(f"Intercepto: {intercepto:.4f}")\n`;
  const draftSuffix=activityScope&&activityScope!==':'?`:${encodeURIComponent(activityScope)}`:'';
  const {restored,persist,storageError}=useActivityDraft(`edu_python_code_v1:${uid}:${labId??labTitle}${draftSuffix}`,{code:defaultCode});
  const [code,setCode]=useState(typeof restored.code==='string'?restored.code:defaultCode),[output,setOutput]=useState(''),[status,setStatus]=useState('Pronto para executar.'),[running,setRunning]=useState(false),[error,setError]=useState(''),[copied,setCopied]=useState(false);
  useEffect(()=>{persist({code});},[code,persist]);
  const worker=useRef<Worker|null>(null),timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
  const dialog=useDialogAccessibility(true,onClose);
  function clearTimer(){if(timeout.current)clearTimeout(timeout.current);timeout.current=null;}
  useEffect(()=>()=>{worker.current?.terminate();if(timeout.current)clearTimeout(timeout.current);},[]);
  function stop(){worker.current?.terminate();worker.current=null;clearTimer();setRunning(false);setStatus('Execução interrompida. O código permanece no editor.');}
  function run(){
    if(running||!code.trim())return;
    setRunning(true);setOutput('');setError('');setStatus('Carregando Python…');
    let current:Worker;
    try{current=worker.current??new Worker(new URL('../../../core/services/python.worker.ts',import.meta.url),{type:'module'});worker.current=current;}
    catch{setRunning(false);setStatus('O ambiente Python não iniciou.');setError('Não foi possível abrir o ambiente Python. Confira se o navegador permite tarefas em segundo plano e tente novamente.');return;}
    const clearListeners=()=>{current.removeEventListener('message',onMessage);current.removeEventListener('error',onError);};
    const onMessage=(event:MessageEvent)=>{
      if(worker.current!==current)return;
      const message=event.data as {type:string;text?:string};
      if(message.type==='output')setOutput(previous=>previous+(message.text??'')+'\n');
      if(message.type==='status')setStatus(message.text??'');
      if(message.type==='done'){clearTimer();clearListeners();setRunning(false);setStatus('Execução concluída.');}
      if(message.type==='error'){clearTimer();clearListeners();setRunning(false);setError(message.text??'Não foi possível executar Python.');setStatus('O código não concluiu. Corrija o erro ou tente novamente.');}
    };
    const onError=()=>{if(worker.current!==current)return;clearListeners();stop();setError('Não foi possível carregar o ambiente Python. Confira a conexão e tente novamente.');};
    current.addEventListener('message',onMessage);current.addEventListener('error',onError);
    timeout.current=setTimeout(()=>{stop();setError('O limite de 90 segundos foi atingido. Revise o código ou tente novamente após o primeiro carregamento.');},90000);
    try{current.postMessage({code});}catch{clearListeners();stop();setError('Não foi possível enviar o código para o ambiente Python. Seu texto permanece no editor.');}
  }
  async function copy(){setCopied(false);try{await navigator.clipboard.writeText(code);setCopied(true);}catch{setError('Não foi possível copiar. Selecione o código e copie manualmente.');}}
  return <div style={{position:'fixed',inset:0,zIndex:1000,background:'var(--bg-overlay)',display:'grid',placeItems:'center',padding:16}} onClick={event=>{if(event.target===event.currentTarget)onClose();}}><section ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="python-modal-title" className="card" style={{padding:'1rem',width:'100%',maxWidth:1000,maxHeight:'92dvh',overflow:'auto',minWidth:0}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:16}}><h2 id="python-modal-title">Python para analisar o experimento</h2><button className="btn-outline" onClick={onClose} aria-label="Fechar Python">Fechar</button></header>
    <p>{labTitle}. {samples.length} amostras de {sampleLabel??'uma grandeza medida'}. O código editado é executado no navegador por Pyodide, em uma tarefa separada. O primeiro uso baixa o ambiente e as bibliotecas da distribuição oficial e precisa de conexão.</p>
    <p>Última leitura: {Object.entries(telemetry).filter(([,value])=>Number.isFinite(value)).map(([name,value])=>`${name}: ${value}`).join(' · ')||'Sem medição'}</p>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}><button className="btn-primary" disabled={running||!code.trim()} onClick={run}>Executar código</button>{running&&<button className="btn-outline" onClick={stop}>Interromper execução</button>}<button className="btn-outline" disabled={running} onClick={()=>{setCode(defaultCode);setCopied(false);setError('');}}>Atualizar código com dados atuais</button><button className="btn-outline" onClick={()=>void copy()}>{copied?'Código copiado':'Copiar código'}</button></div>
    <p>O código é guardado neste navegador para sua conta. Use Atualizar código com dados atuais para trocar o exemplo pelas novas amostras.</p><p role="status">{status}</p>{storageError&&<p role="alert">{storageError}</p>}{error&&<pre role="alert" style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{error}</pre>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,320px),1fr))',gap:16}}><label>Código Python<textarea aria-label="Código Python" spellCheck={false} disabled={running} value={code} onChange={event=>{setCode(event.target.value);setCopied(false);}} style={{display:'block',width:'100%',boxSizing:'border-box',minHeight:320,fontFamily:'monospace',background:'var(--bg-base)',color:'var(--text-main)'}}/></label><section aria-label="Saída do Python"><h3>Saída do Python</h3><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',minHeight:160}}>{output||'Ainda não há saída.'}</pre></section></div>
  </section></div>;
}
