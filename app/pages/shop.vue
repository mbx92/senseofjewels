<script setup lang="ts">
import { IconDiamond, IconSearch, IconShoppingBag, IconX, IconBrandWhatsapp, IconMail, IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'

definePageMeta({ layout: false, middleware: 'features' })

const { data: themeSettings } = useFetch<Record<string, string>>('/api/settings')
useTheme(themeSettings)

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  isActive: boolean
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: string
  image: string | null
  gallery: string[]
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
  collection: { id: string; name: string; slug: string }
}

const { data: allProducts } = await useFetch<Product[]>('/api/products')
const { data: collectionsData } = await useFetch<Collection[]>('/api/collections')
const { data: settings } = await useFetch<Record<string, string>>('/api/settings')

const { lang, currency, t, formatPrice, toggleLang, toggleCurrency } = useLocale()
const requestURL = useRequestURL()

const collections = computed(() => collectionsData.value?.filter(c => c.isActive) ?? [])
const products = computed(() => allProducts.value?.filter(p => p.isActive) ?? [])

const selectedCollection = ref<string | null>(null)
const search = ref('')
const sortBy = ref<'default' | 'price-asc' | 'price-desc'>('default')

const filteredProducts = computed(() => {
  let list = products.value

  if (selectedCollection.value)
    list = list.filter(p => p.collection.id === selectedCollection.value)

  if (search.value.trim())
    list = list.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()))

  if (sortBy.value === 'price-asc')
    list = [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
  else if (sortBy.value === 'price-desc')
    list = [...list].sort((a, b) => parseFloat(b.price) - parseFloat(a.price))

  return list
})

const activeCollection = computed(() => collections.value.find(c => c.id === selectedCollection.value))

// --- Product modal ---
const selectedProduct = ref<Product | null>(null)
const galleryIndex = ref(0)

function openProduct(product: Product) {
  selectedProduct.value = product
  galleryIndex.value = 0
  document.body.style.overflow = 'hidden'
}

function closeProduct() {
  selectedProduct.value = null
  document.body.style.overflow = ''
}

const modalImages = computed(() => {
  if (!selectedProduct.value) return []
  const imgs = []
  if (selectedProduct.value.image) imgs.push(selectedProduct.value.image)
  imgs.push(...(selectedProduct.value.gallery ?? []))
  return imgs
})

function prevImage() {
  if (galleryIndex.value > 0) galleryIndex.value--
}
function nextImage() {
  if (galleryIndex.value < modalImages.value.length - 1) galleryIndex.value++
}

function inquireWhatsApp(product: Product) {
  const phone = settings.value?.whatsappNumber?.replace(/\D/g, '')
  const price = formatPrice(product.price)
  const text = encodeURIComponent(t.value.inquiry.waMessage(product.name, price))
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
}

function inquireEmail(product: Product) {
  const email = settings.value?.contactEmail || ''
  const price = formatPrice(product.price)
  const subject = encodeURIComponent(t.value.inquiry.emailSubject(product.name))
  const body = encodeURIComponent(t.value.inquiry.emailBody(product.name, product.collection.name, price))
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
}

useHead({ htmlAttrs: { style: 'scroll-behavior: smooth;' } })

const shopTitle = computed(() => `${t.value.nav.shop} — ${settings.value?.siteName || 'Sense of Jewels'}`)

useSeoMeta({
  title: () => shopTitle.value,
  description: () => settings.value?.metaDescription || settings.value?.siteTagline || 'Browse our handcrafted Balinese jewelry collections — necklaces, earrings, bracelets, rings and more.',
  keywords: () => settings.value?.metaKeywords || '',
  ogTitle: () => shopTitle.value,
  ogDescription: () => settings.value?.metaDescription || settings.value?.siteTagline || 'Browse our handcrafted Balinese jewelry collections.',
  ogImage: () => settings.value?.ogImage || '',
  ogType: 'website',
  ogUrl: () => requestURL.href,
  twitterCard: 'summary_large_image',
  twitterTitle: () => shopTitle.value,
  twitterDescription: () => settings.value?.siteTagline || 'Browse our handcrafted Balinese jewelry collections.',
})
</script>

<template>
  <div data-theme="jewels" class="min-h-screen bg-base-100 font-sans">

    <!-- ===== NAVBAR ===== -->
    <nav class="fixed top-0 z-50 w-full bg-base-100/90 backdrop-blur-md border-b border-base-200">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
          <img v-if="settings?.logoUrl" :src="settings.logoUrl" :alt="settings?.siteName || 'Sense of Jewels'" class="h-9 w-auto max-w-40 object-contain" />
          <span v-else class="flex items-center gap-2 text-primary font-serif text-base font-semibold tracking-widest uppercase">
            <IconDiamond class="size-4 shrink-0 text-secondary" />
            <span class="truncate max-w-35 sm:max-w-none">{{ settings?.siteName || 'Sense of Jewels' }}</span>
          </span>
        </NuxtLink>
        <div class="hidden md:flex items-center gap-8 text-xs font-medium tracking-widest uppercase text-base-content/70">
          <NuxtLink to="/shop" class="text-secondary">{{ t.nav.shop }}</NuxtLink>
          <NuxtLink to="/#collections" class="hover:text-secondary transition-colors">{{ t.nav.collections }}</NuxtLink>
          <NuxtLink to="/#about" class="hover:text-secondary transition-colors">{{ t.nav.about }}</NuxtLink>
          <NuxtLink to="/#contact" class="hover:text-secondary transition-colors">{{ t.nav.contact }}</NuxtLink>
        </div>
        <div class="flex items-center gap-2">
          <button @click="toggleLang" class="btn btn-xs btn-ghost font-medium tracking-widest text-base-content/50 hover:text-primary px-2">
            {{ lang === 'en' ? 'EN' : 'ID' }}
          </button>
          <span class="text-base-content/20 text-xs">|</span>
          <button @click="toggleCurrency" class="btn btn-xs btn-ghost font-medium tracking-widest text-base-content/50 hover:text-primary px-2">
            {{ currency }}
          </button>
          <NuxtLink to="/" class="btn btn-sm btn-outline btn-primary text-xs tracking-widest uppercase ml-2">
            {{ t.nav.backToHome }}
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- ===== PAGE HEADER ===== -->
    <div class="pt-16 bg-primary">
      <div class="max-w-6xl mx-auto px-6 py-16 text-center">
        <div class="flex items-center justify-center gap-3 mb-4">
          <div class="h-px w-8 bg-secondary/60" />
          <IconShoppingBag class="size-5 text-secondary" />
          <div class="h-px w-8 bg-secondary/60" />
        </div>
        <h1 class="font-serif text-4xl md:text-5xl text-base-100 font-light tracking-wide mb-3">
          {{ activeCollection ? activeCollection.name : t.shop.allJewelry }}
        </h1>
        <p class="text-base-100/50 font-light tracking-wide">
          {{ t.shop.pieces(filteredProducts.length) }}
        </p>
      </div>
    </div>

    <!-- ===== FILTERS ===== -->
    <div class="sticky top-16 z-30 bg-base-100 border-b border-base-200">
      <div class="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center gap-3">
        <!-- Search -->
        <div class="relative flex-1 min-w-48 max-w-xs">
          <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            v-model="search"
            type="text"
            :placeholder="t.shop.search"
            class="input input-sm w-full pl-8 text-xs"
          />
          <button v-if="search" @click="search = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content">
            <IconX class="size-3.5" />
          </button>
        </div>

        <!-- Collection filter pills -->
        <div class="flex items-center gap-2 flex-wrap">
          <button
            @click="selectedCollection = null"
            class="badge badge-sm cursor-pointer transition-all"
            :class="!selectedCollection ? 'badge-primary' : 'badge-ghost hover:badge-neutral'"
          >
            {{ t.shop.all }}
          </button>
          <button
            v-for="col in collections"
            :key="col.id"
            @click="selectedCollection = selectedCollection === col.id ? null : col.id"
            class="badge badge-sm cursor-pointer transition-all"
            :class="selectedCollection === col.id ? 'badge-secondary' : 'badge-ghost hover:badge-neutral'"
          >
            {{ col.name }}
          </button>
        </div>

        <!-- Sort -->
        <select v-model="sortBy" class="select select-sm text-xs ml-auto min-w-36">
          <option value="default">{{ t.shop.sortFeatured }}</option>
          <option value="price-asc">{{ t.shop.sortPriceLow }}</option>
          <option value="price-desc">{{ t.shop.sortPriceHigh }}</option>
        </select>
      </div>
    </div>

    <!-- ===== PRODUCT GRID ===== -->
    <div class="max-w-6xl mx-auto px-6 py-12">

      <!-- Empty state -->
      <div v-if="filteredProducts.length === 0" class="text-center py-24">
        <IconDiamond class="size-14 mx-auto mb-4 text-base-content/15" />
        <p class="font-serif text-lg text-base-content/40 font-light">{{ t.shop.notFound }}</p>
        <button v-if="search || selectedCollection" @click="search = ''; selectedCollection = null" class="btn btn-sm btn-ghost mt-4 text-xs tracking-widest uppercase">
          {{ t.shop.clearFilters }}
        </button>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        <div v-for="product in filteredProducts" :key="product.id" class="group cursor-pointer" @click="openProduct(product)">
          <!-- Image -->
          <div class="relative overflow-hidden bg-base-200 aspect-square mb-4 rounded-sm">
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 p-2"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <IconDiamond class="size-10 text-base-content/15" />
            </div>

            <!-- Featured badge -->
            <div v-if="product.isFeatured" class="absolute top-2 left-2">
              <span class="badge badge-xs badge-secondary text-primary font-medium tracking-wide">{{ t.shop.featured }}</span>
            </div>

            <!-- Quick view overlay -->
            <div class="absolute inset-0 bg-primary/40 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span class="text-base-100 text-xs tracking-widest uppercase font-medium border-b border-base-100/50 pb-0.5">{{ t.shop.viewDetails }}</span>
            </div>
          </div>

          <!-- Info -->
          <div>
            <span class="text-xs text-secondary tracking-widest uppercase font-medium">{{ product.collection.name }}</span>
            <h3 class="font-serif text-base text-primary font-light mt-0.5 leading-snug group-hover:text-secondary transition-colors">{{ product.name }}</h3>
            <p v-if="product.description" class="text-xs text-base-content/50 mt-1 line-clamp-2 font-light leading-relaxed">{{ product.description }}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="font-medium text-primary text-sm tracking-wide">{{ formatPrice(product.price) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== PRODUCT DETAIL MODAL ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedProduct" class="fixed inset-0 z-100 flex items-end md:items-center justify-center p-0 md:p-6" @click.self="closeProduct">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-primary/70 backdrop-blur-sm" @click="closeProduct" />

          <!-- Panel -->
          <div class="relative z-10 bg-base-100 w-full md:max-w-3xl md:rounded-sm shadow-2xl max-h-[95vh] flex flex-col md:flex-row overflow-hidden">

            <!-- Close -->
            <button @click="closeProduct" class="absolute right-4 top-4 z-20 btn btn-sm btn-circle btn-ghost">
              <IconX class="size-4" />
            </button>

            <!-- Gallery -->
            <div class="relative bg-base-200 md:w-1/2 aspect-square md:aspect-auto shrink-0">
              <img
                v-if="modalImages.length"
                :src="modalImages[galleryIndex]"
                :alt="selectedProduct.name"
                class="w-full h-full object-contain p-2"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <IconDiamond class="size-16 text-base-content/15" />
              </div>

              <!-- Gallery nav -->
              <template v-if="modalImages.length > 1">
                <button @click="prevImage" :disabled="galleryIndex === 0" class="absolute left-3 top-1/2 -translate-y-1/2 btn btn-sm btn-circle bg-base-100/80 border-0 disabled:opacity-20">
                  <IconChevronLeft class="size-4" />
                </button>
                <button @click="nextImage" :disabled="galleryIndex === modalImages.length - 1" class="absolute right-3 top-1/2 -translate-y-1/2 btn btn-sm btn-circle bg-base-100/80 border-0 disabled:opacity-20">
                  <IconChevronRight class="size-4" />
                </button>
                <!-- Dots -->
                <div class="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  <button
                    v-for="(_, i) in modalImages"
                    :key="i"
                    @click="galleryIndex = i"
                    class="size-1.5 rounded-full transition-all"
                    :class="i === galleryIndex ? 'bg-secondary scale-125' : 'bg-base-100/50'"
                  />
                </div>
              </template>
            </div>

            <!-- Info -->
            <div class="flex-1 overflow-y-auto p-8 flex flex-col">
              <div>
                <span class="text-xs text-secondary tracking-[0.25em] uppercase font-medium">{{ selectedProduct.collection.name }}</span>
                <h2 class="font-serif text-2xl text-primary font-light mt-2 leading-snug">{{ selectedProduct.name }}</h2>
                <div class="flex items-center gap-3 mt-3">
                  <span class="font-serif text-2xl text-primary">{{ formatPrice(selectedProduct.price) }}</span>
                  <span v-if="selectedProduct.isFeatured" class="badge badge-xs badge-secondary text-primary">{{ t.shop.featured }}</span>
                </div>
              </div>

              <p v-if="selectedProduct.description" class="text-base-content/60 font-light leading-relaxed text-sm mt-6 whitespace-pre-line">
                {{ selectedProduct.description }}
              </p>

              <!-- Phase 1: Inquiry CTA -->
              <div class="mt-auto pt-8 space-y-3">
                <p class="text-xs text-base-content/40 tracking-wide text-center uppercase">{{ t.shop.interested }}</p>

                <button
                  v-if="settings?.whatsappNumber"
                  @click="inquireWhatsApp(selectedProduct)"
                  class="btn btn-secondary text-primary w-full text-sm tracking-widest uppercase gap-2"
                >
                  <IconBrandWhatsapp class="size-4" />
                  {{ t.shop.whatsapp }}
                </button>

                <button
                  v-if="settings?.contactEmail"
                  @click="inquireEmail(selectedProduct)"
                  class="btn btn-outline btn-primary w-full text-sm tracking-widest uppercase gap-2"
                >
                  <IconMail class="size-4" />
                  {{ t.shop.emailInquiry }}
                </button>

                <p class="text-xs text-base-content/30 text-center pt-1 font-light">
                  {{ t.shop.comingSoon }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== FOOTER ===== -->
    <footer class="bg-primary py-12 mt-8">
      <div class="max-w-6xl mx-auto px-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <NuxtLink to="/" class="flex items-center gap-2">
            <img v-if="settings?.logoUrl" :src="settings.logoUrl" :alt="settings?.siteName || 'Sense of Jewels'" class="h-7 w-auto object-contain brightness-0 invert opacity-50" />
            <span v-else class="flex items-center gap-2 text-base-100/60 font-serif text-sm tracking-widest uppercase">
              <IconDiamond class="size-4 text-secondary/60" />
              {{ settings?.siteName || 'Sense of Jewels' }}
            </span>
          </NuxtLink>
          <p class="text-base-100/30 text-xs tracking-wide text-center">
            &copy; {{ new Date().getFullYear() }} {{ settings?.siteName || 'Sense of Jewels' }}. {{ t.footer.tagline }}
          </p>
          <NuxtLink to="/admin/login" class="text-base-100/20 hover:text-base-100/40 transition-colors text-xs tracking-widest uppercase">
            {{ t.footer.admin }}
          </NuxtLink>
        </div>
      </div>
    </footer>

  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active .relative.z-10,
.modal-leave-active .relative.z-10 {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative.z-10,
.modal-leave-to .relative.z-10 {
  transform: translateY(24px);
  opacity: 0;
}
</style>
