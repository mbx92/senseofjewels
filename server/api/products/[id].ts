import prisma from '../../utils/prisma'
import { toRelativeUrl } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const method = event.method

  if (method === 'GET') {
    const product = await prisma.product.findUnique({
      where: { id: id as string },
      include: { collection: true },
    })
    if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    return product
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const product = await prisma.product.update({
      where: { id: id as string },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description ?? null,
        price: body.price,
        image: toRelativeUrl(body.image),
        gallery: (body.gallery ?? []).map((u: string) => toRelativeUrl(u) ?? u),
        collectionId: body.collectionId,
        isFeatured: body.isFeatured,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    })
    return product
  }

  if (method === 'DELETE') {
    await prisma.product.delete({
      where: { id: id as string },
    })
    return { success: true }
  }
})
