import prisma from '../../utils/prisma'
import { getShippingCosts } from '../../utils/rajaongkir'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { destinationCityId, qty = 1 } = body

  if (!destinationCityId) {
    throw createError({ statusCode: 400, statusMessage: 'destinationCityId wajib diisi' })
  }

  const settingsRaw = await prisma.siteSetting.findMany({
    where: { key: { in: ['shippingOriginCityId', 'shippingCouriers', 'shippingDefaultWeight'] } },
  })
  const s = Object.fromEntries(settingsRaw.map(r => [r.key, r.value]))

  const originCityId = s.shippingOriginCityId
  if (!originCityId) return []

  const couriers = (s.shippingCouriers || 'jne').split(',').map((c: string) => c.trim()).filter(Boolean)
  const weightPerItem = Number(s.shippingDefaultWeight || 500)
  const totalWeight = Math.max(weightPerItem, Number(qty) * weightPerItem)

  return getShippingCosts(originCityId, destinationCityId, totalWeight, couriers)
})
