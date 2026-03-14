import { writeFile, mkdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import prisma from '../../utils/prisma'

const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const file = parts?.find((p) => p.name === 'file')

  if (!file?.data) {
    throw createError({ statusCode: 400, statusMessage: 'File not found' })
  }

  const ext = file.type ? ALLOWED_TYPES[file.type] : undefined
  if (!ext) {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported file type. Use PNG, JPG, SVG, WebP, or GIF' })
  }

  if (file.data.byteLength > MAX_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'Max file size is 5MB' })
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const dir = join(process.cwd(), 'public', 'uploads', 'media')
  await mkdir(dir, { recursive: true })
  const filepath = join(dir, filename)
  await writeFile(filepath, file.data)

  const folderPart = parts?.find((p) => p.name === 'folder')
  const folder = folderPart?.data ? folderPart.data.toString().trim() || null : null

  const media = await prisma.media.create({
    data: {
      filename: file.filename || filename,
      url: `/uploads/media/${filename}`,
      mimeType: file.type || 'application/octet-stream',
      size: file.data.byteLength,
      alt: null,
      folder,
    },
  })

  return media
})
