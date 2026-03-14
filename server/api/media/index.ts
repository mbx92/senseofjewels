import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const query = getQuery(event)
    const folder = query.folder as string | undefined

    const where = folder === 'uncategorized'
      ? { folder: null }
      : folder
        ? { folder }
        : {}

    const [media, rawFolders] = await Promise.all([
      prisma.media.findMany({ where, orderBy: { createdAt: 'desc' } }),
      prisma.media.findMany({
        where: { folder: { not: null } },
        select: { folder: true },
        distinct: ['folder'],
        orderBy: { folder: 'asc' },
      }),
    ])

    const folders = rawFolders.map((r) => r.folder as string)
    return { media, folders }
  }
})
