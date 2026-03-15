import { createHash } from 'node:crypto'

interface SnapTransactionParams {
  transaction_details: { order_id: string; gross_amount: number }
  customer_details?: { first_name?: string; email?: string; phone?: string }
  item_details?: Array<{ id: string; price: number; quantity: number; name: string }>
}

export async function createSnapTransaction(params: SnapTransactionParams) {
  const config = useRuntimeConfig()
  const serverKey = config.midtransServerKey as string

  if (!serverKey) {
    throw createError({ statusCode: 500, statusMessage: 'Payment gateway belum dikonfigurasi. Tambahkan NUXT_MIDTRANS_SERVER_KEY.' })
  }

  const isProduction = config.public.midtransIsProduction === 'true'
  const baseUrl = isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

  const auth = Buffer.from(`${serverKey}:`).toString('base64')

  return $fetch<{ token: string; redirect_url: string }>(baseUrl, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
    body: params,
  })
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
): boolean {
  const config = useRuntimeConfig()
  const serverKey = config.midtransServerKey as string
  const expected = createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex')
  return signatureKey === expected
}

export async function getUsdToIdrRate(): Promise<number> {
  try {
    const data = await $fetch<{ result: string; rates: Record<string, number> }>(
      'https://open.er-api.com/v6/latest/USD',
    )
    return data.result === 'success' ? (data.rates.IDR ?? 16000) : 16000
  }
  catch {
    return 16000
  }
}
