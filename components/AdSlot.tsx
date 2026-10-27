import { ADS } from "@/lib/site";

/** Tamanho de cada espaço: faixa larga no meio da home e retângulo na lateral do destaque. */
const SHAPE: Record<keyof typeof ADS, { box: string; frame: string }> = {
  meio: { box: "mx-auto w-full max-w-[970px]", frame: "aspect-[32/10] md:aspect-[97/25]" }, // 970x250
  lateral: { box: "w-full max-w-[300px]", frame: "aspect-[6/5]" }, // 300x250
  materia: { box: "mx-auto w-full max-w-[728px]", frame: "aspect-[728/90]" }, // 728x90
};

/**
 * Espaço de publicidade. Com anúncio configurado em lib/site.ts, mostra a arte com link;
 * sem anúncio, uma moldura vazia. Não carrega script de terceiros: o anúncio é só uma imagem com link.
 */
export function AdSlot({ slot }: { slot: keyof typeof ADS }) {
  const ad = ADS[slot];
  const safe = ad && /^https:\/\//i.test(ad.image) && /^https:\/\//i.test(ad.href);
  const shape = SHAPE[slot];

  return (
    <aside aria-label="Publicidade" className={shape.box}>
      <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
        Publicidade
      </p>
      <div className={`${shape.frame} w-full overflow-hidden rounded bg-neutral-100`}>
        {safe ? (
          <a href={ad.href} target="_blank" rel="sponsored noopener noreferrer" className="block h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ad.image} alt={ad.alt} loading="lazy" className="h-full w-full object-cover" />
          </a>
        ) : (
          <div className="flex h-full w-full items-center justify-center border border-dashed border-neutral-300 text-sm text-neutral-400">
            Espaço publicitário
          </div>
        )}
      </div>
    </aside>
  );
}
