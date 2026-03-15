import prisma from '../../utils/prisma'

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const VALID_PAYMENT_STATUSES = ['unpaid', 'paid', 'failed', 'expired']

async function getSession(event: any) {
  const sessionId = getCookie(event, 'mm_session')
  if (!sessionId) return null
  return prisma.user.findUnique({ where: { id: sessionId }, select: { id: true, role: true } })
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const method = event.method

  const user = await getSession(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true } },
    },
  })

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  // Customer can only see their own orders
  if (user.role === 'customer' && order.userId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  if (method === 'GET') {
    return order
  }

  // PUT — admin/superadmin only: update status
  if (method === 'PUT') {
    if (user.role === 'customer') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

    const body = await readBody(event)
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      throw createError({ statusCode: 400, statusMessage: 'Status tidak valid' })
    }
    if (body.paymentStatus && !VALID_PAYMENT_STATUSES.includes(body.paymentStatus)) {
      throw createError({ statusCode: 400, statusMessage: 'Payment status tidak valid' })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.paymentStatus ? { paymentStatus: body.paymentStatus } : {}),
      },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })
    return updated
  }

  // DELETE — admin/superadmin only
  if (method === 'DELETE') {
    if (user.role === 'customer') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    await prisma.order.delete({ where: { id } })
    return { success: true }
  }
})
