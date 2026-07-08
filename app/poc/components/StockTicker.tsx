/**
 * Stock price from a public API (server component).
 * Next.js fetches on the server when this component renders.
 */

type StockResult =
  | { ok: true; symbol: string; price: number; source: string }
  | { ok: false; error: string }

async function fetchStockPrice(): Promise<StockResult> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      return { ok: false, error: `Stock API returned HTTP ${response.status}` }
    }

    const data = await response.json()
    const price = data?.bitcoin?.usd

    if (typeof price !== 'number') {
      return { ok: false, error: 'Unexpected response shape from stock API' }
    }

    return {
      ok: true,
      symbol: 'Bitcoin (BTC)',
      price,
      source: 'CoinGecko public API',
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stock price',
    }
  }
}

export default async function StockTicker() {
  const stock = await fetchStockPrice()

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-gray-800">
      {stock.ok ? (
        <>
          <p className="text-3xl font-bold text-gray-900">
            ${stock.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {stock.symbol} — fetched from {stock.source}
          </p>
        </>
      ) : (
        <p className="text-red-700">Could not load stock price: {stock.error}</p>
      )}
    </section>
  )
}
