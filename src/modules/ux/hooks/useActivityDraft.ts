import {useCallback,useState} from 'react';
import type {LearningEvidence} from '../../data/learningAnalyticsTypes';
export function isDraftObject(value:unknown):value is Record<string,unknown>{return typeof value==='object'&&value!==null&&!Array.isArray(value);}
const optionalText=(value:unknown)=>value===undefined||typeof value==='string';
const nonnegative=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
/** Draft JSON is untrusted: validate nested evidence before restoring a frozen delivery. */
export function isDraftEvidence(value:unknown):value is LearningEvidence{
  if(!isDraftObject(value)||value.schemaVersion!==1||!['activity','lab','exam','enem'].includes(String(value.source))||typeof value.sessionId!=='string'||!value.sessionId.trim())return false;
  if(!['startedAt','subject','labId','lessonPlanId','reflection'].every(key=>optionalText(value[key]))||(value.activeSeconds!==undefined&&!nonnegative(value.activeSeconds))||(value.stage!==undefined&&!['exploration','assessment','response'].includes(String(value.stage))))return false;
  if(value.questions!==undefined&&(!Array.isArray(value.questions)||!value.questions.every(question=>isDraftObject(question)&&typeof question.questionId==='string'&&typeof question.question==='string'&&(question.selectedOption===null||(nonnegative(question.selectedOption)&&Number.isInteger(question.selectedOption)))&&(question.correct===null||typeof question.correct==='boolean')&&['selectedText','expectedText','explanation','topic'].every(key=>optionalText(question[key])))))return false;
  if(value.observations!==undefined&&(!Array.isArray(value.observations)||!value.observations.every(observation=>isDraftObject(observation)&&typeof observation.scenarioId==='string'&&typeof observation.hypothesis==='string'&&optionalText(observation.scenarioLabel)&&(observation.observed===undefined||typeof observation.observed==='boolean'))))return false;
  if(value.estimatedScore!==undefined&&(!isDraftObject(value.estimatedScore)||!nonnegative(value.estimatedScore.value)||value.estimatedScore.value>1000||value.estimatedScore.model!=='tri-practice'||value.estimatedScore.scaleMax!==1000))return false;
  if(value.experiment!==undefined){
    const experiment=value.experiment;
    const numericMap=(map:unknown)=>isDraftObject(map)&&Object.values(map).every(entry=>typeof entry==='number'&&Number.isFinite(entry));
    const textMap=(map:unknown)=>map===undefined||(isDraftObject(map)&&Object.values(map).every(entry=>typeof entry==='string'));
    if(!isDraftObject(experiment)||!numericMap(experiment.parameters)||!numericMap(experiment.telemetry)||!nonnegative(experiment.samples)||!Number.isInteger(experiment.samples)||!['parameterUnits','telemetryUnits','parameterLabels','telemetryLabels'].every(key=>textMap(experiment[key])))return false;
  }
  return true;
}
export function draftFingerprint(value:unknown):string{
  let hash=2166136261;for(const char of JSON.stringify(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(36);
}
/** Private, versioned draft; a saved delivery can be retried with its original ID. */
export function useActivityDraft<T>(key:string,initial:T,validate?:(value:unknown)=>value is T){
  const [loaded]=useState(()=>{
    const invalid={value:initial,warning:'Não foi possível restaurar o rascunho salvo. A atividade foi aberta sem esse rascunho.'};
    try{
      const raw=localStorage.getItem(key);if(!raw)return {value:initial,warning:''};
      const saved:unknown=JSON.parse(raw);
      if(!isDraftObject(saved)||saved.version!==1||typeof saved.updatedAt!=='number'||!Number.isFinite(saved.updatedAt)||saved.updatedAt>Date.now()||!isDraftObject(saved.value))return invalid;
      if(Date.now()-saved.updatedAt>=30*86400000)return {value:initial,warning:''};
      if(validate&&!validate(saved.value))return invalid;
      return {value:{...initial,...saved.value} as T,warning:''};
    }catch{return invalid;}
  });
  const [storageError,setStorageError]=useState('');
  const persist=useCallback((value:T)=>{try{localStorage.setItem(key,JSON.stringify({version:1,updatedAt:Date.now(),value}));setStorageError('');}catch{setStorageError('Não foi possível guardar o rascunho neste navegador. Mantenha esta página aberta até concluir a entrega.');}},[key]);
  return {restored:loaded.value,persist,storageError:storageError||loaded.warning};
}
