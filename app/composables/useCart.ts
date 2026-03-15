/**
 * Cart composable — persists across Nuxt navigations via useState,
 * and across page refreshes via localStorage.
 */

export interface CartProduct {
  id: string
  name: string
  price: string
  image: string | null
  collection: { id: string; name: string; slug: string }
}

export interface CartItem {
  product: CartProduct
  qty: number
}

const STORAGE_KEY = 'soj_cart'

export const useCart = () => {
  // useState gives us global state that survives SPA navigation
  const cart = useState<CartItem[]>('shop_cart', () => [])

  // Restore from localStorage on client (handles page refresh)
  onMounted(() => {
    if (cart.value.length === 0) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) cart.value = JSON.parse(saved)
      } catch {}
    }
  })

  function persist() {
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.value))
      } catch {}
    }
  }

  function addToCart(product: CartProduct) {
    const existing = cart.value.find(i => i.product.id === product.id)
    if (existing) existing.qty++
    else cart.value.push({ product, qty: 1 })
    persist()
  }

  function removeFromCart(productId: string) {
    cart.value = cart.value.filter(i => i.product.id !== productId)
    persist()
  }

  function updateQty(productId: string, delta: number) {
    const item = cart.value.find(i => i.product.id === productId)
    if (!item) return
    item.qty += delta
    if (item.qty <= 0) removeFromCart(productId)
    else persist()
  }

  function clearCart() {
    cart.value = []
    persist()
  }

  const cartCount = computed(() => cart.value.reduce((s, i) => s + i.qty, 0))
  const cartTotal = computed(() => cart.value.reduce((s, i) => s + Number(i.product.price) * i.qty, 0))

  return { cart, cartCount, cartTotal, addToCart, removeFromCart, updateQty, clearCart }
}
