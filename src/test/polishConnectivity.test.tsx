import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,it,expect,vi} from 'vitest';
const queue=vi.hoisted(()=>({pending:true,sync:vi.fn()}));
vi.mock('../modules/core/contexts/AuthContext',()=>({useAuth:()=>({currentUser:{uid:'fictional-student'},userData:{role:'estudante'}})}));
vi.mock('../modules/core/services/firebaseConfig',()=>({db:null}));
vi.mock('../modules/core/services/offlineSyncService',()=>({offlineSyncService:{
  getIsOnline:()=>true,setCurrentStudent:vi.fn(),hasLegacyUnassignedRecords:()=>false,
  getPendingSubmissions:()=>queue.pending?[{id:'fictional-delivery'}]:[],
  subscribeStatus:(listener:(online:boolean)=>void)=>{listener(true);return()=>{};},
  syncOutbox:queue.sync,
}}));
import {ConnectivityBadge} from '../modules/ux/components/common/ConnectivityBadge';
afterEach(()=>{cleanup();queue.sync.mockReset();queue.pending=true;});
it('falha da fila mantém entrega pendente, libera retry e só limpa após confirmação',async()=>{
  queue.sync.mockRejectedValueOnce(new Error('storage unavailable')).mockImplementationOnce(async()=>{queue.pending=false;});
  render(<ConnectivityBadge/>);
  fireEvent.click(screen.getByRole('button',{name:'Tentar enviar entregas pendentes'}));
  await screen.findByText('Envio pendente (1)');
  await waitFor(()=>expect(screen.getByRole('button',{name:'Tentar enviar entregas pendentes'})).toBeEnabled());
  fireEvent.click(screen.getByRole('button',{name:'Tentar enviar entregas pendentes'}));
  await screen.findByText('Modo local');expect(queue.sync).toHaveBeenCalledTimes(2);
});
