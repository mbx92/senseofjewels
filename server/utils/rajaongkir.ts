// RajaOngkir API V2 — base: https://rajaongkir.komerce.id/api/v1/
// Auth: header 'key: API_KEY'

interface V2Destination {
  id: number
  label: string
  province_name: string
  city_name: string
  district_name: string
  subdistrict_name: string
  zip_code: string
}

interface V2CostItem {
  name: string
  code: string
  service: string
  description: string
  cost: number
  etd: string
}

export interface CityOption {
  id: string         // subdistrict ID as string
  name: string       // subdistrict name
  type: string       // always 'Kelurahan' in V2
  province: string
  postal: string
  label: string      // full label e.g. "GROGOL, GROGOL PETAMBURAN, JAKARTA BARAT, DKI JAKARTA, 11450"
  cityName: string
}

export interface ShippingOption {
  courier: string
  courierName: string
  service: string
  description: string
  cost: number       // IDR
  etd: string
}

const API_BASE = 'https://rajaongkir.komerce.id/api/v1'

export async function searchCities(query: string): Promise<CityOption[]> {
  const config = useRuntimeConfig()
  const apiKey = config.rajaongkirApiKey as string
  if (!apiKey || query.trim().length < 2) return []

  const data = await $fetch<{ meta: { code: number }; data: V2Destination[] }>(
    `${API_BASE}/destination/domestic-destination`,
    {
      headers: { key: apiKey },
      query: { search: query.trim(), limit: 10, offset: 0 },
    },
  ).catch(() => null)

  if (!data?.data) return []

  return data.data.map(d => ({
    id: String(d.id),
    name: d.subdistrict_name,
    type: d.district_name,
    province: d.province_name,
    postal: d.zip_code,
    label: d.label,
    cityName: d.city_name,
  }))
}

export async function getShippingCosts(
  origin: string,
  destination: string,
  weight: number,
  couriers: string[],
): Promise<ShippingOption[]> {
  const config = useRuntimeConfig()
  const apiKey = config.rajaongkirApiKey as string
  if (!apiKey || !origin || !destination) return []

  const results: ShippingOption[] = []

  for (const courier of couriers) {
    const data = await $fetch<{ meta: { code: number }; data: V2CostItem[] }>(
      `${API_BASE}/calculate/domestic-cost`,
      {
        method: 'POST',
        headers: { key: apiKey, 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          origin,
          destination,
          weight: String(weight),
          courier,
        }).toString(),
      },
    ).catch(() => null)

    if (!data?.data) continue

    for (const item of data.data) {
      results.push({
        courier: item.code,
        courierName: item.name,
        service: item.service,
        description: item.description,
        cost: item.cost,
        etd: item.etd,
      })
    }
  }

  return results
}
