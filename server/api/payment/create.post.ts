import prisma from '../../utils/prisma'
import { createSnapTransaction, getUsdToIdrRate } from '../../utils/midtrans'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'mm_session')
  if (!sessionId) throw createError({ statusCode: 401, statusMessage: 'Login diperlukan' })

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, role: true },
  })
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const { orderId } = await readBody(event)
  if (!orderId) throw createError({ statusCode: 400, statusMessage: 'orderId wajib diisi' })

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order tidak ditemukan' })
  if (order.userId !== user.id) throw createError({ statusCode: 403, statusMessage: 'Akses ditolak' })
  if (order.paymentStatus === 'paid') {
    throw createError({ statusCode: 400, statusMessage: 'Order ini sudah dibayar' })
  }

  // Return existing token if already created (idempotent)
  if (order.paymentToken) {
    return { token: order.paymentToken, redirectUrl: order.paymentUrl }
  }

  // Get live exchange rate USD → IDR (Midtrans requires IDR)
  const exchangeRate = await getUsdToIdrRate()

  // Build item details with IDR integer prices
  const itemDetails = order.items.map(item => ({
    id: item.productId,
    price: Math.round(Number(item.price) * exchangeRate),
    quantity: item.qty,
    name: item.productName.slice(0, 50),
  }))

  // Add shipping cost as a line item if present (stored in IDR)
  if (order.shippingCost && Number(order.shippingCost) > 0) {
    const shippingIDR = Math.round(Number(order.shippingCost))
    itemDetails.push({
      id: 'SHIPPING',
      price: shippingIDR,
      quantity: 1,
      name: `Pengiriman ${[order.shippingCourier, order.shippingService].filter(Boolean).join(' ')}`.trim().slice(0, 50),
    })
  }

  // Midtrans gross_amount must equal sum of item prices × quantities
  const grossAmount = itemDetails.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const transaction = await createSnapTransaction({
    transaction_details: { order_id: order.id, gross_amount: grossAmount },
    customer_details: {
      first_name: order.shipName,
      email: order.shipEmail,
      phone: order.shipPhone,
    },
    item_details: itemDetails,
  })

  // Persist token to order
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentToken: transaction.token, paymentUrl: transaction.redirect_url },
  })

  return { token: transaction.token, redirectUrl: transaction.redirect_url }
})
