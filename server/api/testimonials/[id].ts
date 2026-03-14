import prisma from '../../utils/prisma'
import { toRelativeUrl } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const method = event.method

  if (method === 'PUT') {
    const body = await readBody(event)
    const testimonial = await prisma.testimonial.update({
      where: { id: id as string },
      data: {
        name: body.name,
        role: body.role ?? null,
        content: body.content,
        avatar: toRelativeUrl(body.avatar),
        rating: body.rating,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    })
    return testimonial
  }

  if (method === 'DELETE') {
    await prisma.testimonial.delete({
      where: { id: id as string },
    })
    return { success: true }
  }
})
