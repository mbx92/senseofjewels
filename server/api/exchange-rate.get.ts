// Fetches live USD→IDR rate from open.er-api.com (free, no API key required)
// Cached server-side for 1 hour via Nitro's defineCachedEventHandler

export default defineCachedEventHandler(
  async () => {
    const data = await $fetch<{ result: string; rates: Record<string, number> }>(
      'https://open.er-api.com/v6/latest/USD',
    ).catch(() => null)

    const rate = data?.result === 'success' ? (data.rates.IDR ?? 16000) : 16000
    return { IDR: rate, source: data?.result === 'success' ? 'live' : 'fallback' }
  },
  {
    maxAge: 60 * 60, // cache 1 hour
    name: 'exchange-rate-usd-idr',
    getKey: () => 'usd-idr',
  },
)
