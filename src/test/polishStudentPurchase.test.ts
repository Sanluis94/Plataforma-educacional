import {beforeEach,describe,it,expect,vi} from 'vitest';
import type {ProgressData} from '../modules/data/types';
const backend=vi.hoisted(()=>({progress:null as ProgressData|null,fail:false}));
vi.mock('../modules/core/services/firebaseConfig',()=>({db:null}));
vi.mock('../modules/data/services/localEtlClient',()=>({
  getLocalEtlProgress:vi.fn(async()=>structuredClone(backend.progress)),
  saveLocalProgress:vi.fn(async(_uid:string,progress:ProgressData)=>{await Promise.resolve();if(backend.fail)throw new Error('QuotaExceededError');backend.progress=structuredClone(progress);}),
}));
import {purchaseStudentItem} from '../modules/data/repositories/studentRepository';
import {evaluateAchievements} from '../modules/core/services/achievementService';
beforeEach(()=>{backend.fail=false;backend.progress={xp:0,level:1,coins:400,completedModules:[],purchasedItems:[],updatedAt:new Date().toISOString()};});
describe('Compras com saldo persistido',()=>{
  it('duas compras simultâneas do mesmo item debitam uma única vez',async()=>{await Promise.all([purchaseStudentItem('student','avatar_hero'),purchaseStudentItem('student','avatar_hero')]);expect(backend.progress?.coins).toBe(200);expect(backend.progress?.purchasedItems).toEqual(['avatar_hero']);});
  it('compras de itens diferentes não sobrescrevem saldo nem propriedade',async()=>{await Promise.all([purchaseStudentItem('student','avatar_hero'),purchaseStudentItem('student','frame_gold')]);expect(backend.progress?.coins).toBe(50);expect(backend.progress?.purchasedItems).toEqual(['avatar_hero','frame_gold']);});
  it('saldo insuficiente preserva moedas e coleção',async()=>{backend.progress!.coins=199;await expect(purchaseStudentItem('student','avatar_hero')).rejects.toThrow('moedas suficientes');expect(backend.progress!.coins).toBe(199);expect(backend.progress!.purchasedItems).toEqual([]);});
  it('falha de escrita não cobra nem entrega item',async()=>{backend.fail=true;await expect(purchaseStudentItem('student','avatar_hero')).rejects.toThrow('Quota');expect(backend.progress!.coins).toBe(400);expect(backend.progress!.purchasedItems).toEqual([]);});
  it('itens desconhecidos não podem alterar saldo',async()=>{await expect(purchaseStudentItem('student','fake')).rejects.toThrow('disponível');expect(backend.progress!.coins).toBe(400);});
  it('medalhas reconhecem IDs reais de laboratórios em vez de nomes de módulos',()=>{const achievements=evaluateAchievements({...backend.progress!,completedModules:['math_1','qui_1','hist_1','bio_1','port_1','red_1']});for(const id of ['math_whiz','scientist','time_traveler','biologist','literary','writer'])expect(achievements.find(item=>item.id===id)?.unlocked).toBe(true);});
});
