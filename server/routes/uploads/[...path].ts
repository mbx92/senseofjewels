import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

export default defineEventHandler(async (event) => {
  const pathParam = getRouterParam(event, 'path') || ''

  // Security: strip path traversal attempts
  const safePath = normalize(pathParam).replace(/^(\.\.[/\\])+/, '')
  const uploadsDir = join(process.cwd(), 'data', 'uploads')
  const filePath = join(uploadsDir, safePath)

  // Double-check path is still within uploads dir
  if (!filePath.startsWith(uploadsDir + '/') && filePath !== uploadsDir) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  try {
    const stats = await stat(filePath)
    if (!stats.isFile()) throw createError({ statusCode: 404, statusMessage: 'Not found' })

    const ext = extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    const data = await readFile(filePath)

    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Content-Length', stats.size)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

    return data
  }
  catch (e: any) {
    if (e.statusCode) throw e
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }
})
