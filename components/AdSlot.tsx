import { ADS } from "@/lib/site";

/**
 * Espaço de publicidade em formato de faixa (970x250 no computador, 320x100 no celular).
 * Com anúncio configurado em lib/site.ts, mostra a arte com link; sem anúncio, uma moldura vazia.
 * Não carrega script de terceiros: o anúncio é só uma imagem com link.
 */
export function AdSlot({ slot }: { slot: keyof typeof ADS }) {
  const ad = ADS[slot];
  const safe = ad && /^https:\/\//i.test(ad.image) && /^https:\/\//i.test(ad.href);

  return (
    <aside aria-label="Publicidade" className="mx-auto w-full max-w-[970px]">
      <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
        Publicidade
      </p>
      <div className="aspect-[32/10] w-full overflow-hidden rounded bg-neutral-100 md:aspect-[97/25]">
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
