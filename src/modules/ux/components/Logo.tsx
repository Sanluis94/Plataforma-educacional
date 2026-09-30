import React from 'react';

export interface LogoProps {
  /**
   * 'horizontal': Lockup padrão (símbolo à esquerda + wordmark)
   * 'stacked': Selos, avatares e apps (símbolo acima do wordmark)
   * 'symbol-only': Apenas a semente-circuito (para larguras < 120px ou ícones compactos)
   */
  variant?: 'horizontal' | 'stacked' | 'symbol-only';
  /**
   * 'default': Uso padrão sobre fundo Nude (#F1EAD9) - texto em Verde 700 (#293E24)
   * 'negative': Versão negativa sobre fundo Verde (#293E24) - texto em Nude (#F1EAD9)
   */
  colorMode?: 'default' | 'negative';
  /**
   * Altura do símbolo em pixels (mínimo 24px conforme manual da marca)
   */
  symbolSize?: number;
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  colorMode = 'default',
  symbolSize = 32,
  className = '',
  showTagline = false,
}) => {
  const isNegative = colorMode === 'negative';
  const textColor = isNegative ? '#F1EAD9' : '#293E24';
  const leafColor = '#E4683F';
  const circuitLineColor = '#FFFFFF';
  const circuitDotFill = '#FFFFFF';
  const circuitDotInner = '#E4683F';

  // SVG da Semente com Nervura de Circuito (Raiz & Dado)
  const renderSymbol = () => (
    <svg
      width={symbolSize}
      height={symbolSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: 'block' }}
      aria-label="Símbolo Edu-Interact: Raiz e Circuito"
    >
      {/* Folha / Gota Orgânica */}
      <path
        d="M16 2.5C21.5 8 26.5 13.5 26.5 18C26.5 23.8 21.8 28.5 16 29.5C10.2 28.5 5.5 23.8 5.5 18C5.5 13.5 10.5 8 16 2.5Z"
        fill={leafColor}
      />
      {/* Nervura central do circuito - Ciclo CSFA (3 nós) */}
      <line
        x1="16"
        y1="7"
        x2="16"
        y2="25"
        stroke={circuitLineColor}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Nó 1: Provocação */}
      <circle cx="16" cy="9.5" r="2.2" fill={circuitDotFill} />
      <circle cx="16" cy="9.5" r="1.1" fill={circuitDotInner} />
      {/* Nó 2: Experimentação */}
      <circle cx="16" cy="16" r="2.2" fill={circuitDotFill} />
      <circle cx="16" cy="16" r="1.1" fill={circuitDotInner} />
      {/* Nó 3: Maiêutica */}
      <circle cx="16" cy="22.5" r="2.2" fill={circuitDotFill} />
      <circle cx="16" cy="22.5" r="1.1" fill={circuitDotInner} />
    </svg>
  );

  if (variant === 'symbol-only') {
    return <div className={`edu-interact-symbol ${className}`}>{renderSymbol()}</div>;
  }

  const isStacked = variant === 'stacked';

  return (
    <div
      className={`edu-interact-lockup ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: isStacked ? 'column' : 'row',
        alignItems: isStacked ? 'center' : 'center',
        gap: isStacked ? '0.35rem' : '0.6rem',
        textDecoration: 'none',
      }}
    >
      {renderSymbol()}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: symbolSize >= 32 ? '1.25rem' : '1.05rem',
            letterSpacing: '-0.025em',
            color: textColor,
            userSelect: 'none',
          }}
        >
          Edu-Interact
        </span>
        {showTagline && (
          <span
            style={{
              fontFamily: "'Manrope', -apple-system, sans-serif",
              fontSize: '0.68rem',
              fontWeight: 500,
              color: isNegative ? 'rgba(241, 234, 217, 0.75)' : '#5A6D56',
              letterSpacing: '0.01em',
              marginTop: '0.15rem',
            }}
          >
            Educação científica inclusiva
          </span>
        )}
      </div>
    </div>
  );
};
