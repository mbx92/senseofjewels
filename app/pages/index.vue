<script setup lang="ts">
import {
  IconDiamond,
  IconStar,
  IconStarFilled,
  IconMapPin,
  IconMail,
  IconBrandInstagram,
  IconBrandFacebook,
  IconArrowDown,
  IconSparkles,
  IconLeaf,
  IconHeart,
} from '@tabler/icons-vue'

definePageMeta({ layout: false })

const { data: themeSettings } = await useFetch<Record<string, string>>('/api/settings')
useTheme(themeSettings)

interface Section {
  id: string
  slug: string
  title: string
  subtitle: string | null
  body: string | null
  image: string | null
  metadata: Record<string, string> | null
  isActive: boolean
}

interface Collection {
  id: string
  name: string
  description: string | null
  image: string | null
  isActive: boolean
}

interface Testimonial {
  id: string
  name: string
  role: string | null
  content: string
  rating: number
  avatar: string | null
  isActive: boolean
}

const { data: sectionsData } = await useFetch<Section[]>('/api/sections')
const { data: collectionsData } = await useFetch<Collection[]>('/api/collections')
const { data: testimonialsData } = await useFetch<Testimonial[]>('/api/testimonials')
const { data: settings } = await useFetch<Record<string, string>>('/api/settings')

const sections = computed(() => sectionsData.value?.filter(s => s.isActive) ?? [])
const collections = computed(() => collectionsData.value?.filter(c => c.isActive) ?? [])
const testimonials = computed(() => testimonialsData.value?.filter(t => t.isActive) ?? [])

const { lang, currency, t, formatPrice, toggleLang, toggleCurrency } = useLocale()
const plan = usePlan()
const requestURL = useRequestURL()

function getSection(slug: string) {
  return sections.value.find(s => s.slug === slug)
}

const hero = computed(() => getSection('hero'))
const about = computed(() => getSection('about'))
const sustainability = computed(() => getSection('sustainability'))
const contact = computed(() => getSection('contact'))
const testimonials_ = computed(() => getSection('testimonials'))

/** Get a metadata value from a section with a fallback string */
function meta(section: Section | undefined, key: string, fallback: string = ''): string {
  return section?.metadata?.[key] || fallback
}

useHead({
  htmlAttrs: { style: 'scroll-behavior: smooth;' },
  script: () => settings.value?.googleAnalyticsId ? [
    { src: `https://www.googletagmanager.com/gtag/js?id=${settings.value.googleAnalyticsId}`, async: true },
    { innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${settings.value.googleAnalyticsId}');` },
  ] : [],
})

useSeoMeta({
  title: () => settings.value?.siteName || 'Sense of Jewels',
  description: () => settings.value?.metaDescription || hero.value?.subtitle || settings.value?.siteTagline || 'Handcrafted Balinese jewelry inspired by the island\'s rich cultural heritage.',
  keywords: () => settings.value?.metaKeywords || '',
  ogTitle: () => settings.value?.siteName || 'Sense of Jewels',
  ogDescription: () => settings.value?.metaDescription || hero.value?.subtitle || settings.value?.siteTagline || 'Handcrafted Balinese jewelry inspired by the island\'s rich cultural heritage.',
  ogImage: () => settings.value?.ogImage || hero.value?.image || '',
  ogType: 'website',
  ogUrl: () => requestURL.origin,
  twitterCard: 'summary_large_image',
  twitterTitle: () => settings.value?.siteName || 'Sense of Jewels',
  twitterDescription: () => settings.value?.metaDescription || hero.value?.subtitle || settings.value?.siteTagline || 'Handcrafted Balinese jewelry.',
  twitterImage: () => settings.value?.ogImage || hero.value?.image || '',
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
            <span class="truncate max-w-36 sm:max-w-none">{{ settings?.siteName || 'Sense of Jewels' }}</span>
          </span>
        </NuxtLink>
        <div class="hidden md:flex items-center gap-8 text-xs font-medium tracking-widest uppercase text-base-content/70">
          <NuxtLink v-if="plan.hasFeature('shop')" to="/shop" class="hover:text-secondary transition-colors">{{ t.nav.shop }}</NuxtLink>
          <a href="#collections" class="hover:text-secondary transition-colors">{{ t.nav.collections }}</a>
          <a href="#about" class="hover:text-secondary transition-colors">{{ t.nav.about }}</a>
          <a href="#testimonials" class="hover:text-secondary transition-colors">{{ t.nav.reviews }}</a>
          <a href="#contact" class="hover:text-secondary transition-colors">{{ t.nav.contact }}</a>
        </div>
        <div class="flex items-center gap-2">
          <button @click="toggleLang" class="btn btn-xs btn-ghost font-medium tracking-widest text-base-content/50 hover:text-primary px-2">
            {{ lang === 'en' ? 'EN' : 'ID' }}
          </button>
          <span class="text-base-content/20 text-xs">|</span>
          <button @click="toggleCurrency" class="btn btn-xs btn-ghost font-medium tracking-widest text-base-content/50 hover:text-primary px-2">
            {{ currency }}
          </button>
          <NuxtLink v-if="plan.hasFeature('shop')" to="/shop" class="hidden md:inline-flex btn btn-sm btn-secondary text-primary text-xs tracking-widest uppercase ml-2">
            {{ t.nav.shopNow }}
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- ===== HERO ===== -->
    <section id="home" class="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      <div v-if="hero?.image" class="absolute inset-0">
        <img :src="hero.image" :alt="hero.title" class="w-full h-full object-cover opacity-30" />
      </div>
      <div v-else class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(25%_0.02_260)_0%,oklch(12%_0.01_260)_100%)]" />

      <!-- Decorative gold dots -->
      <div class="absolute top-32 left-12 size-1.5 rounded-full bg-secondary opacity-60" />
      <div class="absolute top-48 left-24 size-1 rounded-full bg-secondary opacity-40" />
      <div class="absolute bottom-32 right-16 size-2 rounded-full bg-secondary opacity-50" />
      <div class="absolute bottom-48 right-32 size-1 rounded-full bg-secondary opacity-30" />

      <div class="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <div class="flex items-center justify-center gap-3 mb-8">
          <div class="h-px w-12 bg-secondary/60" />
          <IconDiamond class="size-5 text-secondary" />
          <div class="h-px w-12 bg-secondary/60" />
        </div>
        <h1 class="font-serif text-5xl md:text-7xl text-base-100 font-light leading-tight tracking-wide mb-6">
          {{ hero?.title || t.hero.fallbackTitle }}
        </h1>
        <p class="text-base-100/70 text-lg md:text-xl font-light tracking-wide mb-10 leading-relaxed">
          {{ hero?.subtitle || t.hero.fallbackSubtitle }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a :href="meta(hero, 'ctaPrimaryLink', '#collections')" class="btn btn-secondary text-primary text-sm tracking-widest uppercase px-8">
            {{ meta(hero, 'ctaPrimaryText', t.hero.explore) }}
          </a>
          <a :href="meta(hero, 'ctaSecondaryLink', '#about')" class="btn btn-outline border-base-100/30 text-base-100 text-sm tracking-widest uppercase px-8 hover:bg-base-100/10">
            {{ meta(hero, 'ctaSecondaryText', t.hero.story) }}
          </a>
        </div>
        <a :href="meta(hero, 'ctaPrimaryLink', '#collections')" class="mt-16 inline-flex flex-col items-center gap-2 text-base-100/40 hover:text-secondary transition-colors text-xs tracking-widest uppercase">
          <span>{{ meta(hero, 'scrollText', t.hero.scroll) }}</span>
          <IconArrowDown class="size-4 animate-bounce" />
        </a>
      </div>
    </section>

    <!-- ===== COLLECTIONS ===== -->
    <section id="collections" class="py-24 bg-base-100 scroll-mt-16">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-16">
          <div class="flex items-center justify-center gap-3 mb-4">
            <div class="h-px w-8 bg-secondary/50" />
            <span class="text-secondary text-xs font-medium tracking-[0.3em] uppercase">{{ meta(getSection('collections'), 'badgeLabel', t.sections.ourCraft) }}</span>
            <div class="h-px w-8 bg-secondary/50" />
          </div>
          <h2 class="font-serif text-4xl md:text-5xl text-primary font-light tracking-wide">
            {{ getSection('collections')?.title || t.sections.collectionsFallback }}
          </h2>
          <p v-if="getSection('collections')?.subtitle" class="mt-4 text-base-content/60 text-lg font-light max-w-xl mx-auto">
            {{ getSection('collections')?.subtitle }}
          </p>
        </div>

        <div v-if="collections.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="col in collections"
            :key="col.id"
            class="group cursor-pointer"
          >
            <div class="relative overflow-hidden rounded-sm aspect-3/4 bg-base-200 mb-4">
              <img
                v-if="col.image"
                :src="col.image"
                :alt="col.name"
                class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 p-2"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <IconDiamond class="size-12 text-base-content/20" />
              </div>
              <div class="absolute inset-0 bg-linear-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div class="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                <span class="text-base-100 text-xs tracking-widest uppercase font-medium">{{ meta(getSection('collections'), 'viewText', t.sections.viewCollection) }}</span>
              </div>
            </div>
            <h3 class="font-serif text-xl text-primary font-light tracking-wide">{{ col.name }}</h3>
            <p v-if="col.description" class="text-base-content/50 text-sm mt-1 font-light leading-relaxed">{{ col.description }}</p>
          </div>
        </div>
        <div v-else class="text-center py-16 text-base-content/40">
          <IconDiamond class="size-12 mx-auto mb-4 opacity-30" />
          <p class="font-light">{{ meta(getSection('collections'), 'emptySoonText', t.sections.collectionsSoon) }}</p>
        </div>
      </div>
    </section>

    <!-- ===== ABOUT ===== -->
    <section id="about" class="py-24 bg-base-200/40 scroll-mt-16">
      <div class="max-w-6xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div class="relative">
            <div v-if="about?.image" class="relative">
              <img :src="about.image" :alt="about.title" class="rounded-sm w-full object-cover aspect-square" />
              <div class="absolute -bottom-4 -right-4 size-24 border border-secondary/30 rounded-sm" />
            </div>
            <div v-else class="aspect-square bg-primary/5 rounded-sm flex items-center justify-center border border-base-300">
              <IconHeart class="size-20 text-secondary/30" />
            </div>
          </div>
          <div>
            <div class="flex items-center gap-3 mb-6">
              <div class="h-px w-8 bg-secondary/50" />
              <span class="text-secondary text-xs font-medium tracking-[0.3em] uppercase">{{ meta(about, 'badgeLabel', t.sections.ourStory) }}</span>
            </div>
            <h2 class="font-serif text-4xl text-primary font-light leading-tight tracking-wide mb-6">
              {{ about?.title || t.about.fallbackTitle }}
            </h2>
            <p v-if="about?.subtitle" class="text-base-content/60 text-lg font-light mb-6 leading-relaxed">
              {{ about.subtitle }}
            </p>
            <p v-if="about?.body" class="text-base-content/70 font-light leading-relaxed whitespace-pre-line">
              {{ about.body }}
            </p>
            <p v-else class="text-base-content/70 font-light leading-relaxed">
              {{ t.about.fallbackBody }}
            </p>
            <div class="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-base-300">
              <div class="text-center">
                <div class="font-serif text-3xl text-primary font-light">{{ meta(about, 'stat1Value', '15+') }}</div>
                <div class="text-xs text-base-content/50 tracking-widest uppercase mt-1">{{ meta(about, 'stat1Label', t.about.yearsCraft) }}</div>
              </div>
              <div class="text-center border-x border-base-300">
                <div class="font-serif text-3xl text-primary font-light">{{ meta(about, 'stat2Value', '500+') }}</div>
                <div class="text-xs text-base-content/50 tracking-widest uppercase mt-1">{{ meta(about, 'stat2Label', t.about.uniqueDesigns) }}</div>
              </div>
              <div class="text-center">
                <div class="font-serif text-3xl text-primary font-light">{{ meta(about, 'stat3Value', '50+') }}</div>
                <div class="text-xs text-base-content/50 tracking-widest uppercase mt-1">{{ meta(about, 'stat3Label', t.about.countries) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== SUSTAINABILITY ===== -->
    <section class="py-24 bg-primary text-base-100">
      <div class="max-w-6xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div class="flex items-center gap-3 mb-6">
              <div class="h-px w-8 bg-secondary/60" />
              <span class="text-secondary text-xs font-medium tracking-[0.3em] uppercase">{{ meta(sustainability, 'badgeLabel', t.sections.ourValues) }}</span>
            </div>
            <h2 class="font-serif text-4xl text-base-100 font-light leading-tight tracking-wide mb-6">
              {{ sustainability?.title || t.sustainability.fallbackTitle }}
            </h2>
            <p v-if="sustainability?.subtitle" class="text-base-100/70 text-lg font-light mb-6 leading-relaxed">
              {{ sustainability.subtitle }}
            </p>
            <p v-if="sustainability?.body" class="text-base-100/60 font-light leading-relaxed whitespace-pre-line">
              {{ sustainability.body }}
            </p>
            <p v-else class="text-base-100/60 font-light leading-relaxed">
              {{ t.sustainability.fallbackBody }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div class="p-6 border border-base-100/10 rounded-sm hover:border-secondary/30 transition-colors">
              <IconLeaf class="size-8 text-secondary mb-4" />
              <h3 class="font-serif text-lg text-base-100 font-light mb-2">{{ meta(sustainability, 'feature1Title', t.sustainability.ecoTitle) }}</h3>
              <p class="text-base-100/50 text-sm font-light leading-relaxed">{{ meta(sustainability, 'feature1Body', t.sustainability.ecoDesc) }}</p>
            </div>
            <div class="p-6 border border-base-100/10 rounded-sm hover:border-secondary/30 transition-colors">
              <IconHeart class="size-8 text-secondary mb-4" />
              <h3 class="font-serif text-lg text-base-100 font-light mb-2">{{ meta(sustainability, 'feature2Title', t.sustainability.fairTitle) }}</h3>
              <p class="text-base-100/50 text-sm font-light leading-relaxed">{{ meta(sustainability, 'feature2Body', t.sustainability.fairDesc) }}</p>
            </div>
            <div class="p-6 border border-base-100/10 rounded-sm hover:border-secondary/30 transition-colors">
              <IconDiamond class="size-8 text-secondary mb-4" />
              <h3 class="font-serif text-lg text-base-100 font-light mb-2">{{ meta(sustainability, 'feature3Title', t.sustainability.ethTitle) }}</h3>
              <p class="text-base-100/50 text-sm font-light leading-relaxed">{{ meta(sustainability, 'feature3Body', t.sustainability.ethDesc) }}</p>
            </div>
            <div class="p-6 border border-base-100/10 rounded-sm hover:border-secondary/30 transition-colors">
              <IconSparkles class="size-8 text-secondary mb-4" />
              <h3 class="font-serif text-lg text-base-100 font-light mb-2">{{ meta(sustainability, 'feature4Title', t.sustainability.handTitle) }}</h3>
              <p class="text-base-100/50 text-sm font-light leading-relaxed">{{ meta(sustainability, 'feature4Body', t.sustainability.handDesc) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== TESTIMONIALS ===== -->
    <section id="testimonials" class="py-24 bg-base-100 scroll-mt-16">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-16">
          <div class="flex items-center justify-center gap-3 mb-4">
            <div class="h-px w-8 bg-secondary/50" />
            <span class="text-secondary text-xs font-medium tracking-[0.3em] uppercase">{{ meta(testimonials_, 'badgeLabel', t.sections.lovedByMany) }}</span>
            <div class="h-px w-8 bg-secondary/50" />
          </div>
          <h2 class="font-serif text-4xl md:text-5xl text-primary font-light tracking-wide">
            {{ testimonials_?.title || t.sections.testimonialsFallback }}
          </h2>
        </div>

        <div v-if="testimonials.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="item in testimonials"
            :key="item.id"
            class="p-8 border border-base-300 rounded-sm hover:border-secondary/40 transition-colors"
          >
            <div class="flex gap-0.5 mb-6">
              <component
                :is="i <= item.rating ? IconStarFilled : IconStar"
                v-for="i in 5"
                :key="i"
                class="size-4"
                :class="i <= item.rating ? 'text-secondary' : 'text-base-content/20'"
              />
            </div>
            <p class="text-base-content/70 font-light leading-relaxed italic mb-6">"{{ item.content }}"</p>
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-full overflow-hidden bg-base-200 shrink-0">
                <img v-if="item.avatar" :src="item.avatar" :alt="item.name" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-base-content/30 text-sm font-medium">
                  {{ item.name.charAt(0) }}
                </div>
              </div>
              <div>
                <div class="font-medium text-primary text-sm">{{ item.name }}</div>
                <div v-if="item.role" class="text-xs text-base-content/50 tracking-wide">{{ item.role }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16 text-base-content/40">
          <IconStarFilled class="size-10 mx-auto mb-4 opacity-20" />
          <p class="font-light">{{ meta(testimonials_, 'emptySoonText', t.sections.reviewsSoon) }}</p>
        </div>
      </div>
    </section>

    <!-- ===== CONTACT ===== -->
    <section id="contact" class="py-24 bg-base-200/40 scroll-mt-16">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-16">
          <div class="flex items-center justify-center gap-3 mb-4">
            <div class="h-px w-8 bg-secondary/50" />
            <span class="text-secondary text-xs font-medium tracking-[0.3em] uppercase">{{ meta(contact, 'badgeLabel', t.sections.getInTouch) }}</span>
            <div class="h-px w-8 bg-secondary/50" />
          </div>
          <h2 class="font-serif text-4xl md:text-5xl text-primary font-light tracking-wide">
            {{ contact?.title || t.sections.studioFallback }}
          </h2>
          <p v-if="contact?.subtitle" class="mt-4 text-base-content/60 text-lg font-light max-w-xl mx-auto">
            {{ contact.subtitle }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div v-if="settings?.address" class="text-center p-6">
            <div class="size-12 rounded-full border border-secondary/30 flex items-center justify-center mx-auto mb-4">
              <IconMapPin class="size-5 text-secondary" />
            </div>
            <h3 class="font-medium text-primary text-sm tracking-widest uppercase mb-2">{{ meta(contact, 'locationLabel', t.contact.location) }}</h3>
            <p class="text-base-content/60 text-sm font-light leading-relaxed">{{ settings?.address }}</p>
          </div>
          <div v-if="settings?.contactEmail" class="text-center p-6">
            <div class="size-12 rounded-full border border-secondary/30 flex items-center justify-center mx-auto mb-4">
              <IconMail class="size-5 text-secondary" />
            </div>
            <h3 class="font-medium text-primary text-sm tracking-widest uppercase mb-2">{{ meta(contact, 'emailLabel', t.contact.email) }}</h3>
            <a :href="`mailto:${settings?.contactEmail}`" class="text-base-content/60 text-sm font-light hover:text-secondary transition-colors">
              {{ settings?.contactEmail }}
            </a>
          </div>
          <div v-if="settings?.instagramUrl || settings?.facebookUrl" class="text-center p-6">
            <div class="size-12 rounded-full border border-secondary/30 flex items-center justify-center mx-auto mb-4">
              <IconBrandInstagram class="size-5 text-secondary" />
            </div>
            <h3 class="font-medium text-primary text-sm tracking-widest uppercase mb-2">{{ meta(contact, 'socialLabel', t.contact.followUs) }}</h3>
            <div class="flex items-center justify-center gap-4 mt-2">
              <a v-if="settings?.instagramUrl" :href="settings.instagramUrl" target="_blank" rel="noopener" class="text-base-content/40 hover:text-secondary transition-colors">
                <IconBrandInstagram class="size-5" />
              </a>
              <a v-if="settings?.facebookUrl" :href="settings.facebookUrl" target="_blank" rel="noopener" class="text-base-content/40 hover:text-secondary transition-colors">
                <IconBrandFacebook class="size-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FOOTER ===== -->
    <footer class="bg-primary py-12">
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
