import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const query = getQuery(event)
    const where: Record<string, unknown> = {}
    if (query.collectionId) where.collectionId = query.collectionId as string
    if (query.featured === 'true') where.isFeatured = true

    const products = await prisma.product.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: { collection: { select: { id: true, name: true, slug: true } } },
    })
    return products
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        price: body.price,
        image: body.image || null,
        gallery: body.gallery || [],
        collectionId: body.collectionId,
        isFeatured: body.isFeatured ?? false,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    })
    return product
  }
})
