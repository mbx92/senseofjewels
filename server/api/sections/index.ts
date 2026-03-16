import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const sections = await prisma.section.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return sections
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const section = await prisma.section.create({
      data: {
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle || null,
        body: body.body || null,
        image: body.image || null,
        metadata: body.metadata || null,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    })
    return section
  }
})
