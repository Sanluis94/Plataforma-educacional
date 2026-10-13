export interface ClassListRow{name:string;email:string;enrollmentId?:string}
export function parseClassListCsv(text:string):ClassListRow[]{
  if(text.length>250000)throw new Error('Use uma lista de até 250 KB.');
  const first=text.trim().split(/\r?\n/)[0]??'';
  const separator=first.includes(';')?';':first.includes('\t')?'\t':',';
  const rows:string[][]=[];let row:string[]=[],field='',quoted=false;
  for(let index=0;index<text.length;index++){
    const char=text[index];
    if(char==='"'){if(quoted&&text[index+1]==='"'){field+='"';index++;}else quoted=!quoted;}
    else if(!quoted&&char===separator){row.push(field.trim());field='';}
    else if(!quoted&&(char==='\n'||char==='\r')){if(char==='\r'&&text[index+1]==='\n')index++;row.push(field.trim());if(row.some(Boolean))rows.push(row);row=[];field='';}
    else field+=char;
  }
  if(quoted)throw new Error('Há aspas sem fechamento na lista. Confira o arquivo CSV.');
  row.push(field.trim());if(row.some(Boolean))rows.push(row);
  if(rows[0]&&/^(nome|name)$/i.test(rows[0][0]))rows.shift();
  if(!rows.length)throw new Error('A lista está vazia. Informe nome e email.');
  if(rows.length>500)throw new Error('Confira até 500 estudantes por lista.');
  const emails=new Set<string>();
  return rows.map((columns,index)=>{
    const [name,emailRaw,enrollmentId]=columns,email=(emailRaw??'').toLowerCase();
    if(!name||name.length>200||!/^\S+@\S+\.\S+$/.test(email)||email.length>254)throw new Error(`Linha ${index+1}: informe nome e email válidos.`);
    if(emails.has(email))throw new Error(`Linha ${index+1}: o email ${email} aparece mais de uma vez.`);
    emails.add(email);return {name,email,...(enrollmentId?{enrollmentId}:{})};
  });
}
export function classListCsv(rows:ClassListRow[]):string{const cell=(value:string)=>'"'+(/^[=+\-@]/.test(value)?"'":'')+value.replace(/"/g,'""')+'"';return '\uFEFF'+[['Nome','Email','Matrícula'],...rows.map(row=>[row.name,row.email,row.enrollmentId??''])].map(row=>row.map(cell).join(';')).join('\r\n');}
