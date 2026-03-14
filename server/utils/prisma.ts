import { PrismaClient } from '../../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export default prisma

/**
 * Strips the origin from absolute URLs that point to our own server
 * (e.g. http://localhost:3000/uploads/... → /uploads/...)
 * External URLs (e.g. https://instagram.com/...) are returned unchanged.
 */
export function toRelativeUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.pathname.startsWith('/uploads/')) {
      return parsed.pathname
    }
  } catch {
    // Not an absolute URL — already relative
  }
  return url || null
}
