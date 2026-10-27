export type Quote = { label: string; value: string; pct: number };

const HOUR = 3600;

const SYMBOLS = [
  { label: "Dólar", symbol: "USDBRL=X", digits: 2 },
  { label: "Euro", symbol: "EURBRL=X", digits: 2 },
  { label: "Ibovespa", symbol: "^BVSP", digits: 0 },
] as const;

const fmt = (n: number, digits: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

async function quote(s: (typeof SYMBOLS)[number]): Promise<Quote | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s.symbol)}?interval=1d&range=5d`,
      {
        next: { revalidate: HOUR },
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const meta = (await res.json()).chart.result[0].meta;
    return { label: s.label, value: fmt(meta.regularMarketPrice, s.digits), pct: meta.regularMarketChangePercent };
  } catch (e) {
    console.error(`cotação ${s.label} falhou:`, e);
    return null;
  }
}

/** Dólar, euro e Ibovespa, atualizados a cada 1 hora. Cada cotação falha sozinha. */
export async function getQuotes(): Promise<Quote[]> {
  const all = await Promise.all(SYMBOLS.map(quote));
  return all.filter((q): q is Quote => q !== null && Number.isFinite(q.pct));
}
