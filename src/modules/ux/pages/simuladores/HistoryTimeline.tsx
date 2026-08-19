import { useState } from 'react';

const EVENTS = [
  { year: 1789, label: 'Revolução Francesa', category: 'Política', color: '#ef5350', desc: 'Queda do Antigo Regime, ascensão dos ideais liberais de Liberdade, Igualdade e Fraternidade.' },
  { year: 1808, label: 'Chegada da Família Real ao Brasil', category: 'Brasil', color: '#42a5f5', desc: 'D. João VI transfere a corte portuguesa para o Rio de Janeiro, transformando o Brasil em sede do Reino.' },
  { year: 1822, label: 'Independência do Brasil', category: 'Brasil', color: '#42a5f5', desc: 'D. Pedro I proclama a independência em 7 de setembro, às margens do Rio Ipiranga.' },
  { year: 1848, label: 'Primavera dos Povos', category: 'Política', color: '#ef5350', desc: 'Onda de revoluções liberais e nacionalistas que varreu a Europa, influenciada pelos ideais iluministas.' },
  { year: 1888, label: 'Abolição da Escravatura', category: 'Brasil', color: '#42a5f5', desc: 'Princesa Isabel assina a Lei Áurea em 13 de maio, libertando cerca de 700 mil escravizados.' },
  { year: 1889, label: 'Proclamação da República', category: 'Brasil', color: '#66bb6a', desc: 'Marechal Deodoro da Fonseca lidera o golpe que destitui D. Pedro II e instaura a República.' },
  { year: 1914, label: '1ª Guerra Mundial', category: 'Guerra', color: '#ffa726', desc: 'Conflito de escala global desencadeado pelo assassinato do Arquiduque Francisco Ferdinando.' },
  { year: 1939, label: '2ª Guerra Mundial', category: 'Guerra', color: '#ffa726', desc: 'Invasão da Polônia pela Alemanha nazista de Hitler marca o início do maior conflito da história.' },
  { year: 1945, label: 'Fim da 2ª Guerra / ONU', category: 'Política', color: '#ef5350', desc: 'Capitulação do Eixo e fundação da Organização das Nações Unidas para garantir a paz mundial.' },
  { year: 1969, label: 'Chegada à Lua', category: 'Ciência', color: '#7c4dff', desc: 'A missão Apollo 11 leva os primeiros seres humanos à Lua em 20 de julho.' },
  { year: 1989, label: 'Queda do Muro de Berlim', category: 'Política', color: '#ef5350', desc: 'Fim da Guerra Fria e reunificação da Alemanha; colapso do bloco socialista soviético.' },
];

const MODE_EVENTS: Record<string, typeof EVENTS> = {
  brazil_colony: [
    { year: 1500, label: 'Chegada dos Portugueses', category: 'Brasil', color: '#42a5f5', desc: 'Esquadra de Pedro Álvares Cabral aporta em Porto Seguro, iniciando o domínio colonial português.' },
    { year: 1534, label: 'Capitanias Hereditárias', category: 'Brasil', color: '#42a5f5', desc: 'D. João III divide o território brasileiro em 15 faixas de terra doadas a capitães donatários.' },
    { year: 1789, label: 'Inconfidência Mineira', category: 'Brasil', color: '#ef5350', desc: 'Movimento separatista em Minas Gerais contra a derrama cobrada pela Coroa Portuguesa, liderado por Tiradentes.' },
    { year: 1808, label: 'Chegada da Família Real', category: 'Brasil', color: '#42a5f5', desc: 'D. João VI transfere a corte para o Rio de Janeiro e decreta a Abertura dos Portos às Nações Amigas.' },
    { year: 1822, label: 'Independência do Brasil', category: 'Brasil', color: '#66bb6a', desc: 'D. Pedro I proclama a independência às margens do Ipiranga, fundando o Império do Brasil.' },
    { year: 1888, label: 'Abolição da Escravatura', category: 'Brasil', color: '#ab47bc', desc: 'Princesa Isabel assina a Lei Áurea, libertando os últimos escravizados no país.' },
    { year: 1889, label: 'Proclamação da República', category: 'Brasil', color: '#66bb6a', desc: 'Marechal Deodoro lidera o golpe militar que banem a Família Imperial e instaura a República dos Estados Unidos do Brasil.' },
  ],
  industrial_rev: [
    { year: 1765, label: 'Máquina a Vapor de Watt', category: 'Ciência', color: '#7c4dff', desc: 'James Watt aprimora o motor a vapor, impulsionando a mecanização das tecelagens britânicas.' },
    { year: 1811, label: 'Movimento Ludista', category: 'Política', color: '#ef5350', desc: 'Trabalhadores ingleses destroem máquinas industriais em protesto contra as péssimas condições de trabalho.' },
    { year: 1848, label: 'Manifesto Comunista', category: 'Política', color: '#ef5350', desc: 'Marx e Engels publicam a obra fundadora da análise das lutas de classes na sociedade industrializada.' },
    { year: 1870, label: '2ª Revolução Industrial', category: 'Ciência', color: '#7c4dff', desc: 'Advento da eletricidade, aço, petróleo e do motor de combustão interna transformam a indústria global.' },
    { year: 1913, label: 'Linha de Montagem de Ford', category: 'Política', color: '#ffa726', desc: 'Henry Ford introduz a esteira rolante automatizada na produção de automóveis (Fordismo).' },
  ],
  world_wars: [
    { year: 1914, label: 'Início da 1ª Guerra Mundial', category: 'Guerra', color: '#ffa726', desc: 'Assassinato do Arquiduque Francisco Ferdinando em Sarajevo desencadeia a guerra de trincheiras europeia.' },
    { year: 1919, label: 'Tratado de Versalhes', category: 'Política', color: '#ef5350', desc: 'Acordo de paz pune severamente a Alemanha derrotada, criando ressentimento que alimentaria o Nazismo.' },
    { year: 1939, label: 'Invasão da Polônia', category: 'Guerra', color: '#ffa726', desc: 'Hitler ordena a invasão da Polônia via Blitzkrieg, dando início à 2ª Guerra Mundial.' },
    { year: 1944, label: 'Dia D na Normandia', category: 'Guerra', color: '#ffa726', desc: 'Desembarque dos Aliados nas praias francesas abre a frente ocidental contra as forças nazistas.' },
    { year: 1945, label: 'Bombas em Hiroshima / ONU', category: 'Política', color: '#ef5350', desc: 'Ataque atômico americano força a rendição do Japão; criação da ONU para mediação diplomática global.' },
  ],
  greece_rome: [
    { year: -508, label: 'Democracia Ateniense', category: 'Política', color: '#ef5350', desc: 'Clístenes promove reformas políticas em Atenas, estabelecendo a primeira democracia direta da história.' },
    { year: -490, label: 'Guerras Médicas', category: 'Guerra', color: '#ffa726', desc: 'Cidades-estado gregas se unem para derrotar as invasões do Império Persa em Maratona e Salamina.' },
    { year: -44, label: 'Assassinato de Júlio César', category: 'Política', color: '#ef5350', desc: 'Senadores conspiradores assassinam o ditador Júlio César nos Idos de Março, precipitando a crise da República Romana.' },
    { year: -27, label: 'Início do Império Romano', category: 'Política', color: '#66bb6a', desc: 'Otávio recebe o título de Augusto, tornando-se o primeiro imperador romano e iniciando a Pax Romana.' },
    { year: 476, label: 'Queda do Império Romano', category: 'Política', color: '#ef5350', desc: 'Invasões germânicas destituem o imperador Rômulo Augusto, encerrando a Idade Antiga no Ocidente.' },
  ],
  cold_war: [
    { year: 1947, label: 'Doutrina Truman', category: 'Política', color: '#ef5350', desc: 'EUA declaram contenção global ao expansionismo soviético, oficializando a Guerra Fria.' },
    { year: 1962, label: 'Crise dos Mísseis em Cuba', category: 'Guerra', color: '#ffa726', desc: 'Tensão máxima entre EUA e URSS devido à instalação de ogivas nucleares soviéticas no Caribe.' },
    { year: 1969, label: 'Chegada à Lua (Apollo 11)', category: 'Ciência', color: '#7c4dff', desc: 'Ápice da corrida espacial militar-tecnológica entre as duas superpotências globais.' },
    { year: 1989, label: 'Queda do Muro de Berlim', category: 'Política', color: '#ef5350', desc: 'Colapso do símbolo da divisão bipolar da Europa e abertura das fronteiras da Alemanha Oriental.' },
    { year: 1991, label: 'Dissolução da União Soviética', category: 'Política', color: '#66bb6a', desc: 'Renúncia de Gorbachev e fim da URSS encerram formalmente a Guerra Fria.' },
  ],
};

const CATEGORIES = ['Todos', 'Brasil', 'Política', 'Guerra', 'Ciência'];

export function HistoryTimeline({ mode = 'timeline', labTitle, onComplete }: { mode?: string; labTitle?: string; labId?: string; onComplete?: (score: number) => void }) {
  const eventsList = MODE_EVENTS[mode] || EVENTS;
  const [filter, setFilter] = useState('Todos');
  const [selected, setSelected] = useState<typeof EVENTS[0] | null>(null);

  const filtered = filter === 'Todos' ? eventsList : eventsList.filter(e => e.category === filter);
  const minYear = eventsList[0].year;
  const maxYear = eventsList[eventsList.length - 1].year;
  const span = Math.max(1, maxYear - minYear);

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>🌍 {labTitle || 'Linha do Tempo — História'}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Explore os marcos históricos. Clique em um evento para ver detalhes.</p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{ padding: '0.35rem 0.8rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: filter === c ? 'var(--color-primary)' : 'var(--bg-secondary)',
              color: filter === c ? 'white' : 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: filter === c ? 'bold' : 'normal' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Timeline visual */}
      <div style={{ position: 'relative', padding: '1.5rem 0', overflowX: 'auto' }}>
        {/* Linha horizontal */}
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '40px 0', position: 'relative' }}>
          {filtered.map(evt => {
            const pct = ((evt.year - minYear) / span) * 100;
            return (
              <div key={evt.year}
                onClick={() => setSelected(evt === selected ? null : evt)}
                title={`${evt.year}: ${evt.label}`}
                style={{
                  position: 'absolute', left: `${pct}%`,
                  transform: 'translateX(-50%)',
                  cursor: 'pointer', zIndex: 2,
                }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: evt.color,
                  border: selected?.year === evt.year ? '3px solid white' : '2px solid rgba(255,255,255,0.3)',
                  boxShadow: selected?.year === evt.year ? `0 0 12px ${evt.color}` : 'none',
                  transition: 'all 0.2s', marginTop: '-5px',
                }} />
                <div style={{
                  marginTop: '10px', fontSize: '0.65rem', color: 'var(--text-secondary)',
                  textAlign: 'center', width: '60px', marginLeft: '-23px', lineHeight: '1.2',
                }}>
                  {evt.year}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected ? (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.25rem', borderLeft: `4px solid ${selected.color}`, marginTop: '0.5rem', transition: 'all 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ background: selected.color + '33', color: selected.color, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {selected.category}
              </span>
              <h3 style={{ color: 'var(--text-main)', marginTop: '0.5rem', marginBottom: '0.25rem' }}>{selected.label}</h3>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{selected.year}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>
          <p style={{ color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>{selected.desc}</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          👆 Clique em um ponto da linha do tempo para ver os detalhes do evento.
        </div>
      )}
      {/* AI Historical Insight Box */}
      <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '10px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
        <div style={{ color: '#06b6d4', fontWeight: 700, fontSize: '0.78rem', marginBottom: '0.25rem' }}>🤖 CONTEXTUALIZAÇÃO DA IA HISTÓRICA</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
          {selected 
            ? `Evento "${selected.label}" (${selected.year}): Note as relações de causa e efeito com o cenário geopolítico mundial.`
            : 'Explore os eventos da linha do tempo para acionar análises causais da IA.'}
        </p>
      </div>

      {onComplete && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => onComplete(100)}
            className="btn-gradient"
            style={{ padding: '0.75rem 2rem', fontSize: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 15px rgba(16,185,129,0.3)', fontWeight: 'bold' }}
          >
            🏆 Concluir Laboratório (+50 XP & +10 Moedas)
          </button>
        </div>
      )}
    </div>
  );
}
