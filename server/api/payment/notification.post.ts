import prisma from '../../utils/prisma'
import { verifyMidtransSignature } from '../../utils/midtrans'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    payment_type,
    fraud_status,
  } = body

  // Always verify signature to prevent spoofed notifications
  if (!verifyMidtransSignature(order_id, status_code, gross_amount, signature_key)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid Signature' })
  }

  let paymentStatus: string
  let orderStatus: string | undefined
  let paidAt: Date | undefined

  if (transaction_status === 'capture') {
    paymentStatus = fraud_status === 'accept' ? 'paid' : 'failed'
    if (paymentStatus === 'paid') { orderStatus = 'confirmed'; paidAt = new Date() }
  }
  else if (transaction_status === 'settlement') {
    paymentStatus = 'paid'
    orderStatus = 'confirmed'
    paidAt = new Date()
  }
  else if (transaction_status === 'expire') {
    paymentStatus = 'expired'
  }
  else if (['deny', 'cancel'].includes(transaction_status)) {
    paymentStatus = 'failed'
  }
  else {
    // pending or unknown — no change
    paymentStatus = 'unpaid'
  }

  await prisma.order.update({
    where: { id: order_id },
    data: {
      paymentStatus,
      paymentMethod: payment_type ?? null,
      ...(paidAt ? { paidAt } : {}),
      ...(orderStatus ? { status: orderStatus } : {}),
    },
  })

  return { status: 'OK' }
})
