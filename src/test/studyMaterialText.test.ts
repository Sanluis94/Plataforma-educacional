import {it,expect} from 'vitest';
import {studyMaterialText} from '../modules/core/utils/studyMaterialText';
it.each(['Se x < 4 e y > 2, compare os resultados.','x<y e y>z','x<p e p>y','Um elemento HTML usa <p> e </p>.','\nUma hipótese:\nx <= 4; y >= 2.\n','O produto interno <x> depende do vetor.'])('conserva integralmente texto simples e comparações: %s',source=>expect(studyMaterialText(source)).toBe(source));
it('recupera parágrafos e entidades de conteúdo HTML antigo sem cortar comparações',()=>expect(studyMaterialText('<p>Se x &lt; 4 e y &gt; 2, compare.</p><p><strong>Conclusão:</strong> x < y e y > z.</p>')).toBe('Se x < 4 e y > 2, compare.\n\nConclusão: x < y e y > z.'));
it('atributos com maior-que não aparecem no texto de estudo',()=>expect(studyMaterialText('<p title="x>y">Compare os dois lados.</p>')).toBe('Compare os dois lados.'));
it('HTML antigo não apresenta código de script nem estilo como conteúdo',()=>expect(studyMaterialText('<p>Conteúdo.</p><script>alert(1)</script><style>p{display:none}</style>')).toBe('Conteúdo.'));
it('decodifica caracteres válidos e conserva entidades numéricas inválidas',()=>expect(studyMaterialText('<p>&#x03bb; &#60; 4; &#1114112;</p>')).toBe('λ < 4; &#1114112;'));
