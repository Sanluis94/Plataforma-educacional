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

const CATEGORIES = ['Todos', 'Brasil', 'Política', 'Guerra', 'Ciência'];

export function HistoryTimeline() {
  const [filter, setFilter] = useState('Todos');
  const [selected, setSelected] = useState<typeof EVENTS[0] | null>(null);

  const filtered = filter === 'Todos' ? EVENTS : EVENTS.filter(e => e.category === filter);
  const minYear = EVENTS[0].year;
  const maxYear = EVENTS[EVENTS.length - 1].year;
  const span = maxYear - minYear;

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>🌍 Linha do Tempo — História</h2>
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
    </div>
  );
}
