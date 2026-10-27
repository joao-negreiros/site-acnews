export type Quote = { label: string; value: string; pct: number };

const HOUR = 3600;

const brl = (n: number, digits = 2) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

async function currencies(): Promise<Quote[]> {
  try {
    const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL", {
      next: { revalidate: HOUR },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const d = await res.json();
    return [
      { label: "Dólar", value: brl(+d.USDBRL.bid), pct: +d.USDBRL.pctChange },
      { label: "Euro", value: brl(+d.EURBRL.bid), pct: +d.EURBRL.pctChange },
    ];
  } catch {
    return [];
  }
}

async function ibovespa(): Promise<Quote[]> {
  try {
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP?interval=1d&range=5d",
      {
        next: { revalidate: HOUR },
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) return [];
    const r = (await res.json()).chart.result[0];
    const closes: number[] = r.indicators.quote[0].close.filter((c: number | null) => c != null);
    const price: number = r.meta.regularMarketPrice;
    const prev = closes.length >= 2 ? closes[closes.length - 2] : r.meta.chartPreviousClose;
    return [{ label: "Ibovespa", value: brl(price, 0), pct: ((price - prev) / prev) * 100 }];
  } catch {
    return [];
  }
}

/** Dólar, euro e Ibovespa. Cada fonte falha sozinha: se uma cair, as outras continuam. */
export async function getQuotes(): Promise<Quote[]> {
  const [fx, ibov] = await Promise.all([currencies(), ibovespa()]);
  return [...fx, ...ibov];
}
