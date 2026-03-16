import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import { getBackupDir } from '../../utils/backup'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'mm_session')
  if (!sessionId) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const user = await prisma.user.findUnique({ where: { id: sessionId }, select: { id: true } })
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const filename = getRouterParam(event, 'filename') ?? ''

  // Strict pattern validation to prevent path traversal attacks
  if (!/^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/.test(filename)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid filename' })
  }

  const filepath = join(getBackupDir(), filename)

  try {
    const fileInfo = await stat(filepath)
    setResponseHeader(event, 'Content-Type', 'application/octet-stream')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
    setResponseHeader(event, 'Content-Length', fileInfo.size)
    return sendStream(event, createReadStream(filepath))
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Backup file not found' })
  }
})
