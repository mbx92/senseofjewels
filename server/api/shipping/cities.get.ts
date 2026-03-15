import { searchCities } from '../../utils/rajaongkir'

export default defineEventHandler(async (event) => {
  const { q } = getQuery(event)
  const query = String(q || '').trim()
  if (query.length < 2) return []
  return searchCities(query)
})
