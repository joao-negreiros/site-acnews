/**
 * Tela de abertura com a logo animada: cada letra entra em sequência e a tela some sozinha.
 * Só CSS (ver .preloader em globals.css): sem JavaScript, sem biblioteca. Como fica no layout
 * raiz, roda só no carregamento inicial, não a cada navegação dentro do site.
 */

// Pontos de corte (px) entre as letras de logo-red.png, que tem 1063px de largura: a c n e w s "
const CUTS = [0, 161, 327, 491, 653, 838, 957, 1063];
const WIDTH = 1063;

export function Preloader() {
  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader-logo">
        {/* A primeira cópia só dá o tamanho; as demais mostram uma letra cada */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-red.png" alt="" className="preloader-sizer" />
        {CUTS.slice(0, -1).map((from, i) => {
          const left = (from / WIDTH) * 100;
          const right = 100 - (CUTS[i + 1] / WIDTH) * 100;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={from}
              src="/logo-red.png"
              alt=""
              className="preloader-glyph"
              style={{ clipPath: `inset(0 ${right}% 0 ${left}%)`, animationDelay: `${i * 70}ms` }}
            />
          );
        })}
      </div>
    </div>
  );
}
