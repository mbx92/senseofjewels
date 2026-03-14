import prisma from '../../utils/prisma'
import { toRelativeUrl } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const method = event.method

  if (method === 'GET') {
    const collection = await prisma.collection.findUnique({
      where: { id: id as string },
      include: { products: { orderBy: { sortOrder: 'asc' } } },
    })
    if (!collection) throw createError({ statusCode: 404, statusMessage: 'Collection not found' })
    return collection
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const collection = await prisma.collection.update({
      where: { id: id as string },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description ?? null,
        image: toRelativeUrl(body.image),
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      },
    })
    return collection
  }

  if (method === 'DELETE') {
    await prisma.collection.delete({
      where: { id: id as string },
    })
    return { success: true }
  }
})
