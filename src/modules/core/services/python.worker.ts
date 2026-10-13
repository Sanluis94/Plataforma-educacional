// Pinned official runtime, loaded only after the learner chooses Run.
const runtimeUrl='https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs';
interface PythonRuntime{
  loadPackagesFromImports:(code:string)=>Promise<void>;
  runPythonAsync:(code:string)=>Promise<unknown>;
  setStdout:(options:{batched:(text:string)=>void})=>void;
  setStderr:(options:{batched:(text:string)=>void})=>void;
}
let ready:Promise<PythonRuntime>|undefined;
self.onmessage=async(event:MessageEvent<{code:string}>)=>{
  try{
    self.postMessage({type:'status',text:'Carregando Python e bibliotecas…'});
    ready??=import(/* @vite-ignore */runtimeUrl).then(module=>module.loadPyodide({indexURL:new URL('./',runtimeUrl).href}) as Promise<PythonRuntime>).catch(error=>{ready=undefined;throw error;});
    const runtime=await ready;
    let outputSize=0;
    const print=(text:string)=>{if(outputSize<100000){const visible=text.slice(0,100000-outputSize);outputSize+=visible.length;self.postMessage({type:'output',text:visible});if(visible.length<text.length)self.postMessage({type:'output',text:'[Saída limitada a 100.000 caracteres.]'});}};
    runtime.setStdout({batched:print});runtime.setStderr({batched:print});
    await runtime.loadPackagesFromImports(event.data.code);
    self.postMessage({type:'status',text:'Executando o código do editor…'});
    const result=await runtime.runPythonAsync(event.data.code);
    if(result!==undefined&&result!==null)print(String(result));
    if(result&&typeof result==='object'&&'destroy' in result&&typeof result.destroy==='function')result.destroy();
    self.postMessage({type:'done'});
  }catch(error){self.postMessage({type:'error',text:error instanceof Error?error.message:String(error)});}
};
export {};
