import {useEffect,useRef,useState} from 'react';
import {useAuth} from '../../../core/contexts/AuthContext';
import {callGeminiWithKey,getEffectiveGeminiApiKey} from '../../../core/services/geminiService';
import {useDialogAccessibility} from '../../hooks/useDialogAccessibility';
interface Props{isOpen:boolean;onClose:()=>void;labTitle:string;topic:string;parameters:Record<string,number>;telemetry:Record<string,number>}
interface Message{sender:'tutor'|'student';text:string;source?:'local'|'gemini'}
interface Recognition{lang:string;continuous:boolean;interimResults:boolean;start:()=>void;abort:()=>void;onstart:(()=>void)|null;onend:(()=>void)|null;onerror:((event:{error:string})=>void)|null;onresult:((event:{results:{[index:number]:{[index:number]:{transcript:string}}}})=>void)|null}
function releaseRecognition(instance:Recognition|null){if(!instance)return;instance.onstart=null;instance.onend=null;instance.onerror=null;instance.onresult=null;try{instance.abort();}catch{/* Already ended recognition does not need another browser action. */}}
export function LabSocraticTutorModal(props:Props){const {currentUser}=useAuth();return props.isOpen?<TutorSession key={`${currentUser?.uid}:${props.labTitle}`} {...props}/>:null;}
function TutorSession({onClose,labTitle,topic,parameters,telemetry}:Props){
  const readings=(values:Record<string,number>)=>Object.entries(values).filter(([,value])=>Number.isFinite(value)).map(([name,value])=>`${name}: ${Number(value.toFixed(3))}`).join(' · ');
  const [messages,setMessages]=useState<Message[]>([{sender:'tutor',source:'local',text:`Vamos investigar ${topic} no laboratório ${labTitle}. Qual é sua previsão ao alterar um controle? Registre a previsão, mude somente uma variável e compare com a medição.`}]);
  const [input,setInput]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[voice,setVoice]=useState(false),[listening,setListening]=useState(false);
  const recognition=useRef<Recognition|null>(null),request=useRef<AbortController|null>(null),alive=useRef(true),busyRef=useRef(false),thread=useRef<HTMLDivElement>(null);
  const pending=useRef<{text:string;messages:Message[]}|null>(null);
  const dialog=useDialogAccessibility(true,onClose);
  const key=getEffectiveGeminiApiKey();
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;request.current?.abort();releaseRecognition(recognition.current);recognition.current=null;window.speechSynthesis?.cancel();};},[]);
  useEffect(()=>{thread.current?.scrollTo?.({top:thread.current.scrollHeight});},[messages,busy]);
  function speak(text:string){if(!voice||!window.speechSynthesis||typeof SpeechSynthesisUtterance==='undefined')return;try{window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='pt-BR';window.speechSynthesis.speak(utterance);}catch{setError('A resposta foi recebida, mas a leitura em voz alta está indisponível. Você pode ler o texto na conversa.');}}
  async function send(){
    if(busyRef.current||!input.trim())return;
    const text=input.trim(),next=pending.current?.text===text?pending.current.messages:[...messages,{sender:'student' as const,text}];pending.current={text,messages:next};setMessages(next);setInput('');setError('');busyRef.current=true;setBusy(true);
    releaseRecognition(recognition.current);recognition.current=null;setListening(false);
    const controller=new AbortController();request.current=controller;const timeout=setTimeout(()=>controller.abort(),30000);
    try{
      let reply:string;let source:'local'|'gemini';
      const effectiveKey=getEffectiveGeminiApiKey();
      if(effectiveKey){source='gemini';reply=await callGeminiWithKey(effectiveKey,`Você é um tutor investigativo. Não atribua nota, não afirme que uma hipótese está correta sem evidência e não invente observações. Faça uma pergunta breve que ajude o estudante a testar sua hipótese. Laboratório: ${labTitle}. Tópico: ${topic}. Parâmetros atuais: ${JSON.stringify(parameters)}. Medições atuais: ${JSON.stringify(telemetry)}. Conversa: ${JSON.stringify(next.slice(-8))}`,{signal:controller.signal});}
      else{source='local';const step=next.filter(message=>message.sender==='student').length%3;reply=step===1?`Que medição apoia sua resposta? Compare o valor antes e depois de alterar somente um controle. Leitura atual: ${readings(telemetry)||'ainda sem medição'}.`:step===2?'Volte à condição inicial e repita a mudança. A tendência se mantém? Anote os valores e explique o que ainda não consegue concluir.':`Como você relaciona as observações com ${topic}? Use os dados registrados para justificar a relação, e identifique uma condição em que ela poderia mudar.`;}
      if(alive.current){pending.current=null;setMessages(previous=>[...previous,{sender:'tutor',text:reply,source}]);speak(reply);}
    }catch{if(alive.current){setError('Não foi possível consultar a IA. Sua mensagem está na conversa; tente enviar novamente.');setInput(text);}}
    finally{clearTimeout(timeout);if(alive.current){setBusy(false);busyRef.current=false;}request.current=null;}
  }
  function toggleMic(){
    if(recognition.current){releaseRecognition(recognition.current);recognition.current=null;setListening(false);return;}
    const browser=window as unknown as {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};const Constructor=browser.SpeechRecognition??browser.webkitSpeechRecognition;
    if(!Constructor){setError('A entrada por voz não está disponível neste navegador. Digite sua mensagem.');return;}
    const instance=new Constructor();recognition.current=instance;instance.lang='pt-BR';instance.continuous=false;instance.interimResults=false;
    instance.onstart=()=>{if(alive.current&&recognition.current===instance)setListening(true);};instance.onend=()=>{if(alive.current&&recognition.current===instance){recognition.current=null;setListening(false);}};
    instance.onerror=event=>{if(alive.current&&recognition.current===instance){recognition.current=null;setListening(false);if(event.error!=='aborted')setError('Não foi possível usar o microfone. Confira a permissão do navegador ou digite sua mensagem.');}};
    instance.onresult=event=>{if(alive.current&&recognition.current===instance){setInput(event.results[0][0]?.transcript??'');releaseRecognition(instance);recognition.current=null;setListening(false);}};
    try{setError('');setListening(true);instance.start();}catch{releaseRecognition(instance);recognition.current=null;setListening(false);setError('Não foi possível iniciar o microfone. Digite sua mensagem.');}
  }
  return <div style={{position:'fixed',inset:0,zIndex:1000,background:'var(--bg-overlay)',display:'grid',placeItems:'center',padding:16}}><section ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="socratic-modal-title" className="card" style={{padding:16,width:'100%',maxWidth:680,maxHeight:'92dvh',overflow:'auto',minWidth:0}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:8}}><h2 id="socratic-modal-title">Tutor de investigação</h2><button aria-label="Fechar tutor" className="btn-outline" onClick={onClose}>Fechar</button></header>
    <p>{key?'IA disponível com a chave configurada. Suas mensagens e as medições atuais são enviadas ao Gemini quando você selecionar Enviar.':'Roteiro local ativo: perguntas de investigação sem serviço de IA. As respostas locais ajudam a organizar observações; não avaliam a correção da sua hipótese.'}</p>
    <p>Controles: {readings(parameters)||'sem controles'}. Medições: {readings(telemetry)||'sem medições'}.</p>
    <div ref={thread} role="log" aria-label="Conversa com o tutor" style={{maxHeight:'45dvh',overflowY:'auto'}}>{messages.map((message,index)=><article key={index} style={{padding:12,marginBottom:8,border:'1px solid var(--border-color)',borderRadius:8}}><strong>{message.sender==='student'?'Você':message.source==='gemini'?'Tutor · Gemini':'Tutor · roteiro local'}</strong><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{message.text}</p></article>)}</div>
    {busy&&<p role="status">Consultando o tutor…</p>}{error&&<p role="alert">{error}</p>}
    <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'1rem 0'}}><button className="btn-outline" onClick={toggleMic} disabled={busy} aria-pressed={listening}>{listening?'Parar microfone':'Usar microfone'}</button><button className="btn-outline" disabled={!window.speechSynthesis} aria-pressed={voice} onClick={()=>{setVoice(previous=>!previous);window.speechSynthesis?.cancel();}}>{voice?'Desativar leitura das respostas':'Ler respostas em voz alta'}</button></div>
    <form onSubmit={event=>{event.preventDefault();void send();}}><label>Sua hipótese ou pergunta<textarea rows={3} maxLength={4000} disabled={busy} value={input} onChange={event=>setInput(event.target.value)} style={{display:'block',width:'100%',boxSizing:'border-box'}}/></label><button className="btn-primary" disabled={busy||!input.trim()}>{busy?'Consultando…':'Enviar ao tutor'}</button></form>
  </section></div>;
}
