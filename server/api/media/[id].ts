import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const method = event.method

  if (method === 'DELETE') {
    const media = await prisma.media.findUnique({ where: { id: id as string } })
    if (!media) throw createError({ statusCode: 404, statusMessage: 'Media not found' })

    // Delete file from disk
    try {
      const filepath = join(process.cwd(), 'data', media.url)
      await unlink(filepath)
    } catch {
      // File may already be missing
    }

    await prisma.media.delete({ where: { id: id as string } })
    return { success: true }
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const media = await prisma.media.update({
      where: { id: id as string },
      data: {
        alt: body.alt ?? null,
        folder: body.folder?.trim() || null,
      },
    })
    return media
  }
})
