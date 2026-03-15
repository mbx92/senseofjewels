import prisma from '../../utils/prisma'

async function getSession(event: any) {
  const sessionId = getCookie(event, 'mm_session')
  if (!sessionId) return null
  return prisma.user.findUnique({ where: { id: sessionId }, select: { id: true, role: true } })
}

export default defineEventHandler(async (event) => {
  const method = event.method

  // GET — admin: all orders / customer: their own orders
  if (method === 'GET') {
    const user = await getSession(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

    const where = user.role === 'customer' ? { userId: user.id } : {}
    const query = getQuery(event)
    const status = query.status as string | undefined

    const orders = await prisma.order.findMany({
      where: { ...where, ...(status ? { status } : {}) },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return orders
  }

  // POST — create order (requires customer session)
  if (method === 'POST') {
    const user = await getSession(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Login diperlukan untuk checkout' })

    const body = await readBody(event)
    const { shipName, shipEmail, shipPhone, shipAddress, shipCity, shipProvince, shipPostal, shipNotes, items,
      shippingCostIDR, shippingCourier, shippingService } = body

    if (!shipName || !shipEmail || !shipPhone || !shipAddress || !shipCity || !shipProvince || !shipPostal) {
      throw createError({ statusCode: 400, statusMessage: 'Semua field alamat pengiriman wajib diisi' })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Keranjang kosong' })
    }

    // Verify products exist and compute subtotal
    const productIds: string[] = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true, name: true, price: true, image: true },
    })

    const productMap = new Map(products.map(p => [p.id, p]))
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) throw createError({ statusCode: 400, statusMessage: `Produk tidak ditemukan: ${item.productId}` })
      const qty = Number(item.qty) || 1
      const price = Number(product.price)
      subtotal += price * qty
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image ?? null,
        price: product.price,
        qty,
      })
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        shipName,
        shipEmail,
        shipPhone,
        shipAddress,
        shipCity,
        shipProvince,
        shipPostal,
        shipNotes: shipNotes || null,
        subtotal,
        shippingCost: shippingCostIDR ? Number(shippingCostIDR) : null,
        shippingCourier: shippingCourier || null,
        shippingService: shippingService || null,
        items: { create: orderItems },
      },
      include: { items: true },
    })

    return order
  }
})
