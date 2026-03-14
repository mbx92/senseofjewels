import prisma from '../../utils/prisma'
import { toRelativeUrl } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const settings = await prisma.siteSetting.findMany()
    // Return as key-value object
    const result: Record<string, string> = {}
    for (const s of settings) {
      result[s.key] = s.value
    }
    return result
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    // body is { key: value, key: value, ... }
    const URL_KEYS = ['logoUrl', 'ogImage']
    const entries = Object.entries(body) as [string, string][]
    for (const [key, value] of entries) {
      const normalized = URL_KEYS.includes(key) ? (toRelativeUrl(value) ?? '') : String(value)
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: normalized },
        create: { key, value: normalized },
      })
    }
    return { success: true }
  }
})
