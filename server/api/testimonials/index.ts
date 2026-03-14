import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return testimonials
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        role: body.role || null,
        content: body.content,
        avatar: body.avatar || null,
        rating: body.rating ?? 5,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    })
    return testimonial
  }
})
