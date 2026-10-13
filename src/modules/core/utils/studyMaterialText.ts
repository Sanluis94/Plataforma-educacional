const blocks = new Set(['p','div','section','article','h1','h2','h3','h4','h5','h6','ul','ol','li','table','tr','blockquote','pre']);
const inline = new Set(['a','strong','b','em','i','u','span','code','sub','sup','td','th']);
const entities: Record<string,string> = {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};

/** Study material can be plain text or legacy HTML. Comparisons are plain text. */
export function studyMaterialText(source:string):string {
  const root = source.trimStart().match(/^<([a-z][\w]*)\b(?:"[^"]*"|'[^']*'|[^'">])*\/?>/i)?.[1].toLowerCase();
  if(!root||(!blocks.has(root)&&!inline.has(root)&&root!=='script'&&root!=='style')||!new RegExp(`</${root}\\s*>`,'i').test(source))return source;
  let markup = false;
  const text = source.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, () => {markup=true;return '';})
    .replace(/<\/?([a-z][\w]*)\b(?:"[^"]*"|'[^']*'|[^'">])*\/?>/gi, (tag:string,name:string) => {
      const lower=name.toLowerCase();
      if(lower==='br'||blocks.has(lower)){markup=true;return '\n';}
      if(inline.has(lower)){markup=true;return '';}
      return tag;
    });
  if(!markup)return source;
  return text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(entity:string,name:string)=>{
    const lower=name.toLowerCase();if(entities[lower]!==undefined)return entities[lower];
    const code=lower.startsWith('#x')?Number.parseInt(lower.slice(2),16):Number.parseInt(lower.slice(1),10);
    return Number.isInteger(code)&&code>0&&code<=0x10ffff&&!(code>=0xd800&&code<=0xdfff)?String.fromCodePoint(code):entity;
  }).replace(/\n{3,}/g,'\n\n').trim();
}
