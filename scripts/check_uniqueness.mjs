import fs from 'fs';

const catalogRaw = fs.readFileSync('src/modules/core/constants/masterLabsCatalog.ts', 'utf-8');
const jsonMatch = catalogRaw.match(/export const MASTER_LABS_CATALOG: CatalogLabItem\[\] = (\[[\s\S]*?\]);/);
const labs = JSON.parse(jsonMatch[1]);

console.log('Total labs in catalog:', labs.length);

const ids = new Set(labs.map(l => l.id));
console.log('Unique IDs:', ids.size, ids.size === labs.length ? '✅ 100%' : '❌');

const titles = new Set(labs.map(l => l.title));
console.log('Unique titles:', titles.size, titles.size === labs.length ? '✅ 100%' : '❌');

const theories = new Set(labs.map(l => l.theoreticalBackground));
console.log('Unique theoretical backgrounds:', theories.size, theories.size === labs.length ? '✅ 100%' : '❌');

const questions = new Set(labs.map(l => l.diagnosticQuestion.question));
console.log('Unique questions:', questions.size, questions.size === labs.length ? '✅ 100%' : '❌');

const paramSets = new Set(labs.map(l => JSON.stringify(l.defaultParams)));
console.log('Unique parameter sets:', paramSets.size, paramSets.size === labs.length ? '✅ 100%' : '❌');

console.log('\n--- AMOSTRA DE LABORATÓRIO ENRIQUECIDO ---');
console.log(JSON.stringify(labs[0], null, 2).slice(0, 500) + '...');
console.log('\n--- AMOSTRA ENSINO SUPERIOR ---');
const supLab = labs.find(l => l.id.startsWith('sup_fis_01'));
console.log(JSON.stringify(supLab, null, 2).slice(0, 500) + '...');
console.log('\n--- AMOSTRA PÓS-GRADUAÇÃO ---');
const posLab = labs.find(l => l.id.startsWith('pos_quant_01'));
console.log(JSON.stringify(posLab, null, 2).slice(0, 500) + '...');
