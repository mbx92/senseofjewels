<template>
  <div>
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-base-content">Settings</h1>
        <p class="text-sm text-base-content/50 mt-1">Global site settings for the landing page</p>
      </div>
    </div>

    <form @submit.prevent="save()">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        <!-- Left column: Site Info -->
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <h2 class="font-semibold text-sm uppercase tracking-wide text-base-content/50 mb-2">Site Info</h2>

            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Site Name</legend>
              <input v-model="form.siteName" type="text" class="input w-full" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Site Tagline</legend>
              <input v-model="form.siteTagline" type="text" class="input w-full" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Site URL</legend>
              <input v-model="form.siteUrl" type="url" class="input w-full font-mono" placeholder="https://senseofjewels.com" />
              <p class="label text-xs text-base-content/40">Used for sitemap.xml and Open Graph URLs</p>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Logo</legend>
              <!-- Preview -->
              <div v-if="form.logoUrl" class="mb-2 p-2 bg-base-200 rounded flex items-center gap-3">
                <img :src="form.logoUrl" class="h-10 w-auto max-w-30 object-contain" alt="logo preview" />
                <button type="button" class="btn btn-xs btn-ghost text-error ml-auto" @click="form.logoUrl = ''">Remove</button>
              </div>
              <button type="button" class="btn btn-sm btn-outline w-full mb-2" @click="openLogoPicker">
                <IconPhoto class="w-4 h-4" /> Browse Media
              </button>
              <input v-model="form.logoUrl" type="text" class="input input-sm w-full font-mono" placeholder="Or paste URL..." />
            </fieldset>

            <div class="divider text-xs font-semibold uppercase tracking-wide text-base-content/40 my-2">Contact</div>

            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Email</legend>
              <input v-model="form.contactEmail" type="email" class="input w-full" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Phone</legend>
              <input v-model="form.contactPhone" type="text" class="input w-full" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Address</legend>
              <textarea v-model="form.address" class="textarea w-full" rows="2"></textarea>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Instagram URL</legend>
              <input v-model="form.instagramUrl" type="url" class="input w-full" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">WhatsApp Number</legend>
              <input v-model="form.whatsappNumber" type="text" class="input w-full" />
            </fieldset>

            <div class="rounded border border-base-300 bg-base-200/50 px-4 py-3 text-sm mt-2">
              <p class="font-semibold text-xs uppercase tracking-wide text-base-content/50 mb-1">USD → IDR Exchange Rate</p>
              <p class="text-base-content">
                <span v-if="liveRate">1 USD = <strong>{{ liveRate.IDR.toLocaleString('id-ID') }}</strong> IDR
                  <span class="badge badge-xs ml-2" :class="liveRate.source === 'live' ? 'badge-success' : 'badge-warning'">
                    {{ liveRate.source === 'live' ? 'Live' : 'Fallback' }}
                  </span>
                </span>
                <span v-else class="text-base-content/40">Loading...</span>
              </p>
              <p class="text-xs text-base-content/40 mt-1">Auto-fetched from open.er-api.com · cached 1 hour</p>
            </div>
          </div>
        </div>

        <!-- Right column: Color Theme -->
        <div v-if="plan.hasFeature('theme')" class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <h2 class="font-semibold text-sm uppercase tracking-wide text-base-content/50 mb-2">Color Theme</h2>

            <div class="flex flex-col gap-3">
              <fieldset class="fieldset">
                <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Primary</legend>
                <div class="flex gap-2 items-center">
                  <input type="color" v-model="form.colorPrimary" class="w-10 h-10 rounded cursor-pointer border border-base-300 p-0.5" />
                  <input type="text" v-model="form.colorPrimary" class="input input-sm flex-1 font-mono" />
                </div>
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Primary Content</legend>
                <div class="flex gap-2 items-center">
                  <input type="color" v-model="form.colorPrimaryContent" class="w-10 h-10 rounded cursor-pointer border border-base-300 p-0.5" />
                  <input type="text" v-model="form.colorPrimaryContent" class="input input-sm flex-1 font-mono" />
                </div>
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Secondary</legend>
                <div class="flex gap-2 items-center">
                  <input type="color" v-model="form.colorSecondary" class="w-10 h-10 rounded cursor-pointer border border-base-300 p-0.5" />
                  <input type="text" v-model="form.colorSecondary" class="input input-sm flex-1 font-mono" />
                </div>
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Accent</legend>
                <div class="flex gap-2 items-center">
                  <input type="color" v-model="form.colorAccent" class="w-10 h-10 rounded cursor-pointer border border-base-300 p-0.5" />
                  <input type="text" v-model="form.colorAccent" class="input input-sm flex-1 font-mono" />
                </div>
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Base (Background)</legend>
                <div class="flex gap-2 items-center">
                  <input type="color" v-model="form.colorBase100" class="w-10 h-10 rounded cursor-pointer border border-base-300 p-0.5" />
                  <input type="text" v-model="form.colorBase100" class="input input-sm flex-1 font-mono" />
                </div>
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Text Color</legend>
                <div class="flex gap-2 items-center">
                  <input type="color" v-model="form.colorBaseContent" class="w-10 h-10 rounded cursor-pointer border border-base-300 p-0.5" />
                  <input type="text" v-model="form.colorBaseContent" class="input input-sm flex-1 font-mono" />
                </div>
              </fieldset>
            </div>

            <!-- Live preview strip -->
            <div class="flex gap-1.5 mt-4 rounded-lg overflow-hidden h-8">
              <div class="flex-1" :style="{ background: form.colorPrimary }"></div>
              <div class="flex-1" :style="{ background: form.colorSecondary }"></div>
              <div class="flex-1" :style="{ background: form.colorAccent }"></div>
              <div class="flex-1 border border-base-300" :style="{ background: form.colorBase100 }"></div>
            </div>
            <p class="text-xs text-base-content/40 mt-1">Colors update on page reload after save</p>

            <div class="divider text-xs font-semibold uppercase tracking-wide text-base-content/40 my-2">Typography</div>

            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Heading Font</legend>
              <select v-model="form.fontHeading" class="select select-sm w-full">
                <option v-for="f in FONT_OPTIONS" :key="f.value" :value="f.value">{{ f.label }}</option>
              </select>
              <p class="mt-2 text-lg text-base-content/70 italic" :style="form.fontHeading ? { fontFamily: `'${form.fontHeading}', serif` } : {}">
                Elegant Handcrafted Jewelry from Bali
              </p>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Body Font</legend>
              <select v-model="form.fontBody" class="select select-sm w-full">
                <option v-for="f in FONT_OPTIONS" :key="f.value" :value="f.value">{{ f.label }}</option>
              </select>
              <p class="mt-2 text-sm text-base-content/70" :style="form.fontBody ? { fontFamily: `'${form.fontBody}', sans-serif` } : {}">
                Discover timeless Balinese jewelry, crafted by hand with purpose.
              </p>
            </fieldset>
            <p class="text-xs text-base-content/40">Fonts take effect on page reload after save</p>
          </div>
        </div>
      </div>

      <!-- SEO Card (full width below) -->
      <div v-if="plan.hasFeature('seo')" class="card bg-base-100 border border-base-300 mt-6">
        <div class="card-body">
          <h2 class="font-semibold text-sm uppercase tracking-wide text-base-content/50 mb-2">SEO &amp; Social Sharing</h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="flex flex-col gap-3">
              <fieldset class="fieldset">
                <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Meta Description</legend>
                <textarea v-model="form.metaDescription" class="textarea w-full" rows="3" placeholder="Short description shown in Google search results (max 160 chars)"></textarea>
                <p class="label text-xs" :class="(form.metaDescription?.length ?? 0) > 160 ? 'text-error' : 'text-base-content/40'">
                  {{ form.metaDescription?.length ?? 0 }}/160 chars
                </p>
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Meta Keywords</legend>
                <input v-model="form.metaKeywords" type="text" class="input w-full" placeholder="handcrafted jewelry, bali, necklace, earrings" />
                <p class="label text-xs text-base-content/40">Comma-separated (minor ranking signal)</p>
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Google Analytics ID</legend>
                <input v-model="form.googleAnalyticsId" type="text" class="input w-full font-mono" placeholder="G-XXXXXXXXXX" />
                <p class="label text-xs text-base-content/40">Paste your GA4 Measurement ID</p>
              </fieldset>
            </div>

            <div class="flex flex-col gap-3">
              <fieldset class="fieldset">
                <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Default OG / Social Share Image</legend>
                <p class="text-xs text-base-content/40 mb-2">Shown when link is shared on WhatsApp, Instagram, Facebook (recommended: 1200×630px)</p>
                <div v-if="form.ogImage" class="mb-2 relative group aspect-1200/630 w-full rounded overflow-hidden bg-base-200">
                  <img :src="form.ogImage" class="w-full h-full object-contain p-1" alt="OG preview" />
                  <button type="button" class="absolute top-1 right-1 btn btn-xs btn-error opacity-0 group-hover:opacity-100" @click="form.ogImage = ''">Remove</button>
                </div>
                <div class="flex gap-2">
                  <input v-model="form.ogImage" type="text" class="input input-sm flex-1 font-mono" placeholder="Paste URL or pick from media..." />
                  <button type="button" class="btn btn-sm btn-outline shrink-0" @click="ogPickerOpen = true">
                    <IconPhoto class="w-4 h-4" />
                  </button>
                </div>
              </fieldset>

              <!-- OG preview box -->
              <div v-if="form.ogImage || form.siteName" class="rounded-lg border border-base-300 overflow-hidden text-sm">
                <div class="aspect-1200/630 bg-base-200">
                  <img v-if="form.ogImage" :src="form.ogImage" class="w-full h-full object-contain" />
                  <div v-else class="w-full h-full flex items-center justify-center text-base-content/20 text-xs">No image</div>
                </div>
                <div class="p-2 bg-base-100 border-t border-base-300">
                  <p class="font-semibold text-xs text-secondary truncate">{{ form.siteUrl || 'senseofjewels.com' }}</p>
                  <p class="font-bold text-sm text-primary truncate">{{ form.siteName || 'Sense of Jewels' }}</p>
                  <p class="text-xs text-base-content/50 line-clamp-2">{{ form.metaDescription || form.siteTagline || 'Handcrafted Balinese jewelry.' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save button -->
      <div class="mt-5">
        <button type="submit" class="btn btn-primary btn-sm" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </form>

    <!-- Shipping Configuration (featureCart only) -->
    <div v-if="plan.hasFeature('cart')" class="card bg-base-100 border border-base-300 mt-6">
      <div class="card-body">
        <h2 class="font-semibold text-sm uppercase tracking-wide text-base-content/50 mb-1">Shipping Configuration</h2>
        <p class="text-xs text-base-content/40 mb-4">Configure RajaOngkir shipping. Requires <code class="badge badge-xs">NUXT_RAJAONGKIR_API_KEY</code> environment variable.</p>

        <!-- Origin City -->
        <fieldset class="fieldset">
          <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Origin City (Warehouse / Store)</legend>
          <div class="relative">
            <input
              v-model="originCitySearch"
              @input="onOriginCitySearch"
              type="text"
              placeholder="Type city name to search..."
              class="input input-sm w-full"
              autocomplete="off"
            />
            <div v-if="originCityResults.length" class="absolute top-full left-0 right-0 z-50 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              <button
                v-for="city in originCityResults"
                :key="city.id"
                type="button"
                @click="selectOriginCity(city)"
                class="w-full text-left px-3 py-2 text-sm hover:bg-base-200 transition-colors border-b border-base-200 last:border-0"
              >
                {{ city.label }}
              </button>
            </div>
          </div>
          <p v-if="form.shippingOriginCityName" class="label text-xs text-success font-medium mt-1">
            &#10003; {{ form.shippingOriginCityName }} (ID: {{ form.shippingOriginCityId }})
          </p>
          <p v-else class="label text-xs text-base-content/40">No origin city set — shipping costs won't be calculated</p>
        </fieldset>

        <!-- Available Couriers -->
        <fieldset class="fieldset mt-2">
          <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Available Couriers</legend>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
            <label
              v-for="c in COURIER_LIST"
              :key="c.code"
              class="flex items-center gap-2 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                :checked="activeCouriers.includes(c.code)"
                @change="toggleCourier(c.code)"
                class="checkbox checkbox-sm checkbox-primary"
              />
              <span class="text-sm">{{ c.name }}</span>
              <span v-if="c.pro" class="badge badge-xs badge-ghost">Pro</span>
            </label>
          </div>
          <p class="label text-xs text-base-content/40 mt-1">Starter plan supports: JNE, TIKI, Pos Indonesia only</p>
        </fieldset>

        <!-- Default Weight -->
        <fieldset class="fieldset mt-2">
          <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Default Weight per Item (grams)</legend>
          <input v-model="form.shippingDefaultWeight" type="number" min="1" max="30000" class="input input-sm w-40" />
          <p class="label text-xs text-base-content/40">Used to calculate shipping cost. Total = qty &times; this value.</p>
        </fieldset>

        <div class="mt-4">
          <button type="button" class="btn btn-primary btn-sm" :disabled="savingShipping" @click="saveShipping">
            {{ savingShipping ? 'Saving...' : 'Save Shipping Settings' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Features Card (superadmin only) -->
    <div v-if="auth.isSuperAdmin.value" class="card bg-base-100 border border-secondary/40 mt-6">
      <div class="card-body">
        <div class="flex items-center gap-2 mb-1">
          <IconShieldCog class="w-5 h-5 text-secondary" />
          <h2 class="font-semibold text-sm uppercase tracking-wide text-base-content/50">Feature Management</h2>
          <span class="badge badge-soft badge-secondary text-xs ml-auto">Superadmin Only</span>
        </div>
        <p class="text-xs text-base-content/40 mb-4">Enable or disable premium features for this installation. In the future this will be controlled by a license key.</p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div v-for="(feat, key) in FEATURES" :key="key"
            class="flex items-start gap-3 p-4 rounded-lg border"
            :class="form[feat.key] === 'true' ? 'border-success/40 bg-success/5' : 'border-base-300 bg-base-200/50'"
          >
            <input type="checkbox"
              :checked="form[feat.key] === 'true'"
              @change="form[feat.key] = ($event.target as HTMLInputElement).checked ? 'true' : 'false'"
              class="checkbox checkbox-success checkbox-sm mt-0.5 shrink-0"
            />
            <div>
              <p class="text-sm font-semibold text-base-content">{{ feat.label }}</p>
              <p class="text-xs text-base-content/50 mt-0.5">{{ feat.description }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <button type="button" class="btn btn-secondary btn-sm" :disabled="savingFeatures" @click="saveFeatures">
            {{ savingFeatures ? 'Saving...' : 'Save Features' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Database Backup Card -->
    <div class="card bg-base-100 border border-base-300 mt-6">
      <div class="card-body">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <IconDatabase class="w-5 h-5 text-base-content/60" />
            <h2 class="font-semibold text-sm uppercase tracking-wide text-base-content/50">Database Backup</h2>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="creatingBackup"
            @click="triggerBackup"
          >
            <span v-if="creatingBackup" class="loading loading-spinner loading-xs"></span>
            <IconDatabaseExport v-else class="w-4 h-4" />
            {{ creatingBackup ? 'Creating...' : 'Backup Now' }}
          </button>
        </div>
        <p class="text-xs text-base-content/40 mb-4">Auto backup berjalan setiap hari pukul 23:00. Maksimal 7 file backup tersimpan.</p>

        <div v-if="backupsLoading" class="text-center py-6">
          <span class="loading loading-spinner loading-sm"></span>
        </div>

        <div v-else-if="!backups.length" class="flex flex-col items-center py-8 text-base-content/30">
          <IconDatabase class="w-10 h-10 mb-2" />
          <p class="text-sm">Belum ada backup. Klik <strong>Backup Now</strong> untuk membuat backup pertama.</p>
        </div>

        <div v-else class="flex flex-col gap-2">
          <div
            v-for="backup in backups"
            :key="backup.filename"
            class="flex items-center gap-3 p-3 rounded-lg border border-base-200 hover:bg-base-200/50 transition-colors"
          >
            <IconFileTypeJs class="w-5 h-5 text-secondary shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-mono truncate text-base-content">{{ backup.filename }}</p>
              <p class="text-xs text-base-content/40 mt-0.5">{{ formatBackupDate(backup.createdAt) }} · {{ formatBackupSize(backup.size) }}</p>
            </div>
            <a
              :href="`/api/backup/${backup.filename}`"
              class="btn btn-sm btn-ghost"
              title="Download backup"
            >
              <IconDownload class="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Logo Media Picker Modal -->
    <dialog class="modal" :open="showLogoPicker">
      <div class="modal-box max-w-3xl">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3" @click="showLogoPicker = false">
          <IconX class="w-4 h-4" />
        </button>
        <h3 class="font-bold text-lg mb-4">Pick Logo from Media</h3>
        <div v-if="!mediaData?.media?.length" class="text-center py-8 text-base-content/40">
          No media uploaded yet. Upload images via the Media page first.
        </div>
        <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          <button
            v-for="m in mediaData.media"
            :key="m.id"
            type="button"
            class="relative group aspect-square bg-base-200 rounded-lg overflow-hidden border-2 hover:border-primary transition-colors"
            :class="form.logoUrl === m.url ? 'border-primary' : 'border-transparent'"
            @click="pickLogo(m.url)"
          >
            <img :src="m.url" :alt="m.filename" class="w-full h-full object-cover" />
            <div v-if="form.logoUrl === m.url" class="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <span class="badge badge-primary badge-sm">Selected</span>
            </div>
          </button>
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost btn-sm" @click="showLogoPicker = false">Cancel</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="showLogoPicker = false"><button>close</button></form>
    </dialog>

    <MediaPickerModal :open="ogPickerOpen" :selected="form.ogImage" @close="ogPickerOpen = false" @pick="url => form.ogImage = url" />
  </div>
</template>

<script setup lang="ts">
import { IconPhoto, IconX, IconLock, IconShieldCog, IconDatabase, IconDatabaseExport, IconDownload, IconFileTypeJs } from '@tabler/icons-vue'
import { THEME_DEFAULTS, FONT_OPTIONS } from '~/composables/useTheme'
import { FEATURES } from '~/composables/usePlan'
import type { Media, CityOption } from '~/types'

const COURIER_LIST = [
  { code: 'jne', name: 'JNE', pro: false },
  { code: 'tiki', name: 'TIKI', pro: false },
  { code: 'pos', name: 'Pos Indonesia', pro: false },
  { code: 'jnt', name: 'J&T Express', pro: true },
  { code: 'sicepat', name: 'SiCepat', pro: true },
  { code: 'anteraja', name: 'AnterAja', pro: true },
  { code: 'wahana', name: 'Wahana', pro: true },
  { code: 'lion', name: 'Lion Parcel', pro: true },
  { code: 'ninja', name: 'Ninja Xpress', pro: true },
]

const auth = useAuth()
const plan = usePlan()

// Origin city search for shipping
const originCitySearch = ref('')
const originCityResults = ref<CityOption[]>([])
let originCityTimer: ReturnType<typeof setTimeout> | null = null

async function onOriginCitySearch() {
  if (originCityTimer) clearTimeout(originCityTimer)
  const q = originCitySearch.value.trim()
  if (q.length < 2) { originCityResults.value = []; return }
  originCityTimer = setTimeout(async () => {
    originCityResults.value = await $fetch<CityOption[]>(`/api/shipping/cities?q=${encodeURIComponent(q)}`).catch(() => [])
  }, 350)
}

function selectOriginCity(city: CityOption) {
  form.value.shippingOriginCityId = city.id
  form.value.shippingOriginCityName = city.label
  originCitySearch.value = city.label
  originCityResults.value = []
}

const activeCouriers = computed<string[]>({
  get: () => (form.value.shippingCouriers || '').split(',').map(s => s.trim()).filter(Boolean),
  set: (val) => { form.value.shippingCouriers = val.join(',') },
})

function toggleCourier(code: string) {
  const list = activeCouriers.value
  activeCouriers.value = list.includes(code) ? list.filter(c => c !== code) : [...list, code]
}

const savingShipping = ref(false)
async function saveShipping() {
  savingShipping.value = true
  try {
    await $fetch('/api/settings', {
      method: 'PUT',
      body: {
        shippingOriginCityId: form.value.shippingOriginCityId,
        shippingOriginCityName: form.value.shippingOriginCityName,
        shippingCouriers: form.value.shippingCouriers,
        shippingDefaultWeight: form.value.shippingDefaultWeight,
      },
    })
  }
  finally { savingShipping.value = false }
}

interface MediaResponse { media: Media[]; folders: string[] }

const showLogoPicker = ref(false)
const ogPickerOpen = ref(false)
const { data: mediaData, execute: loadMedia } = useFetch<MediaResponse>('/api/media', { immediate: false })

async function openLogoPicker() {
  await loadMedia()
  showLogoPicker.value = true
}

function pickLogo(url: string) {
  form.value.logoUrl = url
  showLogoPicker.value = false
}

const { data: settings } = useFetch<Record<string, string>>('/api/settings')
const { data: liveRate } = useFetch<{ IDR: number; source: string }>('/api/exchange-rate')
const saving = ref(false)
const savingFeatures = ref(false)

async function saveFeatures() {
  savingFeatures.value = true
  try {
    await $fetch('/api/settings', {
      method: 'PUT',
      body: {
        featureShop: form.value.featureShop,
        featureCart: form.value.featureCart,
        featureSeo: form.value.featureSeo,
        featureTheme: form.value.featureTheme,
      },
    })
  } finally {
    savingFeatures.value = false
  }
}

useTheme(settings)

const form = ref({
  siteName: '',
  siteTagline: '',
  siteUrl: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  instagramUrl: '',
  whatsappNumber: '',
  logoUrl: '',
  colorPrimary: THEME_DEFAULTS.colorPrimary,
  colorPrimaryContent: THEME_DEFAULTS.colorPrimaryContent,
  colorSecondary: THEME_DEFAULTS.colorSecondary,
  colorAccent: THEME_DEFAULTS.colorAccent,
  colorBase100: THEME_DEFAULTS.colorBase100,
  colorBaseContent: THEME_DEFAULTS.colorBaseContent,
  fontHeading: THEME_DEFAULTS.fontHeading,
  fontBody: THEME_DEFAULTS.fontBody,
  metaDescription: '',
  metaKeywords: '',
  ogImage: '',
  googleAnalyticsId: '',
  // Feature flags
  featureShop: 'false',
  featureCart: 'false',
  featureSeo: 'false',
  featureTheme: 'false',
  // Shipping
  shippingOriginCityId: '',
  shippingOriginCityName: '',
  shippingCouriers: 'jne,tiki,pos',
  shippingDefaultWeight: '500',
} as Record<string, string>)

// Load selected fonts in the admin for live preview
useHead({
  link: () => {
    const fonts = [...new Set([form.value.fontHeading, form.value.fontBody].filter(Boolean))]
    if (!fonts.length) return []
    const params = fonts.filter((f): f is string => !!f).map(f => `family=${encodeURIComponent(f)}:wght@300;400;500;600`).join('&')
    return [{ rel: 'stylesheet', href: `https://fonts.googleapis.com/css2?${params}&display=swap`, key: 'admin-preview-fonts' }]
  },
})

watchEffect(() => {
  if (settings.value) {
    form.value = {
      siteName: settings.value.siteName || 'Sense of Jewels',
      siteTagline: settings.value.siteTagline || '',
      siteUrl: settings.value.siteUrl || '',
      contactEmail: settings.value.contactEmail || '',
      contactPhone: settings.value.contactPhone || '',
      address: settings.value.address || '',
      instagramUrl: settings.value.instagramUrl || '',
      whatsappNumber: settings.value.whatsappNumber || '',
      logoUrl: settings.value.logoUrl || '',
      colorPrimary: settings.value.colorPrimary || THEME_DEFAULTS.colorPrimary,
      colorPrimaryContent: settings.value.colorPrimaryContent || THEME_DEFAULTS.colorPrimaryContent,
      colorSecondary: settings.value.colorSecondary || THEME_DEFAULTS.colorSecondary,
      colorAccent: settings.value.colorAccent || THEME_DEFAULTS.colorAccent,
      colorBase100: settings.value.colorBase100 || THEME_DEFAULTS.colorBase100,
      colorBaseContent: settings.value.colorBaseContent || THEME_DEFAULTS.colorBaseContent,
      fontHeading: settings.value.fontHeading ?? THEME_DEFAULTS.fontHeading,
      fontBody: settings.value.fontBody ?? THEME_DEFAULTS.fontBody,
      metaDescription: settings.value.metaDescription || '',
      metaKeywords: settings.value.metaKeywords || '',
      ogImage: settings.value.ogImage || '',
      googleAnalyticsId: settings.value.googleAnalyticsId || '',
      featureShop: settings.value.featureShop ?? 'false',
      featureCart: settings.value.featureCart ?? 'false',
      featureSeo: settings.value.featureSeo ?? 'false',
      featureTheme: settings.value.featureTheme ?? 'false',
      shippingOriginCityId: settings.value.shippingOriginCityId || '',
      shippingOriginCityName: settings.value.shippingOriginCityName || '',
      shippingCouriers: settings.value.shippingCouriers || 'jne,tiki,pos',
      shippingDefaultWeight: settings.value.shippingDefaultWeight || '500',
    }
    // Pre-fill origin city search text
    if (settings.value.shippingOriginCityName) {
      originCitySearch.value = settings.value.shippingOriginCityName
    }
  }
})

async function save() {
  saving.value = true
  try {
    await $fetch('/api/settings', { method: 'PUT', body: form.value })
  } finally {
    saving.value = false
  }
}

// ── Backup ────────────────────────────────────────────────
interface BackupMeta { filename: string; size: number; createdAt: string }

const backups = ref<BackupMeta[]>([])
const backupsLoading = ref(false)
const creatingBackup = ref(false)

async function fetchBackups() {
  backupsLoading.value = true
  try {
    backups.value = await $fetch<BackupMeta[]>('/api/backup')
  } finally {
    backupsLoading.value = false
  }
}

async function triggerBackup() {
  creatingBackup.value = true
  try {
    await $fetch('/api/backup/create', { method: 'POST' })
    await fetchBackups()
  } finally {
    creatingBackup.value = false
  }
}

function formatBackupDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatBackupSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

onMounted(() => fetchBackups())
</script>
