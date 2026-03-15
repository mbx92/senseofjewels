<script setup lang="ts">
import { IconDiamond, IconShoppingCart, IconCircleCheck, IconClock, IconMapPin, IconPhone, IconMail, IconArrowLeft, IconX } from '@tabler/icons-vue'

definePageMeta({ layout: false, middleware: 'features' })

const { data: themeSettings } = useFetch<Record<string, string>>('/api/settings')
useTheme(themeSettings)

const { user, fetchUser } = useAuth()
const { cart, cartTotal, clearCart } = useCart()

onMounted(async () => {
  await fetchUser()
  if (!user.value) {
    await navigateTo({ path: '/login', query: { redirect: '/checkout' } })
    return
  }
  if (cart.value.length === 0) {
    await navigateTo('/shop')
    return
  }
  // Pre-fill from user profile
  form.name = user.value.name || ''
  form.email = user.value.email || ''
})

const { data: settings } = useFetch<Record<string, string>>('/api/settings')
const { lang, currency, t, formatPrice, formatShipping, toggleLang, toggleCurrency } = useLocale()

const config = useRuntimeConfig()
useHead({
  htmlAttrs: { 'data-theme': 'jewels' },
  script: [{
    src: config.public.midtransIsProduction === 'true'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js',
    'data-client-key': config.public.midtransClientKey as string,
    defer: true,
  }],
})

const step = ref<'form' | 'success' | 'pending'>('form')
const submitting = ref(false)
const error = ref('')
const orderId = ref('')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  cityId: '',
  city: '',
  province: '',
  postal: '',
  notes: '',
})
const snapToken = ref<string | null>(null)

// ─── Shipping ──────────────────────────────────────────────────────────────
const shippingEnabled = computed(() => !!settings.value?.shippingOriginCityId)

interface CityResult { id: string; name: string; type: string; province: string; postal: string; label: string; cityName: string }
interface ShippingOption { courier: string; courierName: string; service: string; description: string; cost: number; etd: string }

const citySearch = ref('')
const cityResults = ref<CityResult[]>([])
const citySearching = ref(false)
let cityDebounce: ReturnType<typeof setTimeout> | null = null

const shippingOptions = ref<ShippingOption[]>([])
const selectedShipping = ref<ShippingOption | null>(null)
const loadingShipping = ref(false)

function onCitySearch() {
  form.cityId = ''
  form.city = ''
  form.province = ''
  form.postal = ''
  selectedShipping.value = null
  shippingOptions.value = []
  if (cityDebounce) clearTimeout(cityDebounce)
  const q = citySearch.value.trim()
  if (q.length < 2) { cityResults.value = []; citySearching.value = false; return }
  citySearching.value = true
  cityDebounce = setTimeout(async () => {
    cityResults.value = await $fetch<CityResult[]>(`/api/shipping/cities?q=${encodeURIComponent(q)}`).catch(() => [])
    citySearching.value = false
  }, 350)
}

function selectCity(city: CityResult) {
  form.cityId = city.id
  form.city = city.name
  form.province = city.province
  form.postal = city.postal
  citySearch.value = city.label
  cityResults.value = []
  fetchShippingCosts()
}

function clearCitySelection() {
  form.cityId = ''
  form.city = ''
  form.province = ''
  form.postal = ''
  citySearch.value = ''
  cityResults.value = []
  selectedShipping.value = null
  shippingOptions.value = []
}

async function fetchShippingCosts() {
  if (!form.cityId || !shippingEnabled.value) return
  loadingShipping.value = true
  shippingOptions.value = []
  selectedShipping.value = null
  try {
    const totalQty = cart.value.reduce((sum: number, i: any) => sum + i.qty, 0)
    const result = await $fetch<ShippingOption[]>('/api/shipping/cost', {
      method: 'POST',
      body: { destinationCityId: form.cityId, qty: totalQty },
    })
    shippingOptions.value = result || []
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || 'Gagal mengambil ongkos kirim'
  }
  loadingShipping.value = false
}

const shippingCostIDR = computed(() => selectedShipping.value?.cost ?? 0)
const grandTotal = computed(() => cartTotal.value + shippingCostIDR.value)

const canSubmit = computed(() =>
  !(shippingEnabled.value && form.cityId && shippingOptions.value.length > 0 && !selectedShipping.value),
)

// If form or selected shipping changes after token was issued, invalidate it
watch([form, selectedShipping], () => {
  if (snapToken.value) { snapToken.value = null; orderId.value = '' }
}, { deep: true })

function openSnapPayment() {
  if (!snapToken.value) return
  ;(window as any).snap?.pay(snapToken.value, {
    onSuccess: () => {
      step.value = 'success'
      clearCart()
      snapToken.value = null
    },
    onPending: () => {
      step.value = 'pending'
      clearCart()
      snapToken.value = null
    },
    onError: () => {
      error.value = t.value.checkout.paymentFailed
      snapToken.value = null
      orderId.value = ''
    },
    onClose: () => {
      // User closed popup without paying — keep snapToken so they can reopen
    },
  })
}

function resetOrder() {
  snapToken.value = null
  orderId.value = ''
  error.value = ''
}

async function placeOrder() {
  if (submitting.value) return
  // If we already have a snap token, just (re)open the payment popup
  if (snapToken.value) {
    openSnapPayment()
    return
  }

  // Validate city selection when shipping is enabled
  if (shippingEnabled.value && !form.cityId) {
    error.value = t.value.checkout.citySelectRequired || 'Please select a city from the dropdown'
    return
  }
  if (shippingEnabled.value && form.cityId && shippingOptions.value.length > 0 && !selectedShipping.value) {
    error.value = t.value.checkout.selectShippingRequired || 'Please select a shipping option'
    return
  }

  error.value = ''
  submitting.value = true
  try {
    // Step 1: create order
    const order = await $fetch<{ id: string }>('/api/orders', {
      method: 'POST',
      body: {
        shipName: form.name,
        shipEmail: form.email,
        shipPhone: form.phone,
        shipAddress: form.address,
        shipCity: form.city,
        shipProvince: form.province,
        shipPostal: form.postal,
        shipNotes: form.notes,
        items: cart.value.map(i => ({ productId: i.product.id, qty: i.qty })),
        shippingCostIDR: selectedShipping.value?.cost ?? null,
        shippingCourier: selectedShipping.value?.courier ?? null,
        shippingService: selectedShipping.value?.service ?? null,
      },
    })
    orderId.value = order.id

    // Step 2: create Midtrans Snap token
    const payment = await $fetch<{ token: string }>('/api/payment/create', {
      method: 'POST',
      body: { orderId: order.id },
    })
    snapToken.value = payment.token
    submitting.value = false

    // Step 3: open Snap payment popup
    openSnapPayment()
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || t.value.checkout.errorGeneric
    submitting.value = false
  }
}

useSeoMeta({ title: () => `Checkout — ${settings.value?.siteName || 'Sense of Jewels'}` })
</script>

<template>
  <div data-theme="jewels" class="min-h-screen bg-base-200">
    <!-- Navbar -->
    <nav class="bg-base-100 border-b border-base-200 sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
        <NuxtLink to="/shop" class="btn btn-sm btn-ghost gap-2 text-base-content/60 shrink-0">
          <IconArrowLeft class="w-4 h-4" />
          <span class="hidden sm:inline">{{ t.checkout.backToShop }}</span>
        </NuxtLink>
        <div class="flex-1" />
        <NuxtLink to="/shop" class="flex items-center gap-2 shrink-0">
          <img v-if="settings?.logoUrl" :src="settings.logoUrl" :alt="settings?.siteName || 'Sense of Jewels'" class="h-8 w-auto max-w-36 object-contain" />
          <span v-else class="flex items-center gap-2 text-primary font-serif text-sm tracking-widest uppercase font-semibold">
            <IconDiamond class="size-4 text-secondary" />
            {{ settings?.siteName || 'Sense of Jewels' }}
          </span>
        </NuxtLink>
        <div class="flex-1" />
        <div class="flex items-center gap-1">
          <button @click="toggleLang" class="btn btn-xs btn-ghost font-medium tracking-widest text-base-content/50 hover:text-primary px-2">
            {{ lang === 'en' ? 'EN' : 'ID' }}
          </button>
          <span class="text-base-content/20 text-xs">|</span>
          <button @click="toggleCurrency" class="btn btn-xs btn-ghost font-medium tracking-widest text-base-content/50 hover:text-primary px-2">
            {{ currency }}
          </button>
        </div>
      </div>
    </nav>

    <!-- Success State -->
    <div v-if="step === 'success'" class="max-w-lg mx-auto px-6 py-20 text-center">
      <div class="bg-base-100 rounded-2xl shadow-sm p-10 flex flex-col items-center gap-5">
        <div class="bg-success/10 rounded-full p-4">
          <IconCircleCheck class="w-14 h-14 text-success" />
        </div>
        <div>
          <h1 class="font-serif text-2xl text-primary font-light mb-2">{{ t.checkout.successTitle }}</h1>
          <p class="text-base-content/60 text-sm leading-relaxed max-w-xs mx-auto">
            {{ t.checkout.successMessage }}
          </p>
        </div>
        <div class="font-mono text-xs text-base-content/40 bg-base-200 px-4 py-2 rounded-lg">
          Order #{{ orderId.slice(-8).toUpperCase() }}
        </div>
        <NuxtLink to="/shop" class="btn btn-primary btn-sm tracking-widest uppercase gap-2 mt-2">
          <IconShoppingCart class="w-4 h-4" />
          {{ t.checkout.continueShopping }}
        </NuxtLink>
      </div>
    </div>

    <!-- Pending Payment State -->
    <div v-else-if="step === 'pending'" class="max-w-lg mx-auto px-6 py-20 text-center">
      <div class="bg-base-100 rounded-2xl shadow-sm p-10 flex flex-col items-center gap-5">
        <div class="bg-warning/10 rounded-full p-4">
          <IconClock class="w-14 h-14 text-warning" />
        </div>
        <div>
          <h1 class="font-serif text-2xl text-primary font-light mb-2">{{ t.checkout.pendingTitle }}</h1>
          <p class="text-base-content/60 text-sm leading-relaxed max-w-xs mx-auto">
            {{ t.checkout.pendingMessage }}
          </p>
        </div>
        <div class="font-mono text-xs text-base-content/40 bg-base-200 px-4 py-2 rounded-lg">
          Order #{{ orderId.slice(-8).toUpperCase() }}
        </div>
        <NuxtLink to="/shop" class="btn btn-primary btn-sm tracking-widest uppercase gap-2 mt-2">
          <IconShoppingCart class="w-4 h-4" />
          {{ t.checkout.continueShopping }}
        </NuxtLink>
      </div>
    </div>

    <!-- Checkout Form -->
    <template v-else>
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 class="font-serif text-2xl sm:text-3xl text-primary font-light tracking-wide mb-8">{{ t.checkout.title }}</h1>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <!-- Left: shipping form -->
          <div class="lg:col-span-3 space-y-4">
            <div class="bg-base-100 rounded-2xl shadow-sm p-6">
            <h2 class="text-sm font-semibold uppercase tracking-widest text-base-content/50 mb-5">{{ t.checkout.shippingDetails }}</h2>

            <form id="checkout-form" @submit.prevent="placeOrder" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">{{ t.checkout.fullName }} <span class="text-error">*</span></legend>
                  <input v-model="form.name" type="text" class="input input-sm w-full" required />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">{{ t.checkout.phone }} <span class="text-error">*</span></legend>
                  <label class="input input-sm w-full">
                    <IconPhone class="w-3.5 h-3.5 opacity-40 shrink-0" />
                    <input v-model="form.phone" type="tel" required placeholder="08xx-xxxx-xxxx" />
                  </label>
                </fieldset>
              </div>

              <fieldset class="fieldset">
                <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">{{ t.checkout.email }} <span class="text-error">*</span></legend>
                <label class="input input-sm w-full">
                  <IconMail class="w-3.5 h-3.5 opacity-40 shrink-0" />
                  <input v-model="form.email" type="email" required />
                </label>
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">{{ t.checkout.address }} <span class="text-error">*</span></legend>
                <label class="input input-sm w-full items-start">
                  <IconMapPin class="w-3.5 h-3.5 opacity-40 shrink-0 mt-2.5" />
                  <textarea v-model="form.address" class="resize-none w-full bg-transparent outline-none py-1.5 text-sm" rows="2" required :placeholder="t.checkout.addressPlaceholder"></textarea>
                </label>
              </fieldset>

              <!-- City / Province / Postal -->
              <template v-if="shippingEnabled">
                <!-- City search typeahead -->
                <fieldset class="fieldset">
                  <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">{{ t.checkout.city }} <span class="text-error">*</span></legend>
                  <div class="relative">
                    <label class="input input-sm w-full gap-2" :class="form.cityId ? 'input-success' : ''">
                      <IconMapPin class="w-3.5 h-3.5 opacity-40 shrink-0" />
                      <input
                        v-model="citySearch"
                        @input="onCitySearch"
                        type="text"
                        :placeholder="t.checkout.citySearchPlaceholder"
                        autocomplete="off"
                        class="flex-1 min-w-0"
                      />
                      <button v-if="form.cityId" type="button" @mousedown.prevent="clearCitySelection" class="text-base-content/30 hover:text-error transition-colors">
                        <IconX class="w-3.5 h-3.5" />
                      </button>
                      <span v-else-if="citySearching" class="loading loading-spinner loading-xs opacity-40"></span>
                    </label>
                    <div v-if="cityResults.length" class="absolute top-full left-0 right-0 z-50 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      <button
                        v-for="city in cityResults"
                        :key="city.id"
                        type="button"
                        @mousedown.prevent="selectCity(city)"
                        class="w-full text-left px-3 py-2 text-sm hover:bg-base-200 transition-colors border-b border-base-200 last:border-0"
                      >
                        <span class="font-medium">{{ city.type }} {{ city.name }}</span>
                        <span class="text-base-content/40 ml-1 text-xs">&mdash; {{ city.province }}</span>
                      </button>
                    </div>
                  </div>
                </fieldset>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">{{ t.checkout.province }} <span class="text-error">*</span></legend>
                    <input v-model="form.province" type="text" class="input input-sm w-full" required />
                  </fieldset>
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">{{ t.checkout.postalCode }} <span class="text-error">*</span></legend>
                    <input v-model="form.postal" type="text" class="input input-sm w-full" required maxlength="10" />
                  </fieldset>
                </div>
              </template>
              <template v-else>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">{{ t.checkout.city }} <span class="text-error">*</span></legend>
                    <input v-model="form.city" type="text" class="input input-sm w-full" required />
                  </fieldset>
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">{{ t.checkout.province }} <span class="text-error">*</span></legend>
                    <input v-model="form.province" type="text" class="input input-sm w-full" required />
                  </fieldset>
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">{{ t.checkout.postalCode }} <span class="text-error">*</span></legend>
                    <input v-model="form.postal" type="text" class="input input-sm w-full" required maxlength="10" />
                  </fieldset>
                </div>
              </template>

              <fieldset class="fieldset">
                <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">{{ t.checkout.notes }}</legend>
                <textarea v-model="form.notes" class="textarea textarea-sm w-full" rows="2" :placeholder="t.checkout.notesPlaceholder"></textarea>
              </fieldset>

            </form>

            <div v-if="error" role="alert" class="alert alert-error alert-soft mt-4">
              <span class="text-sm">{{ error }}</span>
            </div>
            </div>

            <!-- Shipping Options Card -->
            <div v-if="shippingEnabled && form.cityId" class="bg-base-100 rounded-2xl shadow-sm p-6">
              <h2 class="text-sm font-semibold uppercase tracking-widest text-base-content/50 mb-4">{{ t.checkout.shippingOptions }}</h2>
              <div v-if="loadingShipping" class="flex items-center gap-2 text-sm text-base-content/50 py-3">
                <span class="loading loading-spinner loading-xs"></span>
                {{ t.checkout.loadingShipping }}
              </div>
              <div v-else-if="!shippingOptions.length" class="text-sm text-base-content/40 py-3">
                {{ t.checkout.noShipping }}
              </div>
              <div v-else class="space-y-2">
                <label
                  v-for="option in shippingOptions"
                  :key="`${option.courier}-${option.service}`"
                  class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors select-none"
                  :class="selectedShipping === option ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-base-content/20'"
                >
                  <input type="radio" v-model="selectedShipping" :value="option" class="radio radio-sm radio-primary shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-base-content uppercase tracking-wide">{{ option.courier }} &middot; {{ option.service }}</p>
                    <p class="text-xs text-base-content/40">{{ option.description }} &middot; {{ option.etd }}</p>
                  </div>
                  <span class="text-sm font-medium text-primary shrink-0">{{ formatShipping(option.cost) }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Right: order summary + submit -->
          <div class="lg:col-span-2 space-y-4">
            <div class="bg-base-100 rounded-2xl shadow-sm p-6">
              <h2 class="text-sm font-semibold uppercase tracking-widest text-base-content/50 mb-4">{{ t.checkout.orderSummary }}</h2>
              <div class="space-y-3">
                <div v-for="item in cart" :key="item.product.id" class="flex items-center gap-3">
                  <img v-if="item.product.image" :src="item.product.image" :alt="item.product.name" class="w-12 h-12 rounded-lg object-cover bg-base-200 shrink-0" />
                  <div v-else class="w-12 h-12 rounded-lg bg-base-200 flex items-center justify-center shrink-0">
                    <IconDiamond class="w-5 h-5 text-base-content/20" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-primary line-clamp-1">{{ item.product.name }}</p>
                    <p class="text-xs text-base-content/40">× {{ item.qty }}</p>
                  </div>
                  <span class="text-sm font-medium text-primary shrink-0">{{ formatPrice(Number(item.product.price) * item.qty) }}</span>
                </div>
              </div>

              <div v-if="shippingEnabled" class="border-t border-base-200 mt-4 pt-3 space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-base-content/50">{{ t.checkout.subtotal }}</span>
                  <span class="text-base-content">{{ formatPrice(cartTotal) }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-base-content/50">{{ t.checkout.shipping }}</span>
                  <span v-if="selectedShipping" class="text-base-content">{{ formatShipping(selectedShipping.cost) }}</span>
                  <span v-else class="text-base-content/30 text-xs italic">&mdash;</span>
                </div>
                <div class="pt-2 border-t border-base-200 flex items-center justify-between">
                  <span class="text-xs uppercase tracking-widest text-base-content/50 font-semibold">{{ t.checkout.total }}</span>
                  <span class="font-serif text-xl text-primary">{{ formatPrice(grandTotal) }}</span>
                </div>
              </div>
              <div v-else class="border-t border-base-200 mt-4 pt-4 flex items-center justify-between">
                <span class="text-xs uppercase tracking-widest text-base-content/50 font-semibold">{{ t.checkout.total }}</span>
                <span class="font-serif text-xl text-primary">{{ formatPrice(cartTotal) }}</span>
              </div>
            </div>

            <div v-if="snapToken" class="space-y-2">
              <button
                type="button"
                @click="openSnapPayment"
                class="btn btn-primary w-full gap-2 tracking-widest uppercase"
              >
                <IconShoppingCart class="w-5 h-5" />
                {{ t.checkout.continuePayment }}
              </button>
              <button type="button" @click="resetOrder" class="btn btn-ghost btn-sm w-full text-xs text-base-content/40">
                {{ t.checkout.resetOrder }}
              </button>
            </div>
            <template v-else>
              <button
                type="submit"
                form="checkout-form"
                class="btn btn-primary w-full gap-2 tracking-widest uppercase"
                :disabled="submitting || !canSubmit"
              >
                <span v-if="submitting" class="loading loading-spinner loading-sm"></span>
                <template v-else><IconShoppingCart class="w-5 h-5" /></template>
                {{ submitting ? t.checkout.processing : t.checkout.placeOrder }}
              </button>
              <p class="text-center text-xs text-base-content/30">
                {{ t.checkout.terms }}
              </p>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
