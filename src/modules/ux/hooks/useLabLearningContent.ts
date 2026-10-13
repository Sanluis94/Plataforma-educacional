import { useEffect, useState } from 'react';
import { getLabLearningContent, loadLabLearningContent, type LabLearningContent } from '../../core/content/labLearningContent';

export function useLabLearningContent(id: string | undefined) {
  const [result, setResult] = useState<{id?:string;attempt?:number;content?:LabLearningContent;error:string|null}>({error:null});
  const [attempt, setAttempt] = useState(0);
  const cached = id ? getLabLearningContent(id) : undefined;
  useEffect(() => {
    let cancelled = false;
    if (!id || getLabLearningContent(id)) return;
    void loadLabLearningContent(id).then(content => {
      if (!cancelled) setResult({id,attempt,content,error:null});
    }).catch(() => {
      if (!cancelled) setResult({id,attempt,error:'Não foi possível carregar o roteiro. Confira a conexão e tente novamente.'});
    });
    return () => { cancelled = true; };
  }, [id,attempt]);
  const current = result.id === id && result.attempt === attempt ? result : {error:null};
  return {content:cached ?? current.content, loading:Boolean(id && !cached && !current.content && !current.error), error:current.error, retry:() => setAttempt(value=>value+1)};
}
