import prisma from '../../utils/prisma'
import { toRelativeUrl } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const method = event.method

  if (method === 'GET') {
    const section = await prisma.section.findUnique({
      where: { id: id as string },
    })
    if (!section) throw createError({ statusCode: 404, statusMessage: 'Section not found' })
    return section
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const section = await prisma.section.update({
      where: { id: id as string },
      data: {
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle ?? null,
        body: body.body ?? null,
        image: toRelativeUrl(body.image),
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      },
    })
    return section
  }

  if (method === 'DELETE') {
    await prisma.section.delete({
      where: { id: id as string },
    })
    return { success: true }
  }
})
