import {it,expect} from 'vitest';
import {parseClassListCsv,classListCsv} from '../modules/data/services/classListCsv';
it('confere CSV com aspas, delimitadores e matrícula opcional sem inventar cadastro',()=>{expect(parseClassListCsv('Nome;Email;Matrícula\n"Ana; Maria";ANA@example.test;123\nJosé;jose@example.test;')).toEqual([{name:'Ana; Maria',email:'ana@example.test',enrollmentId:'123'},{name:'José',email:'jose@example.test'}]);});
it('rejeita duplicatas, email inválido e aspas quebradas',()=>{expect(()=>parseClassListCsv('Ana;ana@example.test\nAna2;ANA@example.test')).toThrow('mais de uma vez');expect(()=>parseClassListCsv('Ana;invalido')).toThrow('válidos');expect(()=>parseClassListCsv('"Ana;ana@example.test')).toThrow('aspas');});
it('exporta exatamente a lista conferida com proteção para fórmulas de planilha',()=>{expect(classListCsv([{name:'=1+1',email:'ana@example.test'}])).toContain('"\'=1+1";"ana@example.test";""');});
